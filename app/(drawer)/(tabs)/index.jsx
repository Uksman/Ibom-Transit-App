import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../../store/authStore";
import useThemeStore from '../../../store/themeStore';
import * as Location from 'expo-location';
import { COLORS, STYLES, getTheme } from '../../../constants/theme';

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [tripType, setTripType] = useState("roundtrip");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  ); // Default to next day
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState("Kaduna");
  const [toLocation, setToLocation] = useState("Calabar");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationType, setLocationType] = useState("from");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentLocations, setRecentLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  
  // Weather state
  const [weather, setWeather] = useState({
    temperature: null,
    condition: null,
    icon: null,
    location: null,
    loading: true,
    error: null
  });
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  const router = useRouter();
  const navigate = useNavigation();
  const BACKEND_URI = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = getTheme(isDarkMode);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeather(prev => ({ ...prev, loading: true }));
        
        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Use default weather data if permission denied
          setWeather({
            temperature: 28,
            condition: 'sunny',
            icon: 'sunny',
            location: 'Nigeria',
            loading: false,
            error: null
          });
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        
        // For demo purposes, use mock weather data
        // In production, you'd call a weather API like OpenWeatherMap
        setWeather({
          temperature: 28,
          condition: 'Sunny',
          icon: 'sunny',
          location: 'Current Location',
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeather({
          temperature: 25,
          condition: 'Clear',
          icon: 'sunny',
          location: 'Nigeria',
          loading: false,
          error: 'Failed to get weather'
        });
      }
    };

    fetchWeather();
  }, []);

  // Fetch locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const response = await fetch(`${BACKEND_URI}/locations`);
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const result = await response.json();
        setLocations(result.data);
        setLocationsError(null);
      } catch (error) {
        setLocationsError(error.message);
        console.error("Error fetching locations:", error);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleDateChange = (event, selectedDate, type) => {
    if (type === "departure") {
      setShowDeparturePicker(false);
      if (selectedDate) {
        setDepartureDate(selectedDate);
        // Ensure return date is at least one day after departure
        if (tripType === "roundtrip" && returnDate <= selectedDate) {
          const nextDay = new Date(selectedDate);
          nextDay.setDate(selectedDate.getDate() + 1);
          setReturnDate(nextDay);
        }
      }
    } else {
      setShowReturnPicker(false);
      if (selectedDate) {
        setReturnDate(selectedDate);
      }
    }
  };

  const handleLocationSelect = (location) => {
    const selectedName = location.name;
    if (locationType === "from") {
      if (selectedName === toLocation) {
        alert("Departure and destination cannot be the same.");
        return;
      }
      setFromLocation(selectedName);
    } else {
      if (selectedName === fromLocation) {
        alert("Destination and departure cannot be the same.");
        return;
      }
      setToLocation(selectedName);
    }
    setRecentLocations((prev) => {
      const filtered = prev.filter((loc) => loc.id !== location.id);
      return [location, ...filtered].slice(0, 3);
    });
    setShowLocationModal(false);
    setSearchQuery("");
  };

  const openLocationPicker = (type) => {
    setLocationType(type);
    setShowLocationModal(true);
    setSearchQuery("");
  };

  const filteredLocations = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return locations;
    }
    const query = searchQuery.toLowerCase().trim();
    return locations.filter((location) =>
      location.name.toLowerCase().includes(query)
    );
  }, [searchQuery, locations]);

  const isValidSearch = () => {
    if (fromLocation === toLocation) return false;
    if (tripType === "roundtrip" && returnDate <= departureDate) return false;
    return true;
  };

  const handleFindBus = async () => {
    if (!isValidSearch()) {
      alert(
        fromLocation === toLocation
          ? "Please select different departure and destination locations."
          : "Return date must be after departure date."
      );
      return;
    }

    // Calculate total passengers (adults + children + user themselves)
    const totalPassengers = adults + children + 1; // +1 for the user themselves

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        source: fromLocation,
        destination: toLocation,
        date: departureDate.toISOString().split("T")[0],
        passengers: totalPassengers,
      }).toString();

      const response = await fetch(
        `${BACKEND_URI}/routes/search?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const result = await response.json();
      setIsLoading(false);

      router.push({
        pathname: "/booking/bus",
        params: {
          routes: JSON.stringify(result.data),
          searchParams: JSON.stringify({
            fromLocation,
            toLocation,
            departureDate,
            returnDate,
            tripType,
            adults,
            children,
            totalPassengers,
          }),
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching routes:", error);
      alert("Failed to fetch routes. Please try again.");
    }
  };

  const LocationPickerModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View className="flex-1 bg-white">
        <View className="bg-orange-500 p-4 flex-row items-center justify-between">
          <Text className="text-white text-lg font-bold">
            Select {locationType === "from" ? "Departure" : "Arrival"} Location
          </Text>
          <TouchableOpacity onPress={() => setShowLocationModal(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {locationsLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-gray-500 mt-2">Loading locations...</Text>
            </View>
          ) : locationsError ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
              <Text className="text-gray-500 mt-2">
                Error: {locationsError}
              </Text>
              <Text className="text-gray-400 text-sm">
                Please try again later
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center bg-gray-100 rounded-lg px-4 mb-4">
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  className="flex-1 p-3"
                  placeholder="Search by city..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView>
                {!searchQuery && recentLocations.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-2 px-4">
                      Recent Locations
                    </Text>
                    {recentLocations.map((location) => (
                      <TouchableOpacity
                        key={`recent-${location.id}`}
                        className="p-4 border-b border-gray-200 bg-gray-50"
                        onPress={() => handleLocationSelect(location)}
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={20}
                            color="#666"
                            className="mr-2"
                          />
                          <Text className="text-lg font-bold">
                            {location.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    <View className="h-4" />
                  </View>
                )}

                {searchQuery && filteredLocations.length === 0 ? (
                  <View className="p-4 items-center">
                    <Ionicons name="search-outline" size={48} color="#ccc" />
                    <Text className="text-gray-500 mt-2">
                      No locations found
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Try different keywords
                    </Text>
                  </View>
                ) : (
                  filteredLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      className="p-4 border-b border-gray-200"
                      onPress={() => handleLocationSelect(location)}
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color="#f97316"
                          className="mr-2"
                        />
                        <Text className="text-lg font-bold">
                          {location.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="bg-orange-500 rounded-b-3xl p-5 pt-10 mb-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-white text-sm">Welcome,</Text>
            <Text className="text-2xl font-extrabold text-white">
              {user.name || "Guest User"}
            </Text>
          </View>
          
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {/* Weather Widget */}
            <TouchableOpacity 
              className="bg-white bg-opacity-20 px-3 py-1.5 rounded-full flex-row items-center"
              onPress={() => setShowWeatherModal(true)}
            >
              {weather.loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons 
                    name={weather.icon === 'sunny' ? 'sunny' : 'partly-sunny'} 
                    size={18} 
                    color="#FFD700" 
                  />
                  <Text className="text-orange-600 text-xs font-semibold ml-1">
                    {weather.temperature}°C
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigate.openDrawer()}
              className="bg-white p-2 rounded-full"
            >
              <Ionicons name="menu" size={20} color="#f97316" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="mb-5 items-center">
          <Image
            source={require("../../../assets/images/download.jpeg")}
            style={{
              width: width * 0.9,
              height: height * 0.2,
              resizeMode: "cover",
              borderRadius: 10,
            }}
          />
        </View>
        <Text className="text-gray-500 text-base">Let&apos;s book</Text>
        <Text className="text-black text-2xl font-bold mb-5">
          your next bus
        </Text>

        {/* From / To */}
        <View className="flex-row justify-between items-center mb-5 bg-gray-50 p-4 rounded-xl">
          <TouchableOpacity
            className="w-[40%]"
            onPress={() => openLocationPicker("from")}
          >
            <Text className="text-xs text-gray-500">From</Text>
            <Text className="text-black text-xl font-bold">{fromLocation}</Text>
            <Text className="text-gray-600">
              {fromLocation ? `${fromLocation} Terminal` : "N/A"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white p-2 rounded-full shadow-sm"
            onPress={() => {
              if (fromLocation === toLocation) {
                alert("Departure and destination cannot be the same.");
                return;
              }
              const tempLocation = fromLocation;
              setFromLocation(toLocation);
              setToLocation(tempLocation);
            }}
          >
            <Ionicons name="swap-horizontal" size={24} color="#f97316" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[40%]"
            onPress={() => openLocationPicker("to")}
          >
            <Text className="text-xs text-gray-500">To</Text>
            <Text className="text-black text-xl font-bold">{toLocation}</Text>
            <Text className="text-gray-600">
              {toLocation ? `${toLocation} Terminal` : "N/A"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trip Type Toggle */}
        <View className="flex-row bg-gray-50 rounded-full my-5 p-1">
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-full ${
              tripType === "oneway" ? "bg-orange-500" : ""
            }`}
            onPress={() => setTripType("oneway")}
          >
            <Text
              className={`${
                tripType === "oneway" ? "text-white font-bold" : "text-gray-600"
              }`}
            >
              One way
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-full ${
              tripType === "roundtrip" ? "bg-orange-500" : ""
            }`}
            onPress={() => setTripType("roundtrip")}
          >
            <Text
              className={`${
                tripType === "roundtrip"
                  ? "text-white font-bold"
                  : "text-gray-600"
              }`}
            >
              Round trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity
            className="w-[48%] bg-gray-50 p-4 rounded-xl"
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text className="text-xs text-gray-500">Departure</Text>
            <Text className="text-black text-base">
              {departureDate.toDateString()}
            </Text>
          </TouchableOpacity>
          {tripType === "roundtrip" && (
            <TouchableOpacity
              className="w-[48%] bg-gray-50 p-4 rounded-xl"
              onPress={() => setShowReturnPicker(true)}
            >
              <Text className="text-xs text-gray-500">Return</Text>
              <Text className="text-black text-base">
                {returnDate.toDateString()}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Pickers */}
        {showDeparturePicker && (
          <DateTimePicker
            value={departureDate}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, "departure")
            }
            minimumDate={new Date()}
          />
        )}
        {showReturnPicker && (
          <DateTimePicker
            value={returnDate}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, "return")}
            minimumDate={
              new Date(departureDate.getTime() + 24 * 60 * 60 * 1000)
            } // One day after departure
          />
        )}

        {/* Passenger Count */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[48%]">
            <Text className="text-sm text-gray-600 mb-2">Adult</Text>
            <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl">
              <TouchableOpacity
                onPress={() => setAdults(Math.max(adults - 1, 0))}
                className="bg-gray-200 p-2 rounded-lg"
              >
                <Text className="text-black text-lg px-2">-</Text>
              </TouchableOpacity>
              <Text className="text-black text-base">{adults}</Text>
              <TouchableOpacity
                onPress={() => setAdults(adults + 1)}
                className="bg-gray-200 p-2 rounded-lg"
              >
                <Text className="text-black text-lg px-2">+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-[48%]">
            <Text className="text-sm text-gray-600 mb-2">Children</Text>
            <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl">
              <TouchableOpacity
                onPress={() => setChildren(Math.max(children - 1, 0))}
                className="bg-gray-200 p-2 rounded-lg"
              >
                <Text className="text-black text-lg px-2">-</Text>
              </TouchableOpacity>
              <Text className="text-black text-base">{children}</Text>
              <TouchableOpacity
                onPress={() => setChildren(children + 1)}
                className="bg-gray-200 p-2 rounded-lg"
              >
                <Text className="text-black text-lg px-2">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Find Bus Button */}
        <TouchableOpacity
          onPress={handleFindBus}
          disabled={isLoading || !isValidSearch()}
          className={`p-3 rounded-xl items-center flex-row justify-center space-x-2 ${
            isLoading || !isValidSearch() ? "bg-orange-300" : "bg-orange-500"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-base">
                Find Your Bus
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <LocationPickerModal />
      
      {/* Weather Modal */}
      <Modal
        visible={showWeatherModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWeatherModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-800">Weather Details</Text>
              <TouchableOpacity onPress={() => setShowWeatherModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Weather Content */}
            <View className="p-6">
              {weather.loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#ff6536" />
                  <Text className="text-gray-500 mt-4">Loading weather...</Text>
                </View>
              ) : (
                <>
                  {/* Current Weather */}
                  <View className="items-center mb-6">
                    <View className="bg-gradient-to-r from-orange-400 to-yellow-400 w-20 h-20 rounded-full items-center justify-center mb-4">
                      <Ionicons 
                        name={weather.icon === 'sunny' ? 'sunny' : 'partly-sunny'} 
                        size={40} 
                        color="white" 
                      />
                    </View>
                    <Text className="text-4xl font-bold text-gray-800 mb-2">
                      {weather.temperature}°C
                    </Text>
                    <Text className="text-lg text-gray-600 mb-1">{weather.condition}</Text>
                    <Text className="text-sm text-gray-500">{weather.location}</Text>
                  </View>
                  
                  {/* Weather Details Grid */}
                  <View className="space-y-4">
                    <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="thermometer" size={24} color="#ff6536" />
                        <Text className="text-gray-700 font-medium ml-3">Feels Like</Text>
                      </View>
                      <Text className="text-gray-900 font-semibold">30°C</Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="water-percent" size={24} color="#3b82f6" />
                        <Text className="text-gray-700 font-medium ml-3">Humidity</Text>
                      </View>
                      <Text className="text-gray-900 font-semibold">65%</Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="weather-windy" size={24} color="#10b981" />
                        <Text className="text-gray-700 font-medium ml-3">Wind Speed</Text>
                      </View>
                      <Text className="text-gray-900 font-semibold">12 km/h</Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="eye" size={24} color="#8b5cf6" />
                        <Text className="text-gray-700 font-medium ml-3">Visibility</Text>
                      </View>
                      <Text className="text-gray-900 font-semibold">10 km</Text>
                    </View>
                  </View>
                  
                  {/* Travel Tip */}
                  <View className="mt-6 bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="bulb" size={20} color="#ff6536" />
                      <Text className="text-orange-800 font-semibold ml-2">Travel Tip</Text>
                    </View>
                    <Text className="text-orange-700 text-sm">
                      Perfect weather for bus travel! Clear skies and comfortable temperature make for a pleasant journey.
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
