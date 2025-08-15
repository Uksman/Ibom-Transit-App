import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../store/authStore';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (token && user) {
      // Remove /api from the backend URL for socket connection
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
      const serverUrl = backendUrl.replace('/api', '');
      
      socketRef.current = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('✅ Connected to socket server:', socketRef.current.id);
        setIsConnected(true);
        
        // Authenticate with the server
        socketRef.current.emit('authenticate', {
          userId: user._id || user.id,
          token: token
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Disconnected from socket server');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      // Authentication response
      socketRef.current.on('authenticated', (data) => {
        if (data.success) {
          console.log('✅ Socket authentication successful for user:', data.userId);
        } else {
          console.error('❌ Socket authentication failed:', data.error);
        }
      });

      // Cleanup on unmount or when dependencies change
      return () => {
        if (socketRef.current) {
          console.log('🧹 Cleaning up socket connection');
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setIsConnected(false);
      };
    }
  }, [token, user]);

  // Helper functions for joining/leaving rooms
  const joinBookingRoom = (bookingId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join:booking', bookingId);
      console.log('📍 Joined booking room:', bookingId);
    }
  };

  const joinBusRoom = (busId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join:bus', busId);
      console.log('🚌 Joined bus room:', busId);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('notification:read', notificationId);
      console.log('📖 Marked notification as read:', notificationId);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinBookingRoom,
    joinBusRoom,
    markNotificationAsRead
  };
};

export default useSocket;
