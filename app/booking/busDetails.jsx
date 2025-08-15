import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const BusDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the bus data from route params
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY;
  const BACKEND_URI = process.env.EXPO_PUBLIC_BACKEND_URL;

  console.log("Getting the params", params)
  
  // Debug logging for route ID
  useEffect(() => {
    const busData = params.bus ? JSON.parse(params.bus) : null;
    console.log('BusDetails - Bus data:', busData);
    console.log('BusDetails - Route ID from bus:', busData?.routeId);
  }, [params.bus]);

  // Function to fetch coordinates from city name
  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      throw new Error(`Geocoding failed for ${location}`);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setLoading(true);
        const busData = params.bus ? JSON.parse(params.bus) : null;
        const searchParamsData = params.searchParams ? JSON.parse(params.searchParams) : {};

        if (!busData) {
          throw new Error("No bus data provided");
        }

        // Fetch actual bus details from backend to get correct capacity
        const busResponse = await fetch(`${BACKEND_URI}/buses/${busData.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        let actualBusData = {};
        if (busResponse.ok) {
          const result = await busResponse.json();
          actualBusData = result.data;
        }

        // Fetch coordinates for fromLocation and toLocation
        const fromCoordinates = await fetchCoordinates(
          searchParamsData.fromLocation || "Unknown"
        );
        const toCoordinates = await fetchCoordinates(
          searchParamsData.toLocation || "Unknown"
        );

        setBus({
          _id: busData.id, // Use the correct bus ID
          id: busData.id,
          routeId: busData.routeId, // Preserve the route ID!
          busNumber: actualBusData.busNumber || busData.name || "Unknown Bus",
          name: actualBusData.busNumber || busData.name || "Unknown Operator",
          logo: busData.logo || require("../../assets/images/bus.png"),
          type: actualBusData.type || busData.type || "N/A",
          capacity: actualBusData.capacity || busData.seatsLeft || 25, // Use actual capacity from backend
          depart: busData.depart || "N/A",
          arrive: busData.arrive || "N/A",
          duration: busData.duration || "N/A",
          seatsLeft: busData.seatsLeft || actualBusData.capacity || 0,
          price: busData.price || "N/A",
          terminalFrom: `${searchParamsData.fromLocation || "Unknown"} Terminal`,
          terminalTo: `${searchParamsData.toLocation || "Unknown"} Central Park`,
          date: new Date().toDateString(),
          fromCoordinates,
          toCoordinates,
        });

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching bus details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [params.bus, params.searchParams]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-500 mt-2">Loading bus details...</Text>
      </View>
    );
  }

  if (error || !bus) {
    return (
      <View className="flex-1 justify-center items-center">
        <Feather name="alert-circle" size={48} color="#ccc" />
        <Text className="text-gray-500 mt-2">
          Error: {error || "No bus data available"}
        </Text>
        <Text className="text-gray-400 text-sm">Please try again later</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <MapView
        style={{
          width: "100%",
          height: 500,
          marginBottom: 20,
          borderRadius: 20,
        }}
        initialRegion={{
          latitude:
            (bus.fromCoordinates.latitude + bus.toCoordinates.latitude) / 2,
          longitude:
            (bus.fromCoordinates.longitude + bus.toCoordinates.longitude) / 2,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        <Marker
          coordinate={bus.fromCoordinates}
          title="Departure"
          description={bus.terminalFrom}
        />
        <Marker
          coordinate={bus.toCoordinates}
          title="Arrival"
          description={bus.terminalTo}
        />
        <MapViewDirections
          origin={bus.fromCoordinates}
          destination={bus.toCoordinates}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="#FF6B00"
        />
      </MapView>

      {/* Bus Info */}
      <View className="bg-gray-100 rounded-2xl p-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center space-x-3">
            <Image
              source={bus.logo}
              className="w-24 h-20"
              resizeMode="contain"
            />
          </View>
          <View className="items-center">
            <Text className="text-xl font-semibold text-black">{bus.name}</Text>
            <Text className="text-gray-600">{bus.type}</Text>
          </View>
          <Text className="text-red-600 font-bold text-lg">{bus.price}</Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-gray-600">Departure</Text>
            <Text className="text-black">{bus.depart}</Text>
            <Text className="text-gray-500 text-sm">{bus.terminalFrom}</Text>
          </View>
          <View className="items-center">
            <Feather name="more-horizontal" size={20} color="gray" />
            <Text className="text-gray-500 text-xs mt-1">{bus.duration}</Text>
          </View>
          <View>
            <Text className="text-gray-600">Arrival</Text>
            <Text className="text-black">{bus.arrive}</Text>
            <Text className="text-gray-500 text-sm">{bus.terminalTo}</Text>
          </View>
        </View>
      </View>

      {/* Trip Info */}
      <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-gray-600 mb-1">Date</Text>
        <Text className="text-black font-semibold">{bus.date}</Text>
        <Text className="text-gray-600 mt-4 mb-1">Available Seats</Text>
        <Text className="text-black font-semibold">
          {bus.seatsLeft} seats left
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/booking/seats",
            params: { 
              bus: JSON.stringify(bus),
              searchParams: params.searchParams // Pass along the search parameters
            },
          })
        }
        className="bg-orange-500 p-4 rounded-xl mt-6"
      >
        <Text className="text-white text-center font-bold text-lg">
          Select Seats
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BusDetails;
