import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PassengerInfo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
  })
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { width } = Dimensions.get('window')

  useEffect(() => {
    console.log('PassengerInfo component mounted')
    console.log('Initial formData:', formData)
  }, [])

  useEffect(() => {
    console.log('FormData updated:', formData)
  }, [formData])

  const handleSubmit = async () => {
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      // Store passenger information for the next screen
      await AsyncStorage.setItem('passengerInfo', JSON.stringify(formData))
      
      // Also check if we have the selected bus route data
      const selectedBusRoute = await AsyncStorage.getItem('selectedBusRoute')
      if (!selectedBusRoute) {
        // Fallback to old structure for compatibility
        const selectedBus = await AsyncStorage.getItem('selectedBus')
        if (!selectedBus) {
          Alert.alert('Error', 'No bus selection found. Please go back and select a bus.')
          return
        }
      }
      
      // Navigate to hire summary
      router.push('/hiring/hireSummary')
    } catch (error) {
      console.error('Error saving passenger info:', error)
      Alert.alert('Error', 'Failed to save passenger information')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    console.log(`Updating ${field} with value:`, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <View style={styles.container}>
      {/* Header Spacer */}
      <View style={{ paddingTop: 20 }}></View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.formContainer}>
            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Contact Details</Text>
              
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="person" size={20} color="#ff7b00" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9ca3af"
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData('fullName', text)}
                    editable={true}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="email" size={20} color="#ff7b00" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email address"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    editable={true}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="call" size={20} color="#ff7b00" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => updateFormData('phone', text)}
                    editable={true}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Address Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="location" size={20} color="#ff7b00" />
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter your address"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={formData.address}
                    onChangeText={(text) => updateFormData('address', text)}
                    editable={true}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* ID Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID/NIN Number</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="card" size={20} color="#ff7b00" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your ID/NIN number"
                    placeholderTextColor="#9ca3af"
                    value={formData.idNumber}
                    onChangeText={(text) => updateFormData('idNumber', text)}
                    editable={true}
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.continueButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#9ca3af', '#9ca3af'] : ['#ff7b00', '#ff9500', '#ffb347']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButtonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="hourglass-empty" size={24} color="white" />
                    <Text style={styles.continueButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <Text style={styles.continueButtonText}>Continue to Summary</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default PassengerInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: '#ff7b00',
    backgroundColor: 'white',
    shadowColor: '#ff7b00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 40,
    paddingVertical: 8,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ff7b00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
})