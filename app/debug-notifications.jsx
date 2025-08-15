import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSocket from '../hooks/useSocket';
import useNotificationStore from '../store/notificationStore';
import { useNotifications } from '../hooks/useNotifications';
import useAuthStore from '../store/authStore';

const DebugNotifications = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);
  const { notifications, fetchNotifications } = useNotifications();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: Date.now(),
      message,
      type,
      timestamp
    }, ...prev.slice(0, 19)]); // Keep only last 20 logs
  };

  useEffect(() => {
    addLog(`Component mounted. User: ${user?.name || 'Unknown'}`, 'success');
    addLog(`Socket connected: ${isConnected}`, isConnected ? 'success' : 'error');
  }, []);

  useEffect(() => {
    if (socket) {
      addLog('Socket instance available', 'success');
      
      // Listen for authentication events
      socket.on('authenticated', (data) => {
        addLog(`Socket authenticated: ${JSON.stringify(data)}`, 'success');
      });

      // Listen for new notifications
      socket.on('notification:new', (data) => {
        addLog(`🔔 New notification received: ${data.notification.title}`, 'warning');
        console.log('Notification data:', data);
      });

      return () => {
        socket.off('authenticated');
        socket.off('notification:new');
      };
    } else {
      addLog('No socket instance available', 'error');
    }
  }, [socket]);

  const testBackendConnection = async () => {
    setTesting(true);
    addLog('Testing backend connection...', 'info');
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/debug/socket-status`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      addLog(`Backend response: ${JSON.stringify(data)}`, 'success');
    } catch (error) {
      addLog(`Backend connection error: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const testNotification = async () => {
    setTesting(true);
    addLog('Sending test notification...', 'info');
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/debug/test-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      addLog(`Test notification result: ${JSON.stringify(data)}`, data.status === 'success' ? 'success' : 'error');
    } catch (error) {
      addLog(`Test notification error: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const refreshNotifications = async () => {
    addLog('Refreshing notifications from API...', 'info');
    try {
      await fetchNotifications();
      addLog(`Fetched ${notifications.length} notifications from API`, 'success');
    } catch (error) {
      addLog(`Error fetching notifications: ${error.message}`, 'error');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">🧪 Notification Debug</Text>
      
      {/* Status Cards */}
      <View className="mb-4 space-y-2">
        <View className="bg-white p-4 rounded-lg shadow-sm">
          <Text className="font-semibold text-gray-700">Connection Status</Text>
          <Text className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            Socket.io: {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </Text>
          <Text className="text-sm text-gray-600">User: {user?.name || 'Unknown'}</Text>
          <Text className="text-sm text-gray-600">Notifications: {notifications.length}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        <TouchableOpacity
          onPress={testBackendConnection}
          disabled={testing}
          className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
        >
          {testing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="server" size={16} color="white" />
          )}
          <Text className="text-white ml-2 font-semibold">Test Backend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testNotification}
          disabled={testing}
          className="bg-orange-500 px-4 py-2 rounded-lg flex-row items-center"
        >
          {testing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="notifications" size={16} color="white" />
          )}
          <Text className="text-white ml-2 font-semibold">Send Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={refreshNotifications}
          className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text className="text-white ml-2 font-semibold">Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLogs([])}
          className="bg-gray-500 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text className="text-white ml-2 font-semibold">Clear Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View className="flex-1">
        <Text className="font-semibold text-gray-700 mb-2">Debug Logs</Text>
        <ScrollView className="bg-white rounded-lg p-4 flex-1" showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <Text className="text-gray-500 italic">No logs yet...</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} className="mb-2 pb-2 border-b border-gray-100">
                <View className="flex-row justify-between items-start">
                  <Text className={`flex-1 text-sm ${getLogColor(log.type)}`}>
                    {log.message}
                  </Text>
                  <Text className="text-xs text-gray-400 ml-2">{log.timestamp}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default DebugNotifications;
