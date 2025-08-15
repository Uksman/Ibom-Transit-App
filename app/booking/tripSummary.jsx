import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Paystack, paystackProps } from "react-native-paystack-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';


const TripSummary = () => {
  const params = useLocalSearchParams();
  const selectedSeats = params.selectedSeats ? JSON.parse(params.selectedSeats) : [];
  const travellerDetails = params.travellerDetails ? JSON.parse(params.travellerDetails) : [];
  const bus = params.bus ? JSON.parse(params.bus) : {};
  const searchParams = params.searchParams ? JSON.parse(params.searchParams) : {};
  
  // Construct trip details from the new data structure
  const basePricePerPerson = parseFloat(bus.price?.replace(/[^\d.]/g, '') || 0); // Extract numeric value from price
  
  // Calculate the actual price per person based on trip type
  let actualPricePerPerson = basePricePerPerson;
  if (searchParams.tripType === "roundtrip") {
    // Apply round trip pricing: 2x the one-way price
    actualPricePerPerson = basePricePerPerson * 2;
  }
  
  const tripDetails = {
    from: searchParams.fromLocation,
    to: searchParams.toLocation,
    date: searchParams.departureDate,
    returnDate: searchParams.returnDate,
    tripType: searchParams.tripType,
    time: bus.depart,
    duration: bus.duration,
    busType: bus.type,
    price: actualPricePerPerson, // This now includes round trip calculation
    basePricePerPerson: basePricePerPerson, // Keep original for display
    passengerName: travellerDetails[0]?.firstName + ' ' + travellerDetails[0]?.lastName,
    passengerEmail: travellerDetails[0]?.email,
    passengerPhone: travellerDetails[0]?.phone,
    seatNumber: selectedSeats.join(', '),
    totalPassengers: travellerDetails.length
  };

  // Debug logging for payment amounts
  console.log('Payment Debug Info:');
  console.log('Bus price string:', bus.price);
  console.log('Parsed price (NGN):', tripDetails.price);
  console.log('Total passengers:', travellerDetails.length);
  console.log('Total amount (NGN):', (tripDetails.price * travellerDetails.length));
  console.log('Amount for Paystack (kobo):', (tripDetails.price * travellerDetails.length));

  const tpublicKey = process.env.EXPO_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY;

  const paystackWebViewRef = useRef(paystackProps.PayStackRef);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const router = useRouter();

  // Step 1: Create booking first
  const handleCreateBooking = async () => {
    console.log('=== CREATE BOOKING STARTED ===');
    console.log('Bus data:', bus);
    console.log('Route ID from bus:', bus.routeId);
    
    if (!travellerDetails.length || !selectedSeats.length) {
      setErrorMessage('Missing traveller or seat information');
      return;
    }

    if (!bus.routeId) {
      setErrorMessage('Route information is missing. Please go back and select a route again.');
      Alert.alert('Route Error', 'Route information is missing. Please go back and select a route again.');
      return;
    }

    try {
      setIsCreatingBooking(true);
      setErrorMessage('');
      
      // Check authentication
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again to continue');
        router.push('/auth/Login');
        return;
      }

      // Prepare booking data
      const bookingType = searchParams.tripType === "roundtrip" ? 'Round-Trip' : 'One-Way';
      
      const bookingData = {
        bus: bus._id || bus.id,
        route: bus.routeId, // Use the actual route ID from the bus data
        bookingType: bookingType,
        selectedSeats: {
          outbound: selectedSeats,
          return: searchParams.tripType === "roundtrip" ? selectedSeats : [] // For round trip, use same seats for return
        },
        passengers: travellerDetails.map((passenger, index) => ({
          name: `${passenger.firstName} ${passenger.lastName}`,
          age: passenger.age ? parseInt(passenger.age) : 18, // Default to 18 if no age provided
          gender: passenger.gender && ['Male', 'Female', 'Other'].includes(passenger.gender) ? passenger.gender : 'Other',
          seatNumber: selectedSeats[index]
        })),
        departureDate: searchParams.departureDate,
        returnDate: searchParams.tripType === "roundtrip" ? searchParams.returnDate : null,
        totalFare: (tripDetails.price * travellerDetails.length)
      };

      console.log('Booking data:', JSON.stringify(bookingData, null, 2));

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      console.log('Booking response:', result);

      if (response.ok && result.status === 'success') {
        const createdBookingId = result.data._id;
        const bookingNumber = result.data.bookingNumber;
        
        setBookingId(createdBookingId);
        
        // Update tripDetails with booking info
        tripDetails.bookingId = createdBookingId;
        tripDetails.bookingNumber = bookingNumber;
        
        Alert.alert(
          'Booking Created Successfully! ✅',
          `Your booking has been created.\n\nBooking Number: ${bookingNumber}\nAmount: ₦${((tripDetails.price * travellerDetails.length)).toFixed(2)}\n\nProceed to payment to complete your booking.`,
          [
            {
              text: 'Proceed to Payment',
              onPress: () => handlePaymentCard(),
              style: 'default'
            },
            {
              text: 'Pay Later',
              onPress: () => {
                Alert.alert('Payment Required', 'You can complete payment from your booking history.');
                router.push('/(tabs)');
              },
              style: 'cancel'
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorMessage(error.message || 'Failed to create booking. Please try again.');
      Alert.alert('Booking Error', error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Step 2: Initialize payment after booking is created
  const handlePaymentCard = async () => {
    if (!bookingId) {
      setErrorMessage('Booking must be created first');
      return;
    }

    if (paystackWebViewRef.current) {
      console.log('Starting payment transaction...');
      paystackWebViewRef.current.startTransaction();
    } else {
      console.log('Paystack ref not available');
      Alert.alert('Payment Error', 'Payment system not ready. Please try again.');
    }
  };

  useEffect(() => {
    if (!tripDetails || !selectedSeats.length) {
      // Navigate back or show error as no data
      setErrorMessage("Incomplete booking details. Please go back and complete the booking.");
    }
  }, [tripDetails, selectedSeats]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Error message display */}
        {errorMessage ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <Text>{errorMessage}</Text>
          </View>
        ) : null}
        <View className="mb-6">
          <Text className="text-gray-500 mt-1">
            Review your booking details
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {tripDetails.from || "N/A"}
              </Text>
              <Text className="text-gray-500">Departure</Text>
            </View>
            <View className="items-center">
              <Ionicons name={tripDetails.tripType === "roundtrip" ? "swap-horizontal" : "arrow-forward"} size={24} color="#6B7280" />
              <Text className="text-gray-500 text-sm">
                {tripDetails.duration || "N/A"}
              </Text>
              {tripDetails.tripType === "roundtrip" && (
                <Text className="text-xs text-orange-600 font-medium">Round Trip</Text>
              )}
            </View>
            <View className="flex-1 items-end">
              <Text className="text-lg font-semibold text-gray-800">
                {tripDetails.to || "N/A"}
              </Text>
              <Text className="text-gray-500">Arrival</Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-4">
            {tripDetails.bookingNumber && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Booking Number</Text>
                <Text className="text-gray-800 font-medium font-mono">
                  {tripDetails.bookingNumber}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Departure Date</Text>
              <Text className="text-gray-800 font-medium">
                {tripDetails.date ? new Date(tripDetails.date).toDateString() : "N/A"}
              </Text>
            </View>
            {tripDetails.tripType === "roundtrip" && tripDetails.returnDate && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Return Date</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(tripDetails.returnDate).toDateString()}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Time</Text>
              <Text className="text-gray-800 font-medium">
                {tripDetails.time || "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Bus Type</Text>
              <Text className="text-gray-800 font-medium">
                {tripDetails.busType || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Passenger Details ({travellerDetails.length} passenger
            {travellerDetails.length > 1 ? "s" : ""})
          </Text>

          {travellerDetails.map((passenger, index) => (
            <View
              key={index}
              className={`${
                index > 0 ? "border-t border-gray-100 pt-3 mt-3" : ""
              }`}
            >
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {index === 0 ? "You" : `Passenger ${index + 1}`} - Seat{" "}
                {selectedSeats[index]}
              </Text>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 text-sm">Name</Text>
                <Text className="text-gray-800 font-medium text-sm">
                  {passenger.firstName} {passenger.lastName}
                </Text>
              </View>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 text-sm">Email</Text>
                <Text className="text-gray-800 text-sm">
                  {passenger.email || "N/A"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">Phone</Text>
                <Text className="text-gray-800 text-sm">
                  {passenger.phone || "N/A"}
                </Text>
              </View>
            </View>
          ))}

          <View className="border-t border-gray-100 pt-3 mt-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-medium">Total Seats</Text>
              <Text className="text-gray-800 font-semibold">
                {selectedSeats.join(", ")}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Price Details
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Base Fare (per person)</Text>
            <Text className="text-gray-800">₦{tripDetails.basePricePerPerson}</Text>
          </View>
          {tripDetails.tripType === "roundtrip" && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Trip Type</Text>
              <Text className="text-gray-800">Round Trip</Text>
            </View>
          )}
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">
              {tripDetails.tripType === "roundtrip" ? "Round Trip" : "One Way"} Price (per person)
            </Text>
            <Text className="text-gray-800 font-medium">₦{tripDetails.price.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Passengers</Text>
            <Text className="text-gray-800">{travellerDetails.length}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-800">
              ₦{(tripDetails.price * travellerDetails.length).toFixed(2)}
            </Text>
          </View>
          <View className="border-t border-gray-100 pt-3 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-lg font-semibold text-gray-800">Total</Text>
              <Text className="text-lg font-semibold text-orange-600">
                ₦{(tripDetails.price * travellerDetails.length).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={bookingId ? handlePaymentCard : handleCreateBooking}
          className="bg-orange-600 rounded-xl py-4 mb-3"
          disabled={isCreatingBooking}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isCreatingBooking
              ? "Creating Booking..."
              : bookingId
              ? "Proceed to Payment"
              : "Confirm Booking"}
          </Text>
        </TouchableOpacity>

        {/* Show alternative payment button if booking exists */}
        {bookingId && (
          <TouchableOpacity
            className="bg-green-500 rounded-xl py-4 mb-3"
            onPress={() => {
              Alert.alert(
                "Alternative Payment",
                `If the payment screen didn't appear, you can complete payment manually.\n\nBooking ID: ${bookingId}\nAmount: ₦${(
                  tripDetails.price * travellerDetails.length
                ).toFixed(2)}\n\nContact support or try again.`,
                [
                  {
                    text: "Try Payment Again",
                    onPress: () => handlePaymentCard(),
                  },
                  { text: "Cancel", style: "cancel" },
                ]
              );
            }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Payment Not Working? Tap Here
            </Text>
          </TouchableOpacity>
        )}

        {/* <TouchableOpacity className="bg-gray-100 rounded-xl py-4">
          <Text className="text-gray-600 text-center font-semibold text-lg">Edit Booking</Text>
        </TouchableOpacity> */}
      </View>
      <Paystack
        paystackKey={tpublicKey}
        amount={tripDetails.price * travellerDetails.length} // Use normal Naira amount (no kobo conversion)
        billingEmail={tripDetails.passengerEmail || "customer@example.com"}
        activityIndicatorColor="#ea580c"
        billingMobile={tripDetails.passengerPhone || ""}
        billingName={tripDetails.passengerName || "Customer"}
        channels=""
        metadata={JSON.stringify({
          bookingId: tripDetails.bookingId,
          bookingNumber: tripDetails.bookingNumber,
          passengerName: tripDetails.passengerName,
        })}
        onSuccess={async (tranRef) => {
          console.log("Paystack transaction reference:", tranRef);
          const requestBody = {
            reference: tranRef.data.transactionRef.reference,
            bookingId: bookingId,
          };
          console.log("Request body:", requestBody);

          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_URL}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              }
            );

            const data = await response.json();
            console.log("Payment verification result:", data);

            if (data.status === "success") {
              setErrorMessage(""); // Clear any previous errors

              const bookingInfo = data.data.booking || {};
              
              // Generate ticket automatically after successful payment
              try {
                const token = await AsyncStorage.getItem('userToken');
                const ticketResponse = await fetch(
                  `${process.env.EXPO_PUBLIC_BACKEND_URL}/bookings/${bookingId}/receipt`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );

                if (ticketResponse.ok) {
                  const ticketData = await ticketResponse.json();
                  
                  Alert.alert(
                    "Payment Successful! 🎫",
                    `Your booking payment has been processed successfully.\n\nBooking Number: ${
                      bookingInfo.bookingNumber ||
                      tripDetails.bookingNumber ||
                      "N/A"
                    }\nStatus: ${
                      bookingInfo.status || "Confirmed"
                    }\nAmount Paid: ₦${(
                      tripDetails.price * travellerDetails.length
                    ).toFixed(
                      2
                    )}\n\nYour digital ticket has been generated!`,
                    [
                      {
                        text: "View Ticket",
                        onPress: () => {
                          // Navigate to tickets page
                          router.push("/(drawer)/myTickets");
                        },
                      },
                      {
                        text: "View My Bookings",
                        onPress: () => router.push("/(tabs)/Profile"),
                      },
                      {
                        text: "Continue",
                        onPress: () => router.push("/(tabs)"),
                        style: "cancel",
                      },
                    ]
                  );
                } else {
                  // Fallback if ticket generation fails
                  Alert.alert(
                    "Payment Successful! ✅",
                    `Your booking payment has been processed successfully.\n\nBooking Number: ${
                      bookingInfo.bookingNumber ||
                      tripDetails.bookingNumber ||
                      "N/A"
                    }\nStatus: ${
                      bookingInfo.status || "Confirmed"
                    }\nAmount Paid: ₦${(
                      tripDetails.price * travellerDetails.length
                    ).toFixed(
                      2
                    )}\n\nYour ticket will be available in My Tickets shortly.`,
                    [
                      {
                        text: "View My Bookings",
                        onPress: () => router.push("/(tabs)/Profile"),
                      },
                      {
                        text: "Continue",
                        onPress: () => router.push("/(tabs)"),
                        style: "default",
                      },
                    ]
                  );
                }
              } catch (ticketError) {
                console.warn('Failed to generate ticket immediately:', ticketError);
                // Still show success message even if ticket generation fails
                Alert.alert(
                  "Payment Successful! ✅",
                  `Your booking payment has been processed successfully.\n\nBooking Number: ${
                    bookingInfo.bookingNumber ||
                    tripDetails.bookingNumber ||
                    "N/A"
                  }\nStatus: ${
                    bookingInfo.status || "Confirmed"
                  }\nAmount Paid: ₦${(
                    tripDetails.price * travellerDetails.length
                  ).toFixed(
                    2
                  )}\n\nYour ticket will be available in My Tickets shortly.`,
                  [
                    {
                      text: "View My Bookings",
                      onPress: () => router.push("/(tabs)/Profile"),
                    },
                    {
                      text: "Continue",
                      onPress: () => router.push("/(tabs)"),
                      style: "default",
                    },
                  ]
                );
              }
            } else {
              setErrorMessage(
                "Payment verification failed: " +
                  (data.message || "Unknown error occurred")
              );
              Alert.alert(
                "Payment Verification Failed",
                data.message ||
                  "There was an issue verifying your payment. Please contact support if your payment was deducted.",
                [{ text: "OK" }]
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setErrorMessage(
              "Payment verification failed. Please contact support if payment was deducted."
            );
            Alert.alert(
              "Connection Error",
              "Unable to verify payment status. If your payment was successful, please contact support.",
              [{ text: "OK" }]
            );
          }
        }}
        onCancel={() => {
          setErrorMessage(
            "Payment was cancelled. Please try again if you want to complete your booking."
          );
          console.log("Payment cancelled or failed");
        }}
        ref={paystackWebViewRef}
      />
    </View>
  );
};

export default TripSummary;