import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  StatusBar,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useAuthStore from "../../../store/authStore";
import useThemeStore from "../../../store/themeStore";
import { getTheme, COLORS } from "../../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [locationService, setLocationService] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme, setSystemTheme, isSystemTheme } = useThemeStore();
  const theme = getTheme(isDarkMode);
  const router = useRouter();

  // Available languages
  const availableLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸', nativeName: 'English' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', nativeName: 'English' },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬', nativeName: 'Yorùbá' },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬', nativeName: 'Hausa' },
    { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬', nativeName: 'Igbo' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', nativeName: '简体中文' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
  ];

  const getCurrentLanguage = () => {
    return availableLanguages.find(lang => lang.code === selectedLanguage) || availableLanguages[0];
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.code);
    setLanguageModalVisible(false);
    // Here you would typically also update your app's language/locale
    console.log('Language changed to:', language.name);
  };

  const goToPersonal = () => router.push("/editProfile");
  const goSecurity = () => router.push("/Notification");
  const goToPayment = () => setModalVisible(true);
  const signOut = () => {
    logout();
    router.replace("/auth/Login");
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const goToManageAddress = () => {};
  const goToHelpCenter = () => router.push("/support/help");
  const goToTerms = () => router.push("/support/terms");
  const goToPrivacy = () => router.push("/support/privacy");
  const goToAbout = () => router.push("/support/about");


  const AcctSetting = [
    {
      icon1: "person-outline",
      icon2: "chevron-forward",
      text1: "Personal Information",
      text2: "Manage your personal details",
      action: goToPersonal,
      type: "link",
      iconColor: "#ff6536",
      bgColor: "#ffe8e0",
    },
    {
      icon1: "shield-checkmark-outline",
      icon2: "chevron-forward",
      text1: "Security Settings",
      text2: "Password, PIN, biometries",
      action: goSecurity,
      type: "link",
      iconColor: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      icon1: "card-outline",
      icon2: "chevron-forward",
      text1: "Payment Methods",
      text2: "Manage your payment options",
      action: goToPayment,
      iconColor: "#f59e0b",
      bgColor: "#fffbeb",
      type: "link",
    },
  ];

  const AppSetting = [
    {
      icon1: "notifications-outline",
      icon2: "chevron-forward",
      text1: "Notifications",
      text2: "Manage notification preferences",
      action: goToPersonal,
      type: "link",
      iconColor: "#ff6536",
      bgColor: "#ffe8e0",
    },
    {
      icon1: "language",
      icon2: "chevron-forward",
      text1: "Language",
      text2: getCurrentLanguage().name,
      action: () => setLanguageModalVisible(true),
      type: "link",
      iconColor: "#06b6d4",
      bgColor: "#ecfeff",
    },
    {
      icon1: "moon",
      text1: "Dark Mode",
      text2: isSystemTheme ? "Following system preference" : "Manual override",
      action: toggleTheme,
      iconColor: theme.primary,
      bgColor: theme.surface,
      type: "toggle",
      value: isDarkMode,
      onValueChange: toggleTheme,
    },
    {
      icon1: "phone-portrait-outline",
      text1: "System Theme",
      text2: "Follow device settings",
      action: setSystemTheme,
      iconColor: "#06b6d4",
      bgColor: "#ecfeff",
      type: "toggle",
      value: isSystemTheme,
      onValueChange: () => isSystemTheme ? null : setSystemTheme(),
    },
    {
      icon1: "location",
      text1: "Location Service",
      text2: "Allow app to access location",
      action: () => setLocationService(!locationService),
      iconColor: "#ef4444",
      bgColor: "#fef2f2",
      type: "toggle",
      value: locationService,
      onValueChange: setLocationService,
    },
  ];

  const SupportAbout = [
    {
      icon1: "help-circle-outline",
      icon2: "chevron-forward",
      text1: "Help & Support",
      text2: "Get help with the app",
      action: goToHelpCenter,
      type: "link",
      iconColor: "#ff6536",
      bgColor: "#ffe8e0",
    },
    {
      icon1: "document-text-outline",
      icon2: "chevron-forward",
      text1: "Terms & Conditions",
      text2: "Read our terms of service",
      action: goToTerms,
      type: "link",
      iconColor: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      icon1: "shield-outline",
      icon2: "chevron-forward",
      text1: "Privacy Policy",
      text2: "How we handle your data",
      action: goToPrivacy,
      iconColor: "#f59e0b",
      bgColor: "#fffbeb",
      type: "link",
    },
    {
      icon1: "information-circle-outline",
      icon2: "chevron-forward",
      text1: "About Ibom Transit",
      text2: "Version 2.5.0",
      action: goToAbout,
      iconColor: "#ff6536",
      bgColor: "#ffe8e0",
      type: "link",
    },
  ];

  const renderSettingItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon1} size={22} color={item.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{item.text1}</Text>
          <Text style={styles.settingSubtitle}>{item.text2}</Text>
        </View>
      </View>
      {item.type === "toggle" ? (
        <Switch
          trackColor={{ false: "#e5e7eb", true: "#ff6536" }}
          thumbColor={item.value ? "#ffffff" : "#f4f3f4"}
          ios_backgroundColor="#e5e7eb"
          onValueChange={item.onValueChange}
          value={item.value}
          style={styles.switch}
        />
      ) : (
        <Ionicons name={item.icon2} size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#ff6536", "#ea580c"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color="#ff6536" />
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || "Guest User"}</Text>
                <Text style={styles.userEmail}>
                  {user.email || "guest@example.com"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Account Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Account Settings</Text>
            </View>
            <View style={styles.settingsContainer}>
              {AcctSetting.map((item, index) => renderSettingItem(item, index))}
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>App Settings</Text>
            </View>
            <View style={styles.settingsContainer}>
              {AppSetting.map((item, index) => renderSettingItem(item, index))}
            </View>
          </View>

          {/* Support & About */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Support & About</Text>
            </View>
            <View style={styles.settingsContainer}>
              {SupportAbout.map((item, index) =>
                renderSettingItem(item, index)
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ffffff" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        statusBarTranslucent
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIcon}>
                <Ionicons name="log-out-outline" size={40} color="#ef4444" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={hideModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={signOut}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            {/* Header */}
            <View style={styles.languageModalHeader}>
              <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.languageHeaderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.languageModalTitle}>Choose Language</Text>
                <Text style={styles.languageModalSubtitle}>Select your preferred language</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setLanguageModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Language List */}
            <ScrollView 
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            >
              {availableLanguages.map((item, index) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.languageItem,
                    selectedLanguage === item.code && styles.selectedLanguageItem,
                    index === availableLanguages.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageItemContent}>
                    <Text style={styles.languageFlag}>{item.flag}</Text>
                    <View style={styles.languageTextContainer}>
                      <Text style={styles.languageName}>{item.name}</Text>
                      <Text style={styles.languageNativeName}>{item.nativeName}</Text>
                    </View>
                  </View>
                  {selectedLanguage === item.code && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.PRIMARY} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.languageFooter}>
              <Text style={styles.languageFooterText}>
                Language changes will take effect after app restart
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff6536",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    backgroundColor: "#ff6536",
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  settingsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  // Language Modal Styles
  languageModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  languageModalHeader: {
    position: "relative",
  },
  languageHeaderGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 30,
  },
  languageModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  languageModalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageList: {
    flexGrow: 1,
    minHeight: 200,
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedLanguageItem: {
    backgroundColor: "#fff7ed",
  },
  languageItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  languageFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  languageFooterText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
});
