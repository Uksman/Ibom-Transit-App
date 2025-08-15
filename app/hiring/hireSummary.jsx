import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { Paystack, paystackProps } from "react-native-paystack-webview"
import { apiService } from '../../services/api'

const HireSummary = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hiringData, setHiringData] = useState(null)
  const [calculatedCost, setCalculatedCost] = useState(null)
  const [error, setError] = useState(null)
  const [hiringId, setHiringId] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  
  const tpublicKey = process.env.EXPO_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY
  const paystackWebViewRef = useRef(paystackProps.PayStackRef)

  useEffect(() => {
    loadHiringData()
  }, [])

  const loadHiringData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all stored data
      const [searchData, selectedBusRoute, passengerInfo] = await Promise.all([
        AsyncStorage.getItem('hiringSearchData'),
        AsyncStorage.getItem('selectedBusRoute'),
        AsyncStorage.getItem('passengerInfo')
      ])

      if (!searchData || !selectedBusRoute || !passengerInfo) {
        throw new Error('Missing required data. Please start the hiring process again.')
      }

      const parsedSearchData = JSON.parse(searchData)
      const parsedBusRoute = JSON.parse(selectedBusRoute)
      const parsedPassengerInfo = JSON.parse(passengerInfo)
      
      // Extract bus and route data
      const parsedBus = parsedBusRoute.bus
      const parsedRoute = parsedBusRoute.route

      // Calculate duration
      const startDate = new Date(parsedSearchData.searchParams.startDate)
      const endDate = new Date(parsedSearchData.searchParams.endDate)
      const durationInMs = endDate - startDate
      const durationInHours = Math.ceil(durationInMs / (1000 * 60 * 60))
      const durationInDays = Math.ceil(durationInHours / 24)

      // Calculate total cost based on hiring logic (baseFare * bus capacity)
      const baseFare = parsedRoute.baseFare || parsedBusRoute.route?.baseFare || 50000
const totalCost = 
        parsedSearchData.searchParams.tripType === 'roundTrip' ? 
        baseFare * parsedBus.capacity * 2 : 
        baseFare * parsedBus.capacity

      // Build hiring data object
      const hiringRequestData = {
        bus: parsedBus._id,
        route: parsedRoute?._id, // Optional route reference
        startDate: parsedSearchData.searchParams.startDate,
        endDate: parsedSearchData.searchParams.endDate,
        tripType: parsedSearchData.searchParams.tripType === 'roundTrip' ? 'Round-Trip' : 'One-Way',
        returnDate: parsedSearchData.searchParams.tripType === 'roundTrip' ? parsedSearchData.searchParams.endDate : null,
        purpose: `Bus hire for travel from ${parsedSearchData.searchParams.from} to ${parsedSearchData.searchParams.to}`,
        startLocation: parsedSearchData.searchParams.from,
        endLocation: parsedSearchData.searchParams.to,
        passengerCount: parsedBus.capacity, // Set to full capacity of the bus
        rateType: parsedRoute?._id ? 'Route-Based' : 'Fixed', // Use Route-Based if route exists
        baseRate: baseFare,
        routePriceMultiplier: parsedRoute?._id ? 1 : undefined, // Set multiplier for route-based pricing
        estimatedDistance: parsedRoute?.distance || 500, // Use route distance or default 500km
        totalCost: totalCost,
        // Contact person details from passenger info
        contactPerson: parsedPassengerInfo.fullName,
        contactPhone: parsedPassengerInfo.phone
      }

      setCalculatedCost({
        totalCost: totalCost,
        baseRate: baseFare,
        duration: durationInDays
      })

      setHiringData({
        ...hiringRequestData,
        searchParams: parsedSearchData.searchParams,
        selectedBus: parsedBus,
        passengerInfo: parsedPassengerInfo,
        duration: {
          days: durationInDays,
          hours: durationInHours
        }
      })

    } catch (error) {
      console.error('Error loading hiring data:', error)
      setError(error.message || 'Failed to load hiring data')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Confirm and create hiring
  const handleConfirmHiring = async () => {
    console.log('=== CONFIRM HIRING STARTED ===')
    
    if (!hiringData) {
      console.log('Error: No hiring data available')
      Alert.alert('Error', 'No hiring data available')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('') // Clear any previous errors
      
      console.log('Current hiring data:', JSON.stringify(hiringData, null, 2))
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('userToken')
      if (!token) {
        console.log('Error: No authentication token found')
        Alert.alert('Authentication Error', 'Please log in again to continue')
        router.push('/auth/Login')
        return
      }
      console.log('Authentication token found:', token ? 'YES' : 'NO')
      
      // First, try to get the backend's calculated cost
      try {
        const costCalculationData = {
          bus: hiringData.bus,
          route: hiringData.route || null,
          startDate: hiringData.startDate,
          endDate: hiringData.endDate,
          tripType: hiringData.tripType,
          rateType: hiringData.rateType,
          baseRate: Number(hiringData.baseRate),
          passengerCount: Number(hiringData.passengerCount),
          routePriceMultiplier: hiringData.routePriceMultiplier ? Number(hiringData.routePriceMultiplier) : undefined,
          estimatedDistance: Number(hiringData.estimatedDistance)
        }
        
        console.log('=== CALCULATING COST WITH BACKEND ===')
        console.log('Cost calculation data:', JSON.stringify(costCalculationData, null, 2))
        
        const costResponse = await apiService.calculateHiringCost(costCalculationData)
        console.log('Backend calculated cost:', costResponse)
        
        if (costResponse && costResponse.totalCost) {
          console.log(`Frontend calculated: ₦${hiringData.totalCost.toLocaleString()}`)
          console.log(`Backend calculated: ₦${costResponse.totalCost.toLocaleString()}`)
          
          // Use backend calculation if available
          hiringData.totalCost = costResponse.totalCost
          console.log('Using backend calculated cost')
        }
      } catch (costError) {
        console.log('Backend cost calculation failed, using frontend calculation:', costError.message)
      }
      
      // Extract only the required fields for the API
      const hiringRequestData = {
        bus: hiringData.bus,
        route: hiringData.route || null,
        startDate: hiringData.startDate,
        endDate: hiringData.endDate,
        tripType: hiringData.tripType,
        returnDate: hiringData.returnDate,
        purpose: hiringData.purpose,
        startLocation: hiringData.startLocation,
        endLocation: hiringData.endLocation,
        passengerCount: Number(hiringData.passengerCount),
        rateType: hiringData.rateType,
        baseRate: Number(hiringData.baseRate),
        routePriceMultiplier: hiringData.routePriceMultiplier ? Number(hiringData.routePriceMultiplier) : undefined,
        estimatedDistance: Number(hiringData.estimatedDistance),
        totalCost: Number(hiringData.totalCost),
        contactPerson: hiringData.contactPerson,
        contactPhone: hiringData.contactPhone
      }

      console.log('=== SENDING HIRING REQUEST ===')
      console.log('Request data:', JSON.stringify(hiringRequestData, null, 2))
      
      const hiringResponse = await apiService.createHiring(hiringRequestData)
      console.log('=== HIRING RESPONSE RECEIVED ===')
      console.log('Hiring result:', JSON.stringify(hiringResponse, null, 2))
      
      const hiringNumber = hiringResponse.data?.hiringNumber || hiringResponse.hiringNumber || 'N/A'
      const createdHiringId = hiringResponse.data?._id || hiringResponse._id
      
      if (!createdHiringId) {
        console.log('Error: No hiring ID received from server')
        Alert.alert('Error', 'Invalid response from server. Please try again.')
        return
      }
      
      console.log('Hiring created successfully:')
      console.log('- Hiring Number:', hiringNumber)
      console.log('- Hiring ID:', createdHiringId)
      
      // Store hiring ID for payment processing
      setHiringId(createdHiringId)
      
      // Show success message and proceed to payment
      Alert.alert(
        'Hiring Created Successfully! ✅',
        `Your hire request has been created.\n\nHiring Number: ${hiringNumber}\nAmount: ₦${hiringData.totalCost.toLocaleString()}\n\nProceed to payment to complete your hire.`,
        [
          {
            text: 'Proceed to Payment',
            onPress: () => handlePaymentCard(),
            style: 'default'
          },
          {
            text: 'Pay Later',
            onPress: () => {
              Alert.alert('Payment Required', 'You can complete payment from your hiring history.')
              router.push('/(tabs)')
            },
            style: 'cancel'
          }
        ]
      )
      
    } catch (error) {
      console.log('=== ERROR IN CONFIRM HIRING ===')
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        fullError: error
      })
      
      let errorMessage = 'Failed to confirm hiring'
      
      if (error.message?.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection and ensure the backend server is running.'
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.'
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid request data. Please check your inputs.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrorMessage(errorMessage)
      Alert.alert('Error', errorMessage)
    } finally {
      setSubmitting(false)
      console.log('=== CONFIRM HIRING FINISHED ===')
    }
  }

  // Step 2: Handle payment - Following TripSummary pattern exactly
  const handlePaymentCard = () => {
    console.log('Payment card handler called')
    if (paystackWebViewRef.current) {
      console.log('Starting payment transaction...')
      paystackWebViewRef.current.startTransaction()
    } else {
      console.log('Paystack ref not available')
      Alert.alert('Payment Error', 'Payment system not ready. Please try again.')
    }
  }

  const handlePaymentSuccess = async (tranRef) => {
    console.log("Paystack transaction reference:", tranRef)
    const requestBody = { 
      reference: tranRef.data.transactionRef.reference,
      hiringId: hiringId
    }
    console.log("Request body:", requestBody)
    
    try {
      setSubmitting(true) // Show loading state
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/payments/verify`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      console.log('Payment verification result:', data)
      
      if (data.status === 'success') {
        // Clear stored data after successful payment
        await Promise.all([
          AsyncStorage.removeItem('hiringSearchData'),
          AsyncStorage.removeItem('selectedBusRoute'),
          AsyncStorage.removeItem('passengerInfo')
        ])
        
        setErrorMessage("") // Clear any previous errors
        
        // Show success message with hiring details
        const hiringInfo = data.data.hiring || {}
        Alert.alert(
          'Payment Successful! ✅',
          `Your bus hire payment has been processed successfully.\n\nHiring Number: ${hiringInfo.hiringNumber || 'N/A'}\nStatus: ${hiringInfo.status || 'Confirmed'}\nAmount Paid: ₦${requestBody.amount ? (requestBody.amount / 100).toLocaleString() : 'N/A'}\n\nYour hiring request will be reviewed and confirmed shortly. You'll receive further updates via email.`,
          [
            {
              text: 'View My Hirings',
              onPress: () => router.push('/(tabs)/Profile')
            },
            {
              text: 'Continue',
              onPress: () => router.push('/(tabs)'),
              style: 'default'
            }
          ]
        )
      } else {
        setErrorMessage("Payment verification failed: " + (data.message || 'Unknown error occurred'))
        Alert.alert(
          'Payment Verification Failed',
          data.message || 'There was an issue verifying your payment. Please contact support if your payment was deducted.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setErrorMessage("Payment verification failed. Please contact support if payment was deducted.")
      Alert.alert(
        'Connection Error',
        'Unable to verify payment status. If your payment was successful, please contact support.',
        [{ text: 'OK' }]
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentCancel = () => {
    setErrorMessage("Payment was cancelled. Please try again if you want to complete your hire.")
    console.log("Payment cancelled or failed")
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#ff7b00" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading hiring details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 }}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#ef4444', textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ backgroundColor: '#ff7b00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!hiringData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>No hiring data available</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-500 pt-16 pb-6 px-5 rounded-b-3xl">
        <Text className="text-2xl font-bold text-white mb-2">Hire Summary</Text>
        <Text className="text-white/80">Review your bus hire details</Text>
      </View>

      <View className="p-4">
        {/* Bus Details Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-3">
              <Image
                source={require("../../assets/images/bus.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
              <View>
                <Text className="text-lg font-semibold text-gray-800">
                  {hiringData.selectedBus.name ||
                    hiringData.selectedBus.busNumber ||
                    "Bus"}
                </Text>
                <Text className="text-gray-500">
                  {hiringData.selectedBus.type || "Standard"}
                </Text>
              </View>
            </View>
            <View className="bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-orange-600 font-semibold">
                ₦
                {calculatedCost
                  ? calculatedCost.totalCost.toLocaleString()
                  : "0"}
              </Text>
            </View>
          </View>

          {/* Route Details */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {hiringData.searchParams.from}
              </Text>
              <Text className="text-gray-500">Departure</Text>
            </View>
            <View className="items-center">
              <Ionicons name="arrow-forward" size={24} color="#6B7280" />
              <Text className="text-gray-500 text-sm">
                {hiringData.duration.days} day
                {hiringData.duration.days > 1 ? "s" : ""}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-lg font-semibold text-gray-800">
                {hiringData.searchParams.to}
              </Text>
              <Text className="text-gray-500">Arrival</Text>
            </View>
          </View>

          {/* Date and Passengers */}
          <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600">
                {new Date(hiringData.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600">
                {hiringData.selectedBus.capacity || 40} capacity
              </Text>
            </View>
          </View>
        </View>

        {/* Amenities Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Amenities
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(
              hiringData.selectedBus.amenities || [
                "Air Conditioning",
                "WiFi",
                "Comfortable Seats",
              ]
            ).map((amenity, index) => (
              <View
                key={index}
                className="bg-orange-100 px-3 py-1 rounded-full"
              >
                <Text className="text-orange-600">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Contact Information
          </Text>
          <View className="space-y-3">
            {/* Full Name */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={16} color="#FF7B00" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Full Name</Text>
                <Text className="text-gray-800 font-medium">
                  {hiringData.passengerInfo.fullName}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail" size={16} color="#FF7B00" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">
                  Email Address
                </Text>
                <Text className="text-gray-800 font-medium">
                  {hiringData.passengerInfo.email}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="call" size={16} color="#FF7B00" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Phone Number</Text>
                <Text className="text-gray-800 font-medium">
                  {hiringData.passengerInfo.phone}
                </Text>
              </View>
            </View>

            {/* Address (if provided) */}
            {hiringData.passengerInfo.address && (
              <View className="flex-row items-start">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3 mt-1">
                  <Ionicons name="location" size={16} color="#FF7B00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Address</Text>
                  <Text className="text-gray-800 font-medium">
                    {hiringData.passengerInfo.address}
                  </Text>
                </View>
              </View>
            )}

            {/* ID Number (if provided) */}
            {hiringData.passengerInfo.idNumber && (
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="card" size={16} color="#FF7B00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">
                    ID/NIN Number
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    {hiringData.passengerInfo.idNumber}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Error message display */}
        {errorMessage ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <Text className="text-red-700">{errorMessage}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View className="space-y-3 mt-4">
          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-xl"
            onPress={handleConfirmHiring}
            disabled={submitting}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {submitting ? "Processing..." : "Confirm Hire"}
            </Text>
          </TouchableOpacity>

          {/* Alternative Payment Button - Show if hiring is created but payment didn't work */}
          {hiringId && (
            <TouchableOpacity
              className="bg-green-500 p-4 rounded-xl"
              onPress={() => {
                console.log("Alternative payment triggered");
                Alert.alert(
                  "Alternative Payment",
                  `If the payment screen didn't appear, you can complete payment manually.\n\nHiring ID: ${hiringId}\nAmount: ₦${hiringData.totalCost.toLocaleString()}\n\nContact support or try again.`,
                  [
                    {
                      text: "Try Payment Again",
                      onPress: () => {
                        if (paystackWebViewRef.current) {
                          console.log("Retrying payment...");
                          paystackWebViewRef.current.startTransaction();
                        }
                      },
                    },
                    {
                      text: "Contact Support",
                      onPress: () => {
                        // In a real app, this would open support chat/email
                        Alert.alert(
                          "Support",
                          "Please contact support with your hiring number: " +
                            (hiringData.hiringNumber || hiringId)
                        );
                      },
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

          <TouchableOpacity
            className="bg-gray-100 p-4 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-gray-600 text-center font-semibold text-lg">
              Edit Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Paystack WebView Component */}
      <Paystack
        paystackKey={tpublicKey}
        amount={hiringData ? hiringData.totalCost * 1 : 0} // Convert to kobo (multiply by 100)
        billingEmail={
          hiringData?.passengerInfo?.email || "customer@example.com"
        }
        activityIndicatorColor="#ea580c"
        billingMobile={hiringData?.passengerInfo?.phone || ""}
        billingName={hiringData?.passengerInfo?.fullName || "Customer"}
        channels=""
        metadata={JSON.stringify({
          hiringId: hiringId,
          hiringNumber: hiringData?.hiringNumber,
          passengerName: hiringData?.passengerInfo?.fullName,
        })}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        ref={paystackWebViewRef}
      />
    </ScrollView>
  );
}

export default HireSummary