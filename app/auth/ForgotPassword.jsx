import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

const ForgotPassword = () => {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError("");
    setSuccessMessage("");
    clearError();

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await forgotPassword(email);
      setSuccessMessage(
        "Password reset link has been sent to your email address. Please check your inbox and follow the instructions."
      );
      setEmail("");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to send reset link. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      {/* Header */}
      <View className="items-center mb-8">
        <View className="bg-orange-100 p-4 rounded-full mb-4">
          <Ionicons name="mail-outline" size={40} color="#ea580c" />
        </View>
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </Text>
        <Text className="text-center text-gray-600 text-base leading-6">
          Don&apos;t worry! Enter your email address and we&apos;ll send you a link to
          reset your password.
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-800 text-center">{error}</Text>
        </View>
      )}

      {/* Success Message */}
      {successMessage && (
        <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <Text className="text-green-800 text-center leading-6">
            {successMessage}
          </Text>
        </View>
      )}

      {/* Email Input */}
      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
        <TextInput
          placeholder="Enter your email address"
          keyboardType="email-address"
          className={`border ${
            emailError ? "border-red-500" : "border-gray-300"
          } rounded-xl px-4 py-3 text-base bg-gray-50`}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
            clearError();
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {emailError && (
          <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
        )}
      </View>

      {/* Send Reset Link Button */}
      <TouchableOpacity
        className="bg-orange-600 rounded-xl py-4 mb-6"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold text-lg">
            Send Reset Link
          </Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <Pressable
        className="flex-row items-center justify-center"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color="#ea580c" />
        <Text className="text-orange-600 font-medium ml-2">Back to Login</Text>
      </Pressable>

      {/* Additional Help */}
      <View className="mt-8 p-4 bg-gray-50 rounded-xl">
        <Text className="text-gray-600 text-center text-sm leading-5">
          Still having trouble? Contact our support team for assistance.
        </Text>
      </View>
    </View>
  );
};

export default ForgotPassword;
