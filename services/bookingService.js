import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URI = process.env.EXPO_PUBLIC_BACKEND_URL;

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make authenticated API calls
const makeAPICall = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URI}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Booking Service Functions
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    return await makeAPICall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get booking by ID
  getBooking: async (bookingId) => {
    return await makeAPICall(`/bookings/${bookingId}`);
  },

  // Get user's bookings
  getUserBookings: async () => {
    return await makeAPICall('/bookings/me');
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    return await makeAPICall(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    return await makeAPICall(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  },

  // Process payment for booking
  processPayment: async (bookingId, paymentData) => {
    return await makeAPICall(`/bookings/${bookingId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Get booking receipt
  getBookingReceipt: async (bookingId) => {
    return await makeAPICall(`/bookings/${bookingId}/receipt`);
  },
};

// Route Service Functions
export const routeService = {
  // Search routes
  searchRoutes: async (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return await makeAPICall(`/routes/search?${queryString}`);
  },

  // Get route details
  getRoute: async (routeId) => {
    return await makeAPICall(`/routes/${routeId}`);
  },

  // Check route availability
  checkRouteAvailability: async (routeId, date) => {
    return await makeAPICall(`/routes/${routeId}/availability?date=${date}`);
  },

  // Get route schedule
  getRouteSchedule: async (routeId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await makeAPICall(`/routes/${routeId}/schedule?${params.toString()}`);
  },

  // Get popular routes
  getPopularRoutes: async (limit = 5) => {
    return await makeAPICall(`/routes/popular?limit=${limit}`);
  },
};

// Location Service Functions
export const locationService = {
  // Get all locations
  getLocations: async () => {
    return await makeAPICall('/locations');
  },
};

// Payment Service Functions
export const paymentService = {
  // Verify payment
  verifyPayment: async (reference) => {
    return await makeAPICall('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  },

  // Get payment history
  getPaymentHistory: async () => {
    return await makeAPICall('/payments/history');
  },
};

export default {
  bookingService,
  routeService,
  locationService,
  paymentService,
};
