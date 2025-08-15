// Register.js
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

const Register = () => {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Phone number is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(formData);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
    clearError();
  };

  return (
    <LinearGradient
      colors={['#fb923c', '#ea580c']}
      className="flex-1"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header Section */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-lg">
              <Ionicons name="person-add" size={32} color="#ea580c" />
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              Create Account
            </Text>
            <Text className="text-white/80 text-center text-lg">
              Join us to book or hire a bus
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-white rounded-3xl p-8 shadow-2xl">
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-center text-sm">{error}</Text>
              </View>
            )}

            {/* Full Name Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Full Name</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Enter your full name"
                  className={`border-2 ${
                    errors.name ? "border-red-300" : "border-gray-200"
                  } rounded-2xl pl-12 pr-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                  value={formData.name}
                  onChangeText={(text) => handleChange("name", text)}
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.name}</Text>
              )}
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Email Address</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`border-2 ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  } rounded-2xl pl-12 pr-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Phone Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Phone Number</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  className={`border-2 ${
                    errors.phone ? "border-red-300" : "border-gray-200"
                  } rounded-2xl pl-12 pr-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                  value={formData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                />
              </View>
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.phone}</Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Password</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  className={`border-2 ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } rounded-2xl pl-12 pr-12 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                  value={formData.password}
                  onChangeText={(text) => handleChange("password", text)}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className="mb-4"
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#fb923c', '#ea580c']}
                className="rounded-full py-4"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <Text className="text-gray-500 text-center text-sm mb-4">
              By creating an account, you agree to our{" "}
              <Text className="text-orange-600 underline">Terms of Service</Text>{" "}
              and{" "}
              <Text className="text-orange-600 underline">Privacy Policy</Text>
            </Text>
          </View>

          {/* Bottom Section */}
          <View className="mt-6 items-center">
            <Text className="text-white/80 text-center text-base">
              Already have an account?{" "}
              <Pressable onPress={() => router.push("/auth/Login")}>
                <Text className="text-white font-bold underline">Sign In</Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Register;
