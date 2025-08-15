import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      await AsyncStorage.setItem("userToken", response.token);
      // Normalize user data to flat structure
      set({ user: response.user, token: response.token, isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || "Login failed" });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      await AsyncStorage.setItem("userToken", response.token);
      // Normalize user data to flat structure
      set({ user: response.user, token: response.token, isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || "Registration failed" });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      await AsyncStorage.removeItem("userToken");
      set({ user: null, token: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message || "Logout failed" });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // First, try to get the token from AsyncStorage
      const storedToken = await AsyncStorage.getItem("userToken");
      
      if (storedToken) {
        // If we have a token, try to get user data
        const userData = await authService.getCurrentUser();
        if (userData) {
          // Normalize to flat user object and restore token
          const normalizedUser = userData.data?.user || userData;
          set({ user: normalizedUser, token: storedToken, isLoading: false });
        } else {
          // Token is invalid, clear everything
          await AsyncStorage.removeItem("userToken");
          set({ user: null, token: null, isLoading: false });
        }
      } else {
        // No token found, user is not authenticated
        set({ user: null, token: null, isLoading: false });
      }
    } catch (error) {
      // Clear invalid token
      await AsyncStorage.removeItem("userToken");
      set({
        user: null,
        token: null,
        isLoading: false,
        error: error.message || "Failed to fetch user",
      });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.forgotPassword(email);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || "Failed to send reset link" });
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resetPassword(token, newPassword);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || "Failed to reset password" });
      throw error;
    }
  },

  updateUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // Here you would normally call an API to update user data
      // For now, we'll simulate an API call and update the local state
      const response = await authService.updateUser(userData);
      
      // Update the user in state
      set((state) => ({ 
        user: { ...state.user, ...userData }, 
        isLoading: false 
      }));
      
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || "Failed to update user" });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
