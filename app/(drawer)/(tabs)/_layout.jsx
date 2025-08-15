import { Tabs } from "expo-router";
import React from "react";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";

const { width: screenWidth } = Dimensions.get('window');

// Custom Tab Icon Component with animations
const TabIcon = ({ IconComponent, iconName, size = 24, color, focused, badge = null }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, [focused, scaleValue]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View 
        style={[
          styles.iconWrapper,
          focused && styles.iconWrapperActive,
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <IconComponent
          name={iconName}
          size={size}
          color={color}
          solid={focused}
        />
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#ff6536",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: { 
            fontSize: 12, 
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.95)' : '#fff',
            backdropFilter: Platform.OS === 'ios' && BlurView ? 'blur(20px)' : undefined,
            borderTopEndRadius: 30,
            borderTopStartRadius: 30,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingHorizontal: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 15,
          },
          tabBarBadgeStyle: {
            backgroundColor: '#ff6536',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          }
        }}>
        <Tabs.Screen
          name='index'
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                IconComponent={Ionicons}
                iconName={focused ? "home" : "home-outline"}
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='Hire'
          options={{
            title: "Hire",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                IconComponent={Ionicons}
                iconName={focused ? "bus" : "bus-outline"}
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='History'
          options={{
            title: "History",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                IconComponent={MaterialIcons}
                iconName={focused ? "history" : "history"}
                size={26}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='notifications'
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                IconComponent={Ionicons}
                iconName={focused ? "notifications" : "notifications-outline"}
                size={24}
                color={color}
                focused={focused}
                badge={3} // Dynamic notification count
              />
            ),
          }}
        />
        <Tabs.Screen
          name='Profile'
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                IconComponent={Ionicons}
                iconName={focused ? "person" : "person-outline"}
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 101, 54, 0.1)',
    shadowColor: '#ff6536',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
