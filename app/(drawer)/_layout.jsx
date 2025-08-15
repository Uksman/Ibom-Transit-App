import { Drawer } from "expo-router/drawer";
import { DrawerItemList } from "@react-navigation/drawer";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import useAuthStore from "../../store/authStore";

const { width } = Dimensions.get('window');

export default function Layout() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/Login');
          },
        },
      ]
    );
  };

  const CustomDrawerContent = (props) => {
    return (
      <View style={styles.drawerContainer}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#ff6536', '#ff9500', '#ffb347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.avatarGradient}
              >
                <FontAwesome5 name="user-alt" size={28} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name || "Welcome, Guest!"}
              </Text>
              <Text style={styles.userStatus}>Premium Member</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="star" size={20} color="#ffb300" />
              </View>
              <View>
                <Text style={styles.statValue}>2,450</Text>
                <Text style={styles.statLabel}>Travel Points</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="route" size={16} color="#4ade80" />
              </View>
              <View>
                <Text style={styles.statValue}>23</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/editProfile")}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu Items */}
        <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Main Menu</Text>
            
            {/* Custom Menu Items */}
            <TouchableOpacity 
              style={[styles.menuItem, props.state.index === 0 && styles.menuItemActive]}
              onPress={() => props.navigation.navigate('(tabs)')}
            >
              <View style={[styles.menuItemIcon, props.state.index === 0 && styles.menuItemIconActive]}>
                <Ionicons 
                  name='home' 
                  size={22} 
                  color={props.state.index === 0 ? '#ff6536' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.menuItemText, props.state.index === 0 && styles.menuItemTextActive]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, props.state.index === 1 && styles.menuItemActive]}
              onPress={() => props.navigation.navigate('myTickets')}
            >
              <View style={[styles.menuItemIcon, props.state.index === 1 && styles.menuItemIconActive]}>
                <Ionicons 
                  name='ticket' 
                  size={22} 
                  color={props.state.index === 1 ? '#ff6536' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.menuItemText, props.state.index === 1 && styles.menuItemTextActive]}>
                My Tickets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, props.state.index === 2 && styles.menuItemActive]}
              onPress={() => props.navigation.navigate('myBookings')}
            >
              <View style={[styles.menuItemIcon, props.state.index === 2 && styles.menuItemIconActive]}>
                <FontAwesome5 
                  name='clipboard-list' 
                  size={20} 
                  color={props.state.index === 2 ? '#ff6536' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.menuItemText, props.state.index === 2 && styles.menuItemTextActive]}>
                My Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, props.state.index === 3 && styles.menuItemActive]}
              onPress={() => props.navigation.navigate('tripHistory')}
            >
              <View style={[styles.menuItemIcon, props.state.index === 3 && styles.menuItemIconActive]}>
                <MaterialIcons 
                  name='history' 
                  size={22} 
                  color={props.state.index === 3 ? '#ff6536' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.menuItemText, props.state.index === 3 && styles.menuItemTextActive]}>
                Trip History
              </Text>
            </TouchableOpacity>

            {/* Additional Menu Items */}
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons 
                  name='notifications' 
                  size={22} 
                  color='#6b7280' 
                />
              </View>
              <Text style={styles.menuItemText}>
                Notifications
              </Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                // Add support functionality here
                Alert.alert('Support', 'Contact support at support@ibomtransit.com or call +234-800-IBOM-TRANSIT');
              }}
            >
              <View style={styles.menuItemIcon}>
                <FontAwesome5 
                  name='headset' 
                  size={20} 
                  color='#6b7280' 
                />
              </View>
              <Text style={styles.menuItemText}>
                Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                // Add settings functionality here
                Alert.alert('Settings', 'Settings screen coming soon!');
              }}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons 
                  name='settings' 
                  size={22} 
                  color='#6b7280' 
                />
              </View>
              <Text style={styles.menuItemText}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconContainer}>
              <MaterialIcons name="logout" size={20} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Ibom Transit</Text>
            <Text style={styles.appVersion}>Version 1.2.0</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#f8fafc",
            width: width * 0.85,
          },
          drawerActiveBackgroundColor: "rgba(255, 101, 54, 0.1)",
          drawerActiveTintColor: "#ff6536",
          drawerInactiveTintColor: "#6b7280",
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -20,
          },
          drawerItemStyle: {
            borderRadius: 12,
            marginVertical: 2,
            marginHorizontal: 8,
            paddingLeft: 16,
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name='(tabs)'
          options={{
            drawerLabel: "Home",
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name='home' size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name='myTickets'
          options={{
            drawerLabel: "My Tickets",
            title: "My Tickets",
            drawerIcon: ({ color, size }) => (
              <Ionicons name='ticket' size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name='myBookings'
          options={{
            drawerLabel: "My Bookings",
            title: "My Bookings",
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name='clipboard-list' size={size-2} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name='tripHistory'
          options={{
            drawerLabel: "Trip History",
            title: "Trip History",
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name='history' size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuScrollView: {
    flex: 1,
    paddingTop: 10,
  },
  menuSection: {
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6536',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 2,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 101, 54, 0.1)',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  menuItemIconActive: {
    backgroundColor: 'rgba(255, 101, 54, 0.15)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#ff6536',
    fontWeight: '700',
  },
  // Additional Menu Styles
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
    marginHorizontal: 24,
  },
  notificationBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
