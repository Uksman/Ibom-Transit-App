import { View, Text, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNotifications } from '../../../hooks/useNotifications'

const Notifications = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {
    notifications,
    loading,
    unreadCount,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setError
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
            } catch (error) {
              setError(error.message);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getIconName = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle'
      case 'info':
        return 'information-circle'
      case 'warning':
        return 'alert-circle'
      case 'error':
        return 'close-circle'
      default:
        return 'notifications'
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500'
      case 'info':
        return 'text-orange-500'
      case 'warning':
        return 'text-amber-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getGradientColors = (type) => {
    switch (type) {
      case 'success':
        return ['#10B981', '#059669']
      case 'info':
        return ['#F97316', '#EA580C']
      case 'warning':
        return ['#F59E0B', '#D97706']
      case 'error':
        return ['#EF4444', '#DC2626']
      default:
        return ['#6B7280', '#4B5563']
    }
  }

  // Loading state
  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-orange-50 justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-600 mt-4 text-lg">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-orange-50">
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        className="px-6 pt-12 pb-6 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Notifications</Text>
            <Text className="text-white/90 mt-1 text-base">
              {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
            </Text>
          </View>
          <View className="flex-row space-x-2">
            {unreadCount > 0 && (
              <TouchableOpacity 
                onPress={handleMarkAllAsRead}
                className="bg-white/20 p-3 rounded-full"
              >
                <Ionicons name="checkmark-done" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity className="bg-white/20 p-3 rounded-full">
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Error Display */}
      {error && (
        <View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text className="text-red-700 ml-2 flex-1">{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView 
        className="flex-1 px-4 -mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F97316']}
            tintColor="#F97316"
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              className={`mb-4 rounded-2xl overflow-hidden shadow-sm ${
                !notification.read ? 'bg-white' : 'bg-white/80'
              }`}
              style={{
                transform: [{ scale: 1 }],
                elevation: 2,
              }}
            >
              <LinearGradient
                colors={getGradientColors(notification.type)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-1"
              />
              <View className="p-4">
                <View className="flex-row items-start space-x-4">
                  <View className={`mt-1 ${getIconColor(notification.type)}`}>
                    <Ionicons name={getIconName(notification.type)} size={28} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-bold text-gray-800">
                        {notification.title}
                      </Text>
                      <Text className="text-sm text-gray-500 font-medium">
                        {notification.time}
                      </Text>
                    </View>
                    <Text className="text-gray-600 mt-2 leading-5">
                      {notification.message}
                    </Text>
                    <View className="mt-3 flex-row justify-end space-x-2">
                      {!notification.read && (
                        <TouchableOpacity 
                          onPress={() => handleMarkAsRead(notification.id)}
                          className="bg-orange-50 px-4 py-2 rounded-full"
                        >
                          <Text className="text-orange-600 font-medium">Mark as read</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        onPress={() => handleDeleteNotification(notification.id)}
                        className="bg-red-50 px-4 py-2 rounded-full"
                      >
                        <Text className="text-red-600 font-medium">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Empty State */}
      {notifications.length === 0 && !loading && (
        <View className="flex-1 items-center justify-center p-4">
          <View className="bg-orange-50 p-8 rounded-full mb-4">
            <Ionicons name="notifications-off" size={64} color="#F97316" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mt-4">
            No Notifications
          </Text>
          <Text className="text-gray-500 text-center mt-2 text-base">
            You don&apos;t have any notifications at the moment
          </Text>
          <TouchableOpacity 
            onPress={onRefresh}
            className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default Notifications