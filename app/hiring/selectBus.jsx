import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'

const SelectBus = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState(null)
  const [error, setError] = useState(null)

  const router = useRouter()

  useEffect(() => {
    loadRouteData()
  }, [])
  const loadRouteData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get search parameters from storage
      const hiringSearchData = await AsyncStorage.getItem('hiringSearchData');
      if (hiringSearchData) {
        const { availableRoutes } = JSON.parse(hiringSearchData);
        
        if (availableRoutes.length > 0) {
          // Map available routes to a display-friendly format
          const formattedRouteBuses = availableRoutes.map(item => ({
            id: item.route._id,
            name: item.route.name,
            type: item.bus.type,
            capacity: item.bus.capacity,
            amenities: item.bus.amenities,
price: `₦${(item.route.baseFare * item.bus.capacity).toLocaleString()}`,
            originalPrice: item.route.baseFare * item.bus.capacity,
            selectedBus: item.bus
          }));


          setBuses(formattedRouteBuses);
          setSearchParams({ routes: availableRoutes.map(route => route.route.name) });
        } else {
          setBuses([]);
          setError('No buses available for your selected routes');
        }
      } else {
        setError('Search parameters not found. Please go back and search again.');
      }
    } catch (error) {
      console.error('Error loading routes:', error);
      setError(error.message || 'Failed to load route details');
    } finally {
      setLoading(false);
    }
  }

  const filteredBuses = buses.filter(bus => 
    (bus.name || bus.busNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  )


  const handleSelectBus = async (routeBus) => {
    try {
      // Get the original route data
      const hiringSearchData = await AsyncStorage.getItem('hiringSearchData');
      const parsedData = JSON.parse(hiringSearchData);
      
      // Find the selected route with complete data
      const selectedRoute = parsedData.availableRoutes.find(
        route => route.route._id === routeBus.id
      );
      
      if (selectedRoute) {
        // Store both bus and route data for the next screen
        await AsyncStorage.setItem('selectedBusRoute', JSON.stringify({
          bus: selectedRoute.bus,
          route: selectedRoute.route,
          price: selectedRoute.price
        }));
        
        router.push('/hiring/passengerInfo');
      } else {
        console.error('Selected route not found');
      }
    } catch (error) {
      console.error('Failed to save selected route:', error);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Section */}
      <View className="px-4 py-6 bg-gray-50">
        <View className="flex-row items-center bg-white rounded-full shadow-md px-4 py-3">
          <Ionicons name="search" size={22} color="#FF7B00" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search buses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Bus List */}
      <ScrollView className="flex-1 px-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EA580C" />
            <Text className="text-gray-600 mt-4">Loading available buses...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-red-500 mt-4 text-center">{error}</Text>
            <TouchableOpacity 
              onPress={loadRouteData}
              className="bg-orange-600 rounded-lg px-6 py-3 mt-4"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBuses.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="bus" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              {searchQuery ? 'No buses match your search' : 'No buses available for this search'}
            </Text>
          </View>
        ) : (
          filteredBuses.map((routeBus) => (
            <TouchableOpacity
              key={routeBus.id}
              className="bg-white rounded-lg p-4 mb-4 shadow-md border-l-4 border-orange-600"
              onPress={() => handleSelectBus(routeBus)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View>
                    <Text className="text-xl font-bold text-gray-800">{routeBus.name}</Text>
                    <Text className="text-gray-600 mt-1">{routeBus.type} • {routeBus.capacity} capacity</Text>
                    <Text className="text-orange-600 mt-1 font-medium">Route-based Hiring</Text>
                  
                    <View className="flex-row items-center mt-3">
                      <View className="flex-row items-center">
                        <Ionicons name="people" size={18} color="#FF7B00" />
                        <Text className="text-gray-700 ml-1">{routeBus.capacity} Max</Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap mt-3">
                      {routeBus.amenities && routeBus.amenities.map((amenity, index) => (
                        <View
                          key={index}
                          className="bg-orange-100 rounded-full px-3 py-2 mr-2 mb-2"
                        >
                          <Text className="text-orange-800 text-xs">{amenity}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-2xl font-bold text-orange-600">
                    {routeBus.price}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">Full hire</Text>
                  <View className="bg-orange-600 rounded-lg px-4 py-2 mt-3">
                    <Text className="text-white font-semibold">Select Bus</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default SelectBus