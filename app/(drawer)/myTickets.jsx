import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Image,
  Share,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient"; // Added for gradient background

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Authentication Error", "Please log in again");
        router.push("/auth/Login");
        return;
      }

      // Load both bookings and hirings
      const [bookingsResponse, hiringsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/hiring/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookingsData = await bookingsResponse.json();
      const hiringsData = await hiringsResponse.json();

      const allTickets = [];

      // Process bookings
      if (bookingsData.status === "success" && bookingsData.data) {
        for (const booking of bookingsData.data) {
          if (booking.paymentStatus === "Paid") {
            try {
              const ticketResponse = await fetch(
                `${API_BASE_URL}/bookings/${booking._id}/receipt`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (ticketResponse.ok) {
                const ticketData = await ticketResponse.json();
                allTickets.push({
                  ...ticketData.data.ticket,
                  originalData: booking,
                  type: "booking",
                });
              }
            } catch (error) {
              console.warn("Failed to load booking ticket:", error);
            }
          }
        }
      }

      // Process hirings
      if (hiringsData.status === "success" && hiringsData.data) {
        for (const hiring of hiringsData.data) {
          if (hiring.paymentStatus === "Paid") {
            try {
              const ticketResponse = await fetch(
                `${API_BASE_URL}/hiring/${hiring._id}/receipt`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (ticketResponse.ok) {
                const ticketData = await ticketResponse.json();
                allTickets.push({
                  ...ticketData.data.ticket,
                  originalData: hiring,
                  type: "hiring",
                });
              }
            } catch (error) {
              console.warn("Failed to load hiring ticket:", error);
            }
          }
        }
      }

      // Sort tickets by date (newest first)
      allTickets.sort(
        (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
      );
      setTickets(allTickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
      Alert.alert("Error", "Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const downloadPDF = async (ticket) => {
    try {
      setDownloadingPdf(ticket.ticketId);
      const token = await AsyncStorage.getItem("userToken");

      const endpoint =
        ticket.type === "booking"
          ? `${API_BASE_URL}/bookings/${ticket.bookingId}/ticket/pdf`
          : `${API_BASE_URL}/hiring/${ticket.hiringId}/ticket/pdf`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const fileUri = `${FileSystem.documentDirectory}ticket-${ticket.ticketId}.pdf`;

        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result.split(",")[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            Alert.alert("Success", "PDF downloaded to device storage");
          }
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.alert(
        "Download Error",
        "Failed to download PDF. Please try again."
      );
    } finally {
      setDownloadingPdf(null);
    }
  };

  const shareTicket = async (ticket) => {
    try {
      const message = `My ${ticket.type} ticket:\n\n${
        ticket.type === "booking" ? "Booking" : "Hiring"
      } Number: ${
        ticket.bookingNumber || ticket.hiringNumber
      }\nDate: ${new Date(
        ticket.departureDate || ticket.startDate
      ).toLocaleDateString()}\nStatus: ${ticket.status}\n\nTicket ID: ${
        ticket.ticketId
      }`;

      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing ticket:", error);
    }
  };

  const renderTicketCard = (ticket) => {
    const isBooking = ticket.type === "booking";
    const startDate = new Date(ticket.departureDate || ticket.startDate);
    const endDate = ticket.returnDate
      ? new Date(ticket.returnDate)
      : ticket.endDate
      ? new Date(ticket.endDate)
      : null;

    return (
      <TouchableOpacity
        key={ticket.ticketId}
        className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
        onPress={() => {
          setSelectedTicket(ticket);
          setShowTicketModal(true);
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {isBooking ? "Bus Booking" : "Bus Hiring"}
            </Text>
            <Text className="text-sm text-gray-500">
              {isBooking ? ticket.bookingNumber : ticket.hiringNumber}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              ticket.status === "Confirmed"
                ? "bg-green-100"
                : ticket.status === "Pending"
                ? "bg-yellow-100"
                : ticket.status === "Completed"
                ? "bg-blue-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                ticket.status === "Confirmed"
                  ? "text-green-600"
                  : ticket.status === "Pending"
                  ? "text-yellow-600"
                  : ticket.status === "Completed"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {ticket.status}
            </Text>
          </View>
        </View>

        {/* Route/Trip Info */}
        <View className="flex-row items-center mb-3">
          <View className="flex-1">
            <Text className="font-medium text-gray-800">
              {ticket.route?.source || ticket.startLocation || "N/A"}
            </Text>
            <Text className="text-xs text-gray-500">From</Text>
          </View>
          <View className="mx-4">
            <Ionicons name="arrow-forward" size={16} color="#6B7280" />
          </View>
          <View className="flex-1 items-end">
            <Text className="font-medium text-gray-800">
              {ticket.route?.destination || ticket.endLocation || "N/A"}
            </Text>
            <Text className="text-xs text-gray-500">To</Text>
          </View>
        </View>

        {/* Date and Details */}
        <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">
              {startDate.toLocaleDateString()}
            </Text>
            {endDate && (
              <Text className="ml-1 text-sm text-gray-600">
                - {endDate.toLocaleDateString()}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            {isBooking && ticket.passengers && (
              <>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  {ticket.passengers.length} seat
                  {ticket.passengers.length > 1 ? "s" : ""}
                </Text>
              </>
            )}
            {!isBooking && ticket.passengerCount && (
              <>
                <Ionicons name="bus-outline" size={16} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  {ticket.passengerCount} passengers
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTicketModal = () => {
    if (!selectedTicket) return null;

    const isBooking = selectedTicket.type === "booking";

    return (
      <Modal
        visible={showTicketModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-orange-500 pt-12 pb-6 px-5">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setShowTicketModal(false)}
                className="p-2 -ml-2"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">
                Digital Ticket
              </Text>
              <View className="w-8" />
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Ticket Card with Gradient and Perforated Edge */}
            <View className="bg-white rounded-3xl shadow-lg overflow-hidden mx-2 my-4">
              <LinearGradient colors={["#FFFFFF", "#F9FAFB"]} className="p-6">
                {/* Main Ticket Section */}
                <View className="relative">
                  {/* QR Code */}
                  <View className="items-center mb-6">
                    {selectedTicket.qrCode && (
                      <Image
                        source={{ uri: selectedTicket.qrCode }}
                        style={{ width: 150, height: 150 }}
                        resizeMode="contain"
                      />
                    )}
                    <Text className="mt-2 text-xs text-gray-500 text-center">
                      Show this QR code at boarding
                    </Text>
                  </View>

                  {/* Ticket Details */}
                  <View className="mb-6">
                    <Text className="text-lg font-bold text-center text-gray-800 mb-4">
                      {isBooking ? "BUS TICKET" : "HIRING RECEIPT"}
                    </Text>

                    <View className="bg-gray-100 p-4 rounded-lg mb-4">
                      <Text className="text-center font-mono text-sm text-gray-600">
                        {selectedTicket.ticketId}
                      </Text>
                    </View>

                    {/* Trip Information */}
                    <View className="space-y-3">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Number:</Text>
                        <Text className="font-medium">
                          {isBooking
                            ? selectedTicket.bookingNumber
                            : selectedTicket.hiringNumber}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Route:</Text>
                        <Text className="font-medium text-right flex-1 ml-4">
                          {selectedTicket.route?.source ||
                            selectedTicket.startLocation}{" "}
                          →{" "}
                          {selectedTicket.route?.destination ||
                            selectedTicket.endLocation}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">
                          {isBooking ? "Departure:" : "Start Date:"}
                        </Text>
                        <Text className="font-medium">
                          {new Date(
                            selectedTicket.departureDate ||
                              selectedTicket.startDate
                          ).toLocaleString()}
                        </Text>
                      </View>

                      {(selectedTicket.returnDate ||
                        selectedTicket.endDate) && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">
                            {isBooking ? "Return:" : "End Date:"}
                          </Text>
                          <Text className="font-medium">
                            {new Date(
                              selectedTicket.returnDate ||
                                selectedTicket.endDate
                            ).toLocaleString()}
                          </Text>
                        </View>
                      )}

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Bus:</Text>
                        <Text className="font-medium">
                          {selectedTicket.bus?.busNumber || "TBD"}
                        </Text>
                      </View>

                      {isBooking && selectedTicket.passengers && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Seats:</Text>
                          <Text className="font-medium">
                            {selectedTicket.selectedSeats?.outbound?.join(
                              ", "
                            ) || "N/A"}
                          </Text>
                        </View>
                      )}

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Total Fare:</Text>
                        <Text className="font-bold text-orange-600">
                          ₦
                          {(
                            selectedTicket.totalFare || selectedTicket.totalCost
                          )?.toLocaleString() || "0"}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Status:</Text>
                        <Text
                          className={`font-medium ${
                            selectedTicket.status === "Confirmed"
                              ? "text-green-600"
                              : selectedTicket.status === "Pending"
                              ? "text-yellow-600"
                              : selectedTicket.status === "Completed"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {selectedTicket.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Passenger Details (for bookings) */}
                  {isBooking && selectedTicket.passengers && (
                    <View className="border-t border-gray-100 pt-4">
                      <Text className="font-semibold text-gray-800 mb-3">
                        Passengers
                      </Text>
                      {selectedTicket.passengers.map((passenger, index) => (
                        <View
                          key={index}
                          className="flex-row justify-between py-1"
                        >
                          <Text className="text-gray-600">
                            {passenger.name} - Seat {passenger.seatNumber}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Perforated Edge Effect */}
                <View className="flex-row justify-between my-4">
                  {[...Array(22)].map((_, i) => (
                    <View
                      key={i}
                      className="w-2 h-2 bg-gray-200 rounded-full mx-0.5"
                    />
                  ))}
                </View>

                {/* Stub Section */}
                <View className="bg-gray-50 p-4">
                  <Text className="text-sm font-semibold text-gray-800 mb-2">
                    TICKET STUB
                  </Text>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">
                      {isBooking ? "Booking" : "Hiring"} #:{" "}
                      {isBooking
                        ? selectedTicket.bookingNumber
                        : selectedTicket.hiringNumber}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {new Date(
                        selectedTicket.departureDate || selectedTicket.startDate
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-2">
                    Retain this stub for your records
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 px-2">
              <TouchableOpacity
                className="bg-orange-500 rounded-xl py-4 flex-row items-center justify-center"
                onPress={() => downloadPDF(selectedTicket)}
                disabled={downloadingPdf === selectedTicket.ticketId}
              >
                {downloadingPdf === selectedTicket.ticketId ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">
                  {downloadingPdf === selectedTicket.ticketId
                    ? "Downloading..."
                    : "Download PDF"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-100 rounded-xl py-4 flex-row items-center justify-center"
                onPress={() => shareTicket(selectedTicket)}
              >
                <Ionicons name="share-outline" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">
                  Share Ticket
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 text-center mt-6 mb-4">
              Generated on{" "}
              {new Date(selectedTicket.generatedAt).toLocaleString()}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="mt-4 text-gray-600">Loading your tickets...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-500 pt-16 pb-6 px-5 rounded-b-3xl">
        <Text className="text-2xl font-bold text-white mb-2">My Tickets</Text>
        <Text className="text-white/80">Your digital tickets and receipts</Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {tickets.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="ticket-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-500 mt-4">
              No Tickets Yet
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Your tickets will appear here after successful payment for
              bookings or hirings.
            </Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-xl px-6 py-3 mt-6"
              onPress={() => router.push("/(tabs)")}
            >
              <Text className="text-white font-semibold">Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {tickets.length} Ticket{tickets.length > 1 ? "s" : ""}
            </Text>
            {tickets.map(renderTicketCard)}
          </View>
        )}
      </ScrollView>

      {renderTicketModal()}
    </View>
  );
}
