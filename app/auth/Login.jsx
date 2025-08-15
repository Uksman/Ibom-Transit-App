// Login.js
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

const Login = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <LinearGradient
      colors={['#fb923c', '#ea580c']}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-8">
        {/* Header Section */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-lg">
            <Ionicons name="bus" size={32} color="#ea580c" />
          </View>
          <Text className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </Text>
          <Text className="text-white/80 text-center text-lg">
            Sign in to continue your journey
          </Text>
        </View>

        {/* Form Container */}
        <View className="bg-white rounded-3xl p-8 shadow-2xl">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Email Address</Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Enter your email"
                keyboardType="email-address"
                className={`border-2 ${
                  errors.email ? "border-red-300" : "border-gray-200"
                } rounded-2xl pl-12 pr-4 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, email: text }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  clearError();
                }}
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-sm mt-2 ml-1">{errors.email}</Text>
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
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className={`border-2 ${
                  errors.password ? "border-red-300" : "border-gray-200"
                } rounded-2xl pl-12 pr-12 py-4 text-base bg-gray-50 focus:bg-white focus:border-orange-400`}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, password: text }));
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: null }));
                  clearError();
                }}
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

          {/* Login Button */}
          <TouchableOpacity
            className="py-4 mb-4"
            onPress={handleLogin}
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
                  Sign In
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Forgot Password */}
          <Pressable
            className="py-2"
            onPress={() => router.push("/auth/ForgotPassword")}
          >
            <Text className="text-center text-orange-600 font-medium">Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Bottom Section */}
        <View className="mt-8 items-center">
          <Text className="text-white/80 text-center text-base">
            Don&apos;t have an account?{" "}
            <Pressable onPress={() => router.push("/auth/Register")}>
              <Text className="text-white font-bold underline">Create Account</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Login;
