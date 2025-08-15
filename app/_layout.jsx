// RootLayout.js
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useAuthStore from "../store/authStore"; // Import the auth store
import NotificationListener from "../components/NotificationListener";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);
  const { user, fetchCurrentUser } = useAuthStore(); // Access user and fetchCurrentUser from store
  const router = useRouter();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Simulate app resource loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Fetch current user to check authentication status
        await fetchCurrentUser();
        setAppReady(true);
      } catch (e) {
        setError(e);
        console.warn("Error loading app resources:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, [fetchCurrentUser]);

  // Redirect based on authentication state after app is ready
  useEffect(() => {
    if (appReady) {
      if (user) {
        // If user is authenticated, redirect to the main app (drawer)
        router.replace("/(drawer)");
      } else {
        // If no user, redirect to login (or keep on index for onboarding)
        router.replace("/");
      }
    }
  }, [appReady, user, router]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading app resources. Please try again.</Text>
      </View>
    );
  }

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Add NotificationListener for real-time updates */}
      {user && <NotificationListener />}
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="(drawer)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="auth/Login"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="auth/Register"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="booking/bus"
          options={{
            title: "Available bus",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="booking/busDetails"
          options={{
            title: "Bus Details",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="booking/seats"
          options={{
            title: "Select Seats",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="booking/tripSummary"
          options={{
            title: "Trip Summary",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="booking/travellerDetail"
          options={{
            title: "Traveller Details",
            animation: "fade",
            headerStyle: {
              backgroundColor: "#ff6536",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: 100,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 1,
            },
            headerTitleAlign: "center",
            headerTintColor: "#ffffff",
            headerBackTitleVisible: false,
            headerLeftContainerStyle: {
              paddingLeft: 20,
            },
            headerRightContainerStyle: {
              paddingRight: 20,
            },
          }}
        />
        <Stack.Screen
          name="hiring/selectBus"
          options={{
            title: "Select Bus",
            animation: "fade",
            headerStyle: {
              backgroundColor: "#ff6536",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: 100,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 1,
            },
            headerTitleAlign: "center",
            headerTintColor: "#ffffff",
            headerBackTitleVisible: false,
            headerLeftContainerStyle: {
              paddingLeft: 20,
            },
            headerRightContainerStyle: {
              paddingRight: 20,
            },
          }}
        />
        <Stack.Screen
          name="hiring/passengerInfo"
          options={{
            title: "Passenger Info",
            animation: "fade",
            headerStyle: {
              backgroundColor: "#ff6536",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: 100,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 1,
            },
            headerTitleAlign: "center",
            headerTintColor: "#ffffff",
            headerBackTitleVisible: false,
            headerLeftContainerStyle: {
              paddingLeft: 20,
            },
            headerRightContainerStyle: {
              paddingRight: 20,
            },
          }}
        />
        <Stack.Screen
          name="editProfile"
          options={{
            title: "Edit Profile",
            animation: "fade",
            headerStyle: {
              backgroundColor: "#ff6536",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              height: 100,
            },
            headerTitleStyle: {
              fontSize: 22,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 1,
            },
            headerTitleAlign: "center",
            headerTintColor: "#ffffff",
            headerBackTitleVisible: false,
            headerLeftContainerStyle: {
              paddingLeft: 20,
            },
            headerRightContainerStyle: {
              paddingRight: 20,
            },
          }}
        />
      </Stack>
      <StatusBar />
    </SafeAreaProvider>
  );
}
