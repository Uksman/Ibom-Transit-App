import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import useSocket from "../../hooks/useSocket";

const SeatSelection = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const { socket, joinBusRoom } = useSocket();
  const [bus, setBus] = useState(null);
  const [requiredSeats, setRequiredSeats] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URI = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Memoize parsed params to prevent infinite loops
  const parsedBus = useMemo(() => {
    try {
      return params.bus ? JSON.parse(params.bus) : null;
    } catch (error) {
      console.error('Error parsing bus data:', error);
      return null;
    }
  }, [params.bus]);

  const parsedSearchParams = useMemo(() => {
    try {
      return params.searchParams ? JSON.parse(params.searchParams) : null;
    } catch (error) {
      console.error('Error parsing search params:', error);
      return null;
    }
  }, [params.searchParams]);

  // Function to fetch booked seats from backend
  const fetchBookedSeats = async () => {
    if (!bus || !searchParams) {
      console.log('Missing bus or search params:', { bus, searchParams });
      return;
    }
    
    const busId = bus._id || bus.id;
    if (!busId) {
      console.error('Bus ID is missing from bus object:', bus);
      setError('Bus information is incomplete');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching booked seats for:', { busId, date: searchParams.departureDate });
      const response = await fetch(
        `${BACKEND_URI}/bookings/check-availability?busId=${busId}&date=${searchParams.departureDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.bookedSeats) {
          setBookedSeats(data.data.bookedSeats);
        }
      } else {
        console.error('Failed to fetch booked seats');
        setError('Failed to fetch seat availability');
      }
    } catch (error) {
      console.error('Error fetching booked seats:', error);
      setError('Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

  // Initialize passenger data from params
  useEffect(() => {
    if (parsedBus && (!bus || JSON.stringify(bus) !== JSON.stringify(parsedBus))) {
      setBus(parsedBus);
    }
    
    if (parsedSearchParams && (!searchParams || JSON.stringify(searchParams) !== JSON.stringify(parsedSearchParams))) {
      setSearchParams(parsedSearchParams);
      // Calculate required seats: adults + children + 1 (user themselves)
      const totalPassengers = parsedSearchParams.totalPassengers || 
        (parsedSearchParams.adults + parsedSearchParams.children + 1);
      setRequiredSeats(totalPassengers);
    }
  }, [parsedBus, parsedSearchParams, bus, searchParams]);

  // Fetch booked seats when bus and search params are available
  useEffect(() => {
    if (bus && searchParams) {
      fetchBookedSeats();
      joinBusRoom(bus._id); // Join the bus room for real-time updates
    }
  }, [bus, searchParams]);

  useEffect(() => {
    if (socket) {
      socket.on('seat-updated', (data) => {
        if (data.busId === bus._id) {
          fetchBookedSeats(); // Refetch booked seats on update
        }
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        socket.off('seat-updated');
      }
    };
  }, [socket, bus]);

  const handleSeatToggle = (seat) => {
    if (bookedSeats.includes(seat)) return;
    
    setSelectedSeats((prev) => {
      const isCurrentlySelected = prev.includes(seat);
      
      if (isCurrentlySelected) {
        // Remove seat
        return prev.filter((s) => s !== seat);
      } else {
        // Add seat - check if we haven't exceeded the limit
        if (prev.length >= requiredSeats) {
          Alert.alert(
            "Maximum Seats Selected",
            `You can only select ${requiredSeats} seat(s) for ${requiredSeats} passenger(s).`,
            [{ text: "OK" }]
          );
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

const renderSeats = () => {
    const capacity = bus?.capacity || 0;
    const seatsPerRow = 4; // 2 seats on each side with aisle in middle
    const totalRows = Math.ceil(capacity / seatsPerRow);
    
    let seatLayout = [];
    let seatNumber = 1;

    // Driver's section
    seatLayout.push(
      <View
        key="driver-section"
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 24,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            backgroundColor: "#4b5563",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="user" size={24} color="white" />
          <Text style={{ color: "white", fontSize: 12 }}>Driver</Text>
        </View>
        <View style={{ width: 20 }} />
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#6b7280",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="circle" size={20} color="white" />
        </View>
      </View>
    );

    // Render seats in rows
    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];
      
      for (let col = 0; col < seatsPerRow; col++) {
        if (seatNumber > capacity) break;
        
        const seatId = `S${seatNumber}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        
        // Add aisle space between seats 2 and 3
        if (col === 2) {
          rowSeats.push(
            <View key={`aisle-${row}`} style={{ width: 20, height: 60 }} />
          );
        }
        
        rowSeats.push(
          <TouchableOpacity
            key={seatId}
            disabled={isBooked}
            onPress={() => handleSeatToggle(seatId)}
            style={{
              width: 50,
              height: 60,
              margin: 4,
              borderRadius: 10,
              backgroundColor: isBooked
                ? "#e5e7eb"
                : isSelected
                ? "#dc2626"
                : "#22c55e",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
              borderWidth: 1,
              borderColor: isBooked ? "#d1d5db" : "#fff",
            }}
          >
            <MaterialIcons
              name="event-seat"
              size={20}
              color={isBooked ? "#6b7280" : "white"}
            />
            <Text
              style={{
                color: isBooked ? "#6b7280" : "white",
                fontSize: 10,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {seatId}
            </Text>
          </TouchableOpacity>
        );
        
        seatNumber++;
      }
      
      // Add the row to the layout
      seatLayout.push(
        <View
          key={`row-${row}`}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {rowSeats}
        </View>
      );
      
      // Add row number indicator
      seatLayout.push(
        <View
          key={`row-indicator-${row}`}
          style={{
            position: "absolute",
            left: 8,
            top: row * 68 + 84, // Adjust based on row height
            backgroundColor: "#f3f4f6",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "#6b7280", fontWeight: "500" }}>
            Row {row + 1}
          </Text>
        </View>
      );
    }

    return seatLayout;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#f25d0d" />
        <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 16 }}>Loading seats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", padding: 16 }}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={{ marginTop: 16, color: "#ef4444", fontSize: 18, fontWeight: "600", textAlign: "center" }}>Error</Text>
        <Text style={{ marginTop: 8, color: "#6b7280", fontSize: 14, textAlign: "center" }}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            fetchBookedSeats();
          }}
          style={{
            backgroundColor: "#f25d0d",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!bus) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", padding: 16 }}>
        <Feather name="info" size={48} color="#6b7280" />
        <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 16, textAlign: "center" }}>No bus information available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ padding: 16 }}>
        {/* Bus Info */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 4 }}>
            {bus.busNumber} - {bus.type}
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>Capacity: {bus.capacity} seats</Text>
        </View>

        {/* Bus Layout Container */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 20,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#22c55e",
                  borderRadius: 4,
                  marginRight: 8,
                }}
              />
              <Text style={{ color: "#374151", fontSize: 12 }}>Available</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#dc2626",
                  borderRadius: 4,
                  marginRight: 8,
                }}
              />
              <Text style={{ color: "#374151", fontSize: 12 }}>Selected</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 4,
                  marginRight: 8,
                }}
              />
              <Text style={{ color: "#374151", fontSize: 12 }}>Booked</Text>
            </View>
          </View>

          {/* Aisle Indicator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic" }}>
              ← Aisle →
            </Text>
          </View>

          {/* Seat Layout */}
          <View style={{ position: "relative", minHeight: 200 }}>
            {renderSeats()}
          </View>
        </View>

        {/* Passenger Information */}
        {searchParams && (
          <View
            style={{
              backgroundColor: "#e0f2fe",
              padding: 16,
              borderRadius: 12,
              marginTop: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#0891b2",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Feather name="users" size={20} color="#0891b2" />
              <Text style={{ color: "#0891b2", fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
                Passenger Information
              </Text>
            </View>
            <Text style={{ color: "#164e63", fontSize: 14 }}>
              Adults: {searchParams.adults} • Children: {searchParams.children} • You: 1
            </Text>
            <Text style={{ color: "#164e63", fontSize: 14, fontWeight: "600", marginTop: 4 }}>
              Total Passengers: {requiredSeats} • Required Seats: {requiredSeats}
            </Text>
          </View>
        )}

        {/* Selected Seats */}
        <View
          style={{
            backgroundColor: "#f3f4f6",
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 16 }}>
              Selected Seats ({selectedSeats.length}/{requiredSeats}):
            </Text>
            {selectedSeats.length === requiredSeats && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="check-circle" size={16} color="#22c55e" />
                <Text style={{ color: "#22c55e", fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
                  Complete
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: selectedSeats.length === requiredSeats ? "#22c55e" : "#000",
              fontWeight: "600",
              marginTop: 4,
              fontSize: 16,
            }}
          >
            {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
          </Text>
          {selectedSeats.length < requiredSeats && requiredSeats > 0 && (
            <Text style={{ color: "#f59e0b", fontSize: 12, marginTop: 4 }}>
              Please select {requiredSeats - selectedSeats.length} more seat(s)
            </Text>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          disabled={selectedSeats.length !== requiredSeats}
          onPress={() => 
            router.push({
              pathname: "/booking/travellerDetail",
              params: {
                selectedSeats: JSON.stringify(selectedSeats),
                bus: params.bus,
                searchParams: params.searchParams,
              },
            })
          }
          style={{
            backgroundColor:
              selectedSeats.length === requiredSeats ? "#f25d0d" : "#f25d0d80",
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Continue {selectedSeats.length === requiredSeats ? "✓" : `(${selectedSeats.length}/${requiredSeats})`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SeatSelection;
