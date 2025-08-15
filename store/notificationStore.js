import { create } from 'zustand';
import { apiService } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Add a new notification
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Mark a notification as read
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, isRead: true })),
      unreadCount: 0,
    }));
  },

  // Remove a notification
  removeNotification: (notificationId) => {
    set((state) => {
      const notificationToRemove = state.notifications.find(n => n._id === notificationId);
      const wasUnread = notificationToRemove && !notificationToRemove.isRead;
      
      return {
        notifications: state.notifications.filter((notif) => notif._id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  // Set notifications (for initial load)
  setNotifications: (notifications, unreadCount = 0) => {
    set({
      notifications,
      unreadCount,
      isLoading: false,
      error: null,
    });
  },

  // Update unread count
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error) => {
    set({ error, isLoading: false });
  },

  // Clear all notifications
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      error: null,
    });
  },

  // Get unread notifications
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(notif => !notif.isRead);
  },

  // Get notifications by type
  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter(notif => notif.type === type);
  },

  // API integration methods
  fetchNotifications: async (page = 1, limit = 20) => {
    const { setLoading, setError, setNotifications } = get();
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/notifications?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        const formattedNotifications = response.data.data.notifications.map(notification => ({
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          isRead: notification.read || false,
          createdAt: notification.createdAt,
          data: notification.data || {},
          relatedBooking: notification.relatedBooking,
        }));
        
        setNotifications(formattedNotifications, response.data.data.unreadCount);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    }
  },

  markAsReadAPI: async (notificationId) => {
    const { markAsRead, setError } = get();
    try {
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        markAsRead(notificationId);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(error.message || 'Failed to mark notification as read');
      throw error;
    }
  },

  markAllAsReadAPI: async () => {
    const { markAllAsRead, setError } = get();
    try {
      const response = await apiService.put('/notifications/mark-all-read');
      
      if (response.data.success) {
        markAllAsRead();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError(error.message || 'Failed to mark all notifications as read');
      throw error;
    }
  },

  deleteNotificationAPI: async (notificationId) => {
    const { removeNotification, setError } = get();
    try {
      const response = await apiService.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        removeNotification(notificationId);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.message || 'Failed to delete notification');
      throw error;
    }
  },
}));

export default useNotificationStore;
