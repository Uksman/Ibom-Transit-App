import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const Hire = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departureDate: new Date(),
    departureTime: new Date(),
    returnDate: new Date(),
    returnTime: new Date(),
    tripType: "oneWay",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("departure");
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const router = useRouter();
  const { width } = Dimensions.get("window");

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [datePickerType === "departure" ? "departureDate" : "returnDate"]:
          selectedDate,
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setFormData((prev) => ({
        ...prev,
        [datePickerType === "departure" ? "departureTime" : "returnTime"]:
          selectedTime,
      }));
    }
    setShowTimePicker(false);
  };

  const normalizeDate = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const searchAvailableRoutes = async () => {
    // Validate form data
    if (!formData.from.trim() || !formData.to.trim()) {
      Alert.alert(
        "Error",
        "Please enter both departure and destination cities"
      );
      return;
    }

    try {
      setLoading(true);

      // First, find routes that match the from/to locations
      const routesResponse = await fetch(`${API_BASE_URL}/routes`);
      const routesData = await routesResponse.json();

      if (!routesResponse.ok) {
        throw new Error(routesData.message || "Failed to fetch routes");
      }

      // Combine date and time for start date
      const startDateTime = new Date(formData.departureDate);
      startDateTime.setHours(formData.departureTime.getHours());
      startDateTime.setMinutes(formData.departureTime.getMinutes());

      // Normalize date for comparison to ensure timezones don't interfere
      const normalizedDate = normalizeDate(startDateTime);
      
      // Filter routes based on source and destination
      const matchingRoutes = routesData.data
        ? routesData.data.filter(
            (route) =>
              route.source &&
              route.destination &&
              route.source
                .toLowerCase()
                .includes(formData.from.toLowerCase()) &&
              route.destination
                .toLowerCase()
                .includes(formData.to.toLowerCase()) &&
              route.isActive
          )
        : [];

      // Get the day of the week for the departure date to filter routes by operating days
      const departureDay = startDateTime.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Filter routes that operate on the selected departure day (like booking does)
      const operatingRoutes = matchingRoutes.filter(route => 
        route.operatingDays && route.operatingDays.includes(departureDay)
      );

      if (operatingRoutes.length === 0) {
        if (matchingRoutes.length > 0) {
          Alert.alert(
            "No Routes Operating Today",
            `Found ${matchingRoutes.length} route(s) from ${formData.from} to ${formData.to}, but none operate on ${departureDay}. Please try a different date.`
          );
        } else {
          Alert.alert(
            "No Routes Available",
            `No routes found from ${formData.from} to ${formData.to}. Please check your locations or try different cities.`
          );
        }
        return;
      }

      // Combine date and time for end date (for round trip)
      let endDateTime = new Date(startDateTime);
      if (formData.tripType === "roundTrip") {
        endDateTime = new Date(formData.returnDate);
        endDateTime.setHours(formData.returnTime.getHours());
        endDateTime.setMinutes(formData.returnTime.getMinutes());
      } else {
        // For one-way trips, set end date to same day but later time (for hiring duration)
        endDateTime.setHours(23, 59, 59, 999);
      }

      // Check availability for each operating route
      const availableRoutesWithBuses = [];

      console.log("operatingRoutes", operatingRoutes);

      for (const route of operatingRoutes) {
        // Check if the route's bus is available for the specified dates
        const availabilityParams = new URLSearchParams({
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        });

        try {
          const availabilityResponse = await fetch(
            `${API_BASE_URL}/hiring/availability?${availabilityParams}`
          );
          const availabilityData = await availabilityResponse.json();

          console.log("availabilityResponse", availabilityResponse);

          console.log("availabilityData", availabilityData);

          if (
            availabilityResponse.ok &&
            availabilityData.data &&
            availabilityData.data.available
          ) {
            // Find the bus for this route in the available buses
            const routeBusId =
              typeof route.bus === "object" ? route.bus._id : route.bus;
            const routeBus = availabilityData.data.availableBuses.find(
              (bus) => bus._id === routeBusId || bus.id === routeBusId
            );

            if (routeBus) {
              availableRoutesWithBuses.push({
                route,
                bus: routeBus,
                price: route.baseFare * routeBus.capacity, // Hiring price = baseFare * bus capacity
              });
            }
          }
        } catch (error) {
          console.warn(
            `Error checking availability for route ${route._id}:`,
            error
          );
        }
      }

      if (availableRoutesWithBuses.length === 0) {
        Alert.alert(
          "No Available Buses",
          "No buses are available for the selected route and dates. Please try different dates or routes."
        );
        return;
      }

      // Store search data and results for next screen
      const searchData = {
        searchParams: {
          from: formData.from,
          to: formData.to,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          tripType: formData.tripType,
          isRoundTrip: formData.tripType === "roundTrip",
        },
        availableRoutes: availableRoutesWithBuses,
        totalAvailable: availableRoutesWithBuses.length,
      };

      await AsyncStorage.setItem(
        "hiringSearchData",
        JSON.stringify(searchData)
      );
      router.push("/hiring/selectBus");
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Failed to search for available routes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Beautiful Gradient Header */}
      <LinearGradient
        colors={["#ea580c", "#fb923c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerIconContainer}>
            <FontAwesome5 name="bus-alt" size={32} color="white" />
          </View>
          <Text style={styles.headerTitle}>Hire a Bus</Text>
          <Text style={styles.headerSubtitle}>
            Your premium travel companion
          </Text>
          <View style={styles.decorativeElements}>
            <View style={styles.decorativeDot} />
            <View style={[styles.decorativeDot, { opacity: 0.7 }]} />
            <View style={[styles.decorativeDot, { opacity: 0.4 }]} />
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Trip Type Selection Card */}
          <View style={styles.tripTypeCard}>
            <Text style={styles.sectionTitle}>Trip Type</Text>
            <View style={styles.tripTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.tripTypeButton,
                  formData.tripType === "oneWay" && styles.tripTypeButtonActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, tripType: "oneWay" }))
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    formData.tripType === "oneWay"
                      ? ["#ea580c", "#fb923c"]
                      : ["#f8f9fa", "#f8f9fa"]
                  }
                  style={styles.tripTypeGradient}
                >
                  <MaterialIcons
                    name="trending-flat"
                    size={20}
                    color={formData.tripType === "oneWay" ? "white" : "#6c757d"}
                  />
                  <Text
                    style={[
                      styles.tripTypeText,
                      formData.tripType === "oneWay" &&
                        styles.tripTypeTextActive,
                    ]}
                  >
                    One Way
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tripTypeButton,
                  formData.tripType === "roundTrip" &&
                    styles.tripTypeButtonActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, tripType: "roundTrip" }))
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    formData.tripType === "roundTrip"
                      ? ["#ff7b00", "#ff9500"]
                      : ["#f8f9fa", "#f8f9fa"]
                  }
                  style={styles.tripTypeGradient}
                >
                  <MaterialIcons
                    name="swap-horiz"
                    size={20}
                    color={
                      formData.tripType === "roundTrip" ? "white" : "#6c757d"
                    }
                  />
                  <Text
                    style={[
                      styles.tripTypeText,
                      formData.tripType === "roundTrip" &&
                        styles.tripTypeTextActive,
                    ]}
                  >
                    Round Trip
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Journey Details Card */}
          <View style={styles.journeyCard}>
            <Text style={styles.sectionTitle}>Journey Details</Text>

            {/* From Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>From</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="radio-button-on" size={16} color="#ff7b00" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter departure city"
                  placeholderTextColor="#9ca3af"
                  value={formData.from}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, from: text }))
                  }
                />
              </View>
            </View>

            {/* Route Connector */}
            <View style={styles.routeConnector}>
              <View style={styles.routeLine} />
              <TouchableOpacity style={styles.swapButton}>
                <Ionicons name="swap-vertical" size={18} color="#ff7b00" />
              </TouchableOpacity>
            </View>

            {/* To Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>To</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="location" size={16} color="#ff9500" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter destination city"
                  placeholderTextColor="#9ca3af"
                  value={formData.to}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, to: text }))
                  }
                />
              </View>
            </View>
          </View>

          {/* Date & Time Card */}
          <View style={styles.dateTimeCard}>
            <Text style={styles.sectionTitle}>Schedule</Text>

            {/* Departure */}
            <View style={styles.scheduleGroup}>
              <Text style={styles.scheduleLabel}>Departure</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType("departure");
                    setShowDatePicker(true);
                  }}
                >
                  <MaterialIcons name="event" size={20} color="#ff7b00" />
                  <Text style={styles.dateTimeText}>
                    {formData.departureDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType("departure");
                    setShowTimePicker(true);
                  }}
                >
                  <MaterialIcons name="access-time" size={20} color="#ff7b00" />
                  <Text style={styles.dateTimeText}>
                    {formData.departureTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Return (for round trip) */}
            {formData.tripType === "roundTrip" && (
              <View style={styles.scheduleGroup}>
                <Text style={styles.scheduleLabel}>Return</Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setDatePickerType("return");
                      setShowDatePicker(true);
                    }}
                  >
                    <MaterialIcons name="event" size={20} color="#ff9500" />
                    <Text style={styles.dateTimeText}>
                      {formData.returnDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      setDatePickerType("return");
                      setShowTimePicker(true);
                    }}
                  >
                    <MaterialIcons
                      name="access-time"
                      size={20}
                      color="#ea580c"
                    />
                    <Text style={styles.dateTimeText}>
                      {formData.returnTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              loading && styles.searchButtonDisabled,
            ]}
            onPress={searchAvailableRoutes}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                loading
                  ? ["#9ca3af", "#9ca3af"]
                  : ["#ea580c", "#ff9500", "#ffb347"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchButtonGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <MaterialIcons
                    name="hourglass-empty"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.searchButtonText}>Searching...</Text>
                </View>
              ) : (
                <View style={styles.searchContainer}>
                  <FontAwesome5 name="search" size={20} color="white" />
                  <Text style={styles.searchButtonText}>
                    Find Available Routes
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Date & Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={
            datePickerType === "departure"
              ? formData.departureDate
              : formData.returnDate
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={
            datePickerType === "departure"
              ? formData.departureTime
              : formData.returnTime
          }
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

export default Hire;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Header Styles
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  headerContent: {
    alignItems: "center",
  },

  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },

  decorativeElements: {
    flexDirection: "row",
    marginTop: 20,
    gap: 8,
  },

  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },

  // Content Styles
  scrollContent: {
    flex: 1,
  },

  formContainer: {
    padding: 20,
    paddingTop: 30,
    gap: 20,
  },

  // Card Styles
  tripTypeCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  journeyCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  dateTimeCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },

  // Trip Type Styles
  tripTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },

  tripTypeButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  tripTypeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },

  tripTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },

  tripTypeTextActive: {
    color: "white",
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },

  inputIcon: {
    marginRight: 12,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 12,
    fontWeight: "500",
  },

  // Route Connector
  routeConnector: {
    alignItems: "center",
    marginVertical: 8,
    position: "relative",
  },

  routeLine: {
    position: "absolute",
    left: 22,
    top: -8,
    bottom: -8,
    width: 2,
    backgroundColor: "#cbd5e1",
  },

  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },

  // Schedule Styles
  scheduleGroup: {
    marginBottom: 16,
  },

  scheduleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },

  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },

  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },

  dateTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },

  // Search Button
  searchButton: {
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  searchButtonDisabled: {
    opacity: 0.7,
  },

  searchButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  searchButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
});
