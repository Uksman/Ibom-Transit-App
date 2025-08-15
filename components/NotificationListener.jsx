import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import useSocket from '../hooks/useSocket';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';

// Conditionally import expo-notifications for development builds
let Notifications;
try {
  Notifications = require('expo-notifications');
  // Configure how notifications should be handled when the app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.warn('expo-notifications not available, likely running in Expo Go');
  Notifications = null;
}

const NotificationListener = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setUnreadCount
  } = useNotificationStore();

  useEffect(() => {
    if (socket && isConnected && user) {
      console.log('🔔 Setting up notification listeners');

      // Listen for new notifications
      socket.on('notification:new', async (data) => {
        console.log('📢 New notification received:', data);
        
        const notification = data.notification;
        
        // Add to local store
        addNotification({
          ...notification,
          isRead: false,
          receivedAt: new Date().toISOString()
        });

        // Show local notification if app is in background/foreground (only in development builds)
        if (Notifications) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notification.title,
                body: notification.message,
                data: notification.data || {},
                sound: 'default',
              },
              trigger: null, // Show immediately
            });
          } catch (error) {
            console.error('Error showing local notification:', error);
          }
        }

        // Show alert if app is in foreground (optional)
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert(
            notification.title,
            notification.message,
            [
              {
                text: 'Dismiss',
                style: 'cancel',
              },
              {
                text: 'View',
                onPress: () => {
                  // Handle navigation to relevant screen
                  console.log('Navigate to:', notification.data?.actionUrl);
                },
              },
            ]
          );
        }
      });

      // Listen for notification read events
      socket.on('notification:read', (data) => {
        console.log('📖 Notification marked as read:', data);
        markAsRead(data.notificationId);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      });

      // Listen for all notifications read
      socket.on('notifications:allRead', (data) => {
        console.log('📚 All notifications marked as read:', data);
        markAllAsRead();
      });

      // Listen for notification deleted
      socket.on('notification:deleted', (data) => {
        console.log('🗑️ Notification deleted:', data);
        removeNotification(data.notificationId);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      });

      // Listen for notification sync (when read on another device)
      socket.on('notification:syncRead', (data) => {
        console.log('🔄 Syncing notification read status:', data);
        markAsRead(data.notificationId);
      });

      // Listen for booking updates
      socket.on('booking:statusUpdate', (data) => {
        console.log('🎫 Booking status update:', data);
        
        // You can show a local notification for booking updates too (only in development builds)
        if (data.booking && data.status && Notifications) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Booking Update',
              body: `Your booking ${data.booking.bookingNumber} status: ${data.status}`,
              data: { bookingId: data.booking._id },
            },
            trigger: null,
          }).catch(console.error);
        }
      });

      // Listen for bus location updates
      socket.on('bus:locationUpdate', (data) => {
        console.log('🚌 Bus location update:', data);
        // Handle bus location updates for tracking
      });

      // Listen for payment updates
      socket.on('payment:statusUpdate', (data) => {
        console.log('💳 Payment status update:', data);
        
        if (data.status === 'successful' && Notifications) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Payment Successful',
              body: `Payment for booking ${data.bookingNumber} was successful!`,
              data: { bookingId: data.bookingId },
            },
            trigger: null,
          }).catch(console.error);
        }
      });

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up notification listeners');
        socket.off('notification:new');
        socket.off('notification:read');
        socket.off('notifications:allRead');
        socket.off('notification:deleted');
        socket.off('notification:syncRead');
        socket.off('booking:statusUpdate');
        socket.off('bus:locationUpdate');
        socket.off('payment:statusUpdate');
      };
    }
  }, [socket, isConnected, user]);

  // Request notification permissions on mount (only in development builds)
  useEffect(() => {
    if (Notifications) {
      const requestPermissions = async () => {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Notification permissions not granted');
          } else {
            console.log('✅ Notification permissions granted');
          }
        } catch (error) {
          console.error('Error requesting notification permissions:', error);
        }
      };

      requestPermissions();
    } else {
      console.log('📱 Running in Expo Go - push notifications not available');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default NotificationListener;
