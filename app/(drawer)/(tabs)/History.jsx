import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../../../services/api";
import useAuthStore from "../../../store/authStore";
import { LinearGradient } from "expo-linear-gradient";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user, token, fetchCurrentUser } = useAuthStore();

  // Normalize backend data
  const normalizeData = (bookings, hirings) => {
    const normalizedBookings = bookings.map((booking) => {
      console.log("Booking selectedSeats:", booking.route.departureTime);
      const seatCount =
        (booking.selectedSeats?.outbound?.length || 0) +
        (booking.selectedSeats?.return?.length || 0);
      return {
        id: booking._id,
        type: "booking",
        route: `${booking.route?.source || "Unknown"} to ${
          booking.route?.destination || "Unknown"
        }`,
        date: new Date(booking.departureDate).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }), // e.g., "23 Jul 2025"
        time: booking.route.departureTime,
        status: booking.status,
        price: `₦${booking.totalFare.toFixed(2)}`,
        busNumber: booking.bus?.busNumber || "Unknown",
        seats: seatCount > 0 ? seatCount : 0,
      };
    });

    const normalizedHirings = hirings.map((hiring) => ({
      id: hiring._id,
      type: "hiring",
      route: `${hiring.startLocation} to ${hiring.endLocation}`,
      date: new Date(hiring.startDate).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: new Date(hiring.startDate).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: hiring.status,
      price: `₦${hiring.totalCost.toFixed(2)}`,
      busNumber: hiring.bus?.busNumber || "Unknown",
      duration: hiring.isRoundTrip
        ? `${Math.ceil(
            (new Date(hiring.endDate) - new Date(hiring.startDate)) /
              (1000 * 60 * 60 * 24)
          )} days`
        : "One-Way",
    }));

    return [...normalizedBookings, ...normalizedHirings].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  // Fetch data from backend
  const fetchHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Ensure we have a token before making API calls
      if (!token) {
        await fetchCurrentUser();
        // Check if we still don't have a token after fetching user
        const currentStore = useAuthStore.getState();
        if (!currentStore.token) {
          throw new Error("Authentication required");
        }
      }
      
      const [bookingsResponse, hiringsResponse] = await Promise.allSettled([
        apiService.getUserBookings(),
        apiService.getUserHirings(),
      ]);

      const bookings =
        bookingsResponse.status === "fulfilled"
          ? bookingsResponse.value.data || []
          : [];
      const hirings =
        hiringsResponse.status === "fulfilled"
          ? hiringsResponse.value.data || []
          : [];

      const normalizedData = normalizeData(bookings, hirings);
      setHistoryData(normalizedData);
    } catch (err) {
      setError(err.message || "Failed to fetch history");
      console.error("Fetch error:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Handle pull to refresh
  const onRefresh = () => {
    fetchHistory(true);
  };

  useEffect(() => {
    // Only fetch history if we have a user (indicating auth is complete)
    if (user) {
      fetchHistory();
    }
  }, [user, token]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return {
          backgroundColor: "#DCFCE7", // Green for success
          textColor: "#15803D",
          borderColor: "#BBF7D0",
        };
      case "cancelled":
        return {
          backgroundColor: "#FEE2E2", // Red for cancelled
          textColor: "#B91C1C",
          borderColor: "#FECACA",
        };
      case "pending":
      case "upcoming":
        return {
          backgroundColor: "#FED7AA", // Light orange for pending
          textColor: "#C2410C",
          borderColor: "#FDBA74",
        };
      default:
        return {
          backgroundColor: "#F3F4F6", // Neutral gray
          textColor: "#4B5563",
          borderColor: "#E5E7EB",
        };
    }
  };

  const getTypeColor = (type) => {
    return type === "booking"
      ? { backgroundColor: "#FFEDD5", textColor: "#EA580C" } // Orange for booking
      : { backgroundColor: "#A5F3FC", textColor: "#0E7490" }; // Teal for hiring
  };

  const getTypeIcon = (type) => {
    return type === "booking" ? "ticket-outline" : "bus-outline";
  };

  const renderHistoryItem = (item) => (
    <View key={item.id}>
      <TouchableOpacity
        className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-orange-100"
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`View ${item.type} from ${item.route}`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-3">
              <View
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: getTypeColor(item.type).backgroundColor,
                }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: getTypeColor(item.type).textColor }}
                >
                  {item.type}
                </Text>
              </View>
              <Ionicons
                name={getTypeIcon(item.type)}
                size={24}
                color="#EA580C" // Orange icon
                style={{ marginLeft: 8 }}
              />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {item.route}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Bus: {item.busNumber}
            </Text>
          </View>
          <View
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: getStatusColor(item.status).backgroundColor,
              borderColor: getStatusColor(item.status).borderColor,
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: getStatusColor(item.status).textColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#EA580C" />
            <Text className="text-sm text-gray-600 ml-2">{item.date}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={18} color="#EA580C" />
            <Text className="text-sm text-gray-600 ml-2">{item.time}</Text>
          </View>
        </View>

        <View className="mt-4 pt-4 border-t border-orange-100 flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-900">
            {item.price}
          </Text>
          {item.type === "booking" ? (
            <Text className="text-sm text-gray-600">
              {item.seats > 0 ? `Seats: ${item.seats}` : "No seats selected"}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600">
              Duration: {item.duration}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const bookings = historyData.filter((item) => item.type === "booking");
  const hirings = historyData.filter((item) => item.type === "hiring");

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Orange Gradient */}
      <LinearGradient
        colors={["#F97316", "#EA580C"]}
        className="px-5 py-8 shadow-md"
      >
        <Text className="text-3xl font-bold text-white">Trip History</Text>
        <Text className="text-base text-orange-100 mt-1">
          View your bookings and bus hiring history
        </Text>
      </LinearGradient>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-gray-600 mt-4 text-lg font-medium">
            Loading your trips...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View className="mx-5 mt-5 p-5 bg-red-50 rounded-2xl border border-red-200">
          <Text className="text-red-800 text-base font-medium">{error}</Text>
          <TouchableOpacity
            onPress={fetchHistory}
            className="mt-4 bg-orange-600 px-5 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <ScrollView 
          className="flex-1 px-5 pt-5"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F97316']} // Android
              tintColor="#F97316" // iOS
              title="Pull to refresh"
              titleColor="#6B7280"
            />
          }
        >
          {bookings.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-900 mb-3">
                Bus Bookings
              </Text>
              {bookings.map(renderHistoryItem)}
            </View>
          )}

          {hirings.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-900 mb-3">
                Bus Hirings
              </Text>
              {hirings.map(renderHistoryItem)}
            </View>
          )}

          {bookings.length === 0 && hirings.length === 0 && (
            <View className="flex-1 justify-center items-center mt-10">
              <Ionicons name="bus-outline" size={64} color="#F97316" />
              <Text className="text-gray-900 text-lg font-medium mt-4">
                No trips found
              </Text>
              <Text className="text-gray-600 text-base text-center mt-2 px-5">
                Book a trip or hire a bus to see your history here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default History;
