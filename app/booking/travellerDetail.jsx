import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAuthStore from "../../store/authStore";

const TravellerDetail = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams();
  const selectedSeats = params.selectedSeats ? JSON.parse(params.selectedSeats) : [];
  const totalPassengers = selectedSeats.length;
  const initialFormData = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: "",
    gender: "",
    address: "",
  };
const [formDataList, setFormDataList] = useState([]);
  const [isLoadingForms, setIsLoadingForms] = useState(true);

  // Initialize forms on component mount
  useEffect(() => {
    const initializeForms = () => {
      const forms = Array(totalPassengers).fill().map((_, index) => {
        // Pre-fill first form with user data (this is for the logged-in user)
        if (index === 0 && user) {
          return {
            firstName: user.firstName || user.name?.split(' ')[0] || "",
            lastName: user.lastName || user.name?.split(' ')[1] || "",
            email: user.email || "",
            phone: user.phone || "",
            age: "",
            gender: "",
            address: "",
          };
        }
        // Empty forms for other passengers
        return {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          age: "",
          gender: "",
          address: "",
        };
      });
      setFormDataList(forms);
      setIsLoadingForms(false);
    };

    if (totalPassengers > 0) {
      initializeForms();
    } else {
      setIsLoadingForms(false);
    }
  }, [totalPassengers, user]);

  // Show loading spinner while forms are being initialized
  if (isLoadingForms) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff6536" />
          <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading passenger forms...</Text>
        </View>
      </View>
    );
  }

  const handleInputChange = (index, field, value) => {
    const updatedFormDataList = [...formDataList];
    updatedFormDataList[index][field] = value;
    setFormDataList(updatedFormDataList);
  };

  const handleSubmit = () => {
    // Check if forms are loaded
    if (formDataList.length === 0) {
      Alert.alert('Error', 'Please wait for forms to load');
      return;
    }

    // Validate required fields for all forms
    const incompleteForms = [];
    formDataList.forEach((formData, index) => {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        incompleteForms.push(index + 1);
      }
    });

    if (incompleteForms.length > 0) {
      Alert.alert(
        'Incomplete Information', 
        `Please fill in all required fields for passenger(s): ${incompleteForms.join(', ')}`
      );
      return;
    }
    
    // Handle form submission
console.log("Form Data List:", formDataList);
    router.push({
      pathname: "/booking/tripSummary",
      params: {
        travellerDetails: JSON.stringify(formDataList),
        selectedSeats: params.selectedSeats,
        bus: params.bus,
        searchParams: params.searchParams
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Please provide your travel information</Text>
        </View>

{/* Render a form for each passenger */}
        {formDataList.map((formData, index) => (
          <View key={index} style={styles.formCard}>
            <Text style={styles.cardTitle}>
              {index === 0 ? `You (Passenger ${index + 1})` : `Passenger ${index + 1} Information`}
            </Text>
            {index === 0 && (
              <Text style={styles.userNote}>
                Your details have been pre-filled. Please review and update if needed.
              </Text>
            )}
                {/* First Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="person" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.firstName}
                      onChangeText={(value) =>
                        handleInputChange(index, "firstName", value)
                      }
                    placeholder="Enter your first name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="person" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.lastName}
                      onChangeText={(value) =>
                        handleInputChange(index, "lastName", value)
                      }
                    placeholder="Enter your last name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="email" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.email}
                      onChangeText={(value) => handleInputChange(index, "email", value)}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="call" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.phone}
                      onChangeText={(value) => handleInputChange(index, "phone", value)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="calendar" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.age}
                      onChangeText={(value) => handleInputChange(index, "age", value)}
                    placeholder="Enter your age"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="people" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={styles.textInput}
value={formData.gender}
                      onChangeText={(value) => handleInputChange(index, "gender", value)}
                    placeholder="Enter your gender"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="location" size={20} color="#ff6536" />
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
value={formData.address}
                      onChangeText={(value) =>
                        handleInputChange(index, "address", value)
                      }
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ff6536', '#ea580c']}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="arrow-forward" size={20} color="white" />
            <Text style={styles.submitButtonText}>Continue to Summary</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TravellerDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingVertical: 25,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ff6536',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  userNote: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
});
