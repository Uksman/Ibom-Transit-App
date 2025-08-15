import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;


const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred during registration",
        }
      );
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response.data); // Debug

      if (response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
      }
      console.log("Token stored:", response.data.token); // Debug
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "An error occurred during login" }
      );
    }
  },

  updateUser: async (userData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Unauthorized");

      const response = await axios.put(`${API_URL}/auth/update`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while updating profile",
        }
      );
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("userToken");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return null;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return null;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while sending reset link",
        }
      );
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while resetting password",
        }
      );
    }
  },
};

export default authService;
