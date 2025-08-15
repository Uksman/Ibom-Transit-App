import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

const ResetPassword = () => {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      Alert.alert(
        "Invalid Link",
        "This reset link is invalid or has expired. Please request a new one.",
        [{ text: "OK", onPress: () => router.replace("/auth/ForgotPassword") }]
      );
    }
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    clearError();
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    clearError();

    if (!validateForm()) return;

    try {
      await resetPassword(token, formData.newPassword);
      setSuccessMessage("Password reset successfully! You can now sign in with your new password.");
      setFormData({ newPassword: "", confirmPassword: "" });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.replace("/auth/Login");
      }, 3000);
    } catch (error) {
      Alert.alert(
        "Reset Failed",
        error.message || "Failed to reset password. The link may have expired."
      );
    }
  };

  if (!token) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <Ionicons name="warning" size={60} color="#ef4444" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
          Invalid Reset Link
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          This link is invalid or has expired.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      {/* Header */}
      <View className="items-center mb-8">
        <View className="bg-orange-100 p-4 rounded-full mb-4">
          <Ionicons name="lock-closed-outline" size={40} color="#ea580c" />
        </View>
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </Text>
        <Text className="text-center text-gray-600 text-base leading-6">
          Enter your new password below to complete the reset process.
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
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text className="text-green-800 font-semibold ml-2">Success!</Text>
          </View>
          <Text className="text-green-800 text-center leading-6">
            {successMessage}
          </Text>
        </View>
      )}

      {/* New Password Input */}
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-2">New Password</Text>
        <View className="relative">
          <TextInput
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            className={`border ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            } rounded-xl px-4 py-3 pr-12 text-base bg-gray-50`}
            value={formData.newPassword}
            onChangeText={(text) => handleInputChange("newPassword", text)}
            autoCapitalize="none"
          />
          <Pressable
            className="absolute right-4 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        </View>
        {errors.newPassword && (
          <Text className="text-red-500 text-sm mt-1">{errors.newPassword}</Text>
        )}
      </View>

      {/* Confirm Password Input */}
      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
        <View className="relative">
          <TextInput
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            className={`border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } rounded-xl px-4 py-3 pr-12 text-base bg-gray-50`}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange("confirmPassword", text)}
            autoCapitalize="none"
          />
          <Pressable
            className="absolute right-4 top-3"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        </View>
        {errors.confirmPassword && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.confirmPassword}
          </Text>
        )}
      </View>

      {/* Reset Password Button */}
      <TouchableOpacity
        className="bg-orange-600 rounded-xl py-4 mb-6"
        onPress={handleSubmit}
        disabled={isLoading || successMessage}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold text-lg">
            {successMessage ? "Redirecting..." : "Reset Password"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      {!successMessage && (
        <Pressable
          className="flex-row items-center justify-center"
          onPress={() => router.replace("/auth/Login")}
        >
          <Ionicons name="arrow-back" size={18} color="#ea580c" />
          <Text className="text-orange-600 font-medium ml-2">Back to Login</Text>
        </Pressable>
      )}

      {/* Password Requirements */}
      <View className="mt-8 p-4 bg-blue-50 rounded-xl">
        <Text className="text-blue-800 font-medium mb-2">Password Requirements:</Text>
        <View className="flex-row items-center mb-1">
          <Ionicons name="checkmark" size={16} color="#16a34a" />
          <Text className="text-blue-700 text-sm ml-2">At least 6 characters</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="checkmark" size={16} color="#16a34a" />
          <Text className="text-blue-700 text-sm ml-2">Must match confirmation</Text>
        </View>
      </View>
    </View>
  );
};

export default ResetPassword;
