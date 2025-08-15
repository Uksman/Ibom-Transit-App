import { useEffect } from 'react';
import useNotificationStore from '../store/notificationStore';

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading: loading,
    error,
    setError,
    fetchNotifications,
    markAsReadAPI,
    markAllAsReadAPI,
    deleteNotificationAPI,
    addNotification: addNotificationToStore,
  } = useNotificationStore();






  const formatNotification = (notification) => {
    try {
      return {
        id: notification._id || notification.id,
        title: notification.title || 'Notification',
        message: notification.message || 'No message available',
        time: getTimeAgo(new Date(notification.createdAt || notification.created_at || Date.now())),
        type: getNotificationUIType(notification.type, notification.category),
        read: notification.read || false,
        priority: notification.priority || 'normal',
        data: notification.data || {},
        relatedBooking: notification.relatedBooking,
        originalType: notification.type,
        category: notification.category,
        createdAt: notification.createdAt || notification.created_at
      };
    } catch (error) {
      console.error('Error formatting notification:', error);
      return {
        id: notification._id || notification.id || 'unknown',
        title: 'Notification',
        message: 'Error loading notification',
        time: 'Unknown',
        type: 'info',
        read: false,
        priority: 'normal',
        data: {},
        originalType: 'general',
        category: 'system',
        createdAt: new Date()
      };
    }
  };

  const getTimeAgo = (date) => {
    try {
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown time';
    }
  };

  const getNotificationUIType = (type, category) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_successful':
      case 'refund_processed':
        return 'success';
      case 'booking_reminder':
      case 'bus_delayed':
        return 'warning';
      case 'booking_cancelled':
      case 'payment_failed':
      case 'bus_cancelled':
        return 'error';
      case 'promotional':
        return 'promo';
      default:
        return 'info';
    }
  };

  const addNotification = (newNotification) => {
    const formatted = formatNotification(newNotification);
    addNotificationToStore(formatted);
  };

  // Format notifications from store for UI
  const formattedNotifications = notifications.map(formatNotification);

  // Auto-fetch notifications on hook initialization
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications: formattedNotifications,
    loading,
    unreadCount,
    error,
    fetchNotifications,
    markAsRead: markAsReadAPI,
    markAllAsRead: markAllAsReadAPI,
    deleteNotification: deleteNotificationAPI,
    addNotification,
    setError
  };
};
