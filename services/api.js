import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL; // Ensure this is set in your .env file

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.data || error.message);
    const message = error.response?.data?.message || error.message || "An error occurred";
    const errors = error.response?.data?.errors || [];
    return Promise.reject({ 
      message, 
      status: error.response?.status,
      errors,
      fullError: error.response?.data
    });
  }
);

// API service object
const apiService = {
  // Fetch user's bookings
  getUserBookings: async () => {
    try {
      const response = await api.get("/bookings/me");
      console.log("Booking Response",response.data)
      return response.data;      
    } catch (error) {
      throw new Error(error.message || "Failed to fetch bookings");
    }
  },

  // Fetch user's hirings
  getUserHirings: async () => {
    try {
      const response = await api.get("/hiring/me");
      console.log("Hiring Response", response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch hirings");
    }
  },

  // Add other API methods as needed, e.g., create booking, cancel booking, etc.
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to create booking");
    }
  },

  // Routes API
  getAllRoutes: async () => {
    try {
      const response = await api.get("/routes");
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch routes");
    }
  },

  // Get route by ID
  getRouteById: async (routeId) => {
    try {
      const response = await api.get(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch route");
    }
  },

  // Buses API
  getAllBuses: async () => {
    try {
      const response = await api.get("/buses");
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch buses");
    }
  },

  // Check hiring availability
  checkHiringAvailability: async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/hiring/availability?${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to check availability");
    }
  },

  // Create hiring (updated endpoint)
  createHiring: async (hiringData) => {
    try {
      console.log('Creating hiring with data:', hiringData);
      const token = await AsyncStorage.getItem("userToken");
      console.log('Token available:', !!token);
      
      const response = await api.post("/hiring", hiringData);
      console.log('Hiring creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Hiring creation error:', {
        message: error.message,
        status: error.status,
        errors: error.errors,
        fullError: error.fullError
      });
      
      // Provide more specific error messages
      if (error.status === 401) {
        throw new Error('Please log in again to create a hiring request');
      } else if (error.status === 400 && error.errors) {
        const errorMessages = error.errors.map(err => err.msg).join(', ');
        throw new Error(`Validation errors: ${errorMessages}`);
      } else {
        throw new Error(error.message || "Failed to create hiring");
      }
    }
  },

  // Calculate hiring cost
  calculateHiringCost: async (hiringData) => {
    try {
      const response = await api.post("/hiring/calculate-cost", hiringData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to calculate cost");
    }
  },

  // Example: Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to cancel booking");
    }
  },

  // Example: Cancel a hiring
  cancelHiring: async (hiringId) => {
    try {
      const response = await api.delete(`/hirings/${hiringId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to cancel hiring");
    }
  },

  // Initialize payment
  initializePayment: async (paymentData) => {
    try {
      const response = await api.post("/payments/initialize", paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to initialize payment");
    }
  },

  // Notification API methods
  get: async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch data");
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update data");
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await api.delete(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to delete data");
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to post data");
    }
  },
};

// Export both the axios instance and the service object
export { apiService };
export default api;
