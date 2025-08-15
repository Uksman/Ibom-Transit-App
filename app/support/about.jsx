import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  const handleContactPress = (type, value) => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'website':
        Linking.openURL(value);
        break;
      case 'social':
        Linking.openURL(value);
        break;
    }
  };

  const features = [
    { icon: 'location', text: 'Real-time bus tracking' },
    { icon: 'card', text: 'Secure payment options' },
    { icon: 'shield-checkmark', text: 'Safe & reliable travel' },
    { icon: 'chatbubbles', text: '24/7 customer support' },
    { icon: 'star', text: 'Premium bus fleet' },
    { icon: 'time', text: 'Flexible booking options' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appIcon}>
            <MaterialCommunityIcons name="bus" size={60} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.appName}>Ibom Transit</Text>
          <Text style={styles.version}>Version 2.5.0</Text>
          <Text style={styles.buildNumber}>Build 250</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.description}>
            Ibom Transit is a modern bus booking platform designed to make intercity 
            travel in Nigeria seamless and convenient. Built with the latest technology, 
            this app connects travelers with reliable bus operators across the country.
          </Text>
          <Text style={styles.description}>
            From Lagos to Abuja, Port Harcourt to Kano, Ibom Transit provides a 
            user-friendly platform for booking bus tickets, tracking trips, and 
            managing your travel experience.
          </Text>
        </View>

        {/* Developer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={styles.developerCard}>
            <View style={styles.developerIcon}>
              <Ionicons name="person" size={40} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>Uksman</Text>
              <Text style={styles.developerTitle}>Full Stack Developer & App Creator</Text>
              <Text style={styles.developerDescription}>
                Passionate about creating innovative solutions for Nigeria&apos;s transportation sector.
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={24} color={COLORS.PRIMARY} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technology Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With</Text>
          <View style={styles.techStack}>
            <View style={styles.techItem}>
              <Text style={styles.techName}>React Native</Text>
              <Text style={styles.techDescription}>Cross-platform mobile development</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Expo</Text>
              <Text style={styles.techDescription}>Development platform and tools</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Node.js</Text>
              <Text style={styles.techDescription}>Backend server technology</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>MongoDB</Text>
              <Text style={styles.techDescription}>Database management</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Developer</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContactPress('email', 'support@ibomtransit.com')}
          >
            <Ionicons name="mail" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.contactText}>support@ibomtransit.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContactPress('website', 'https://github.com/uksman')}
          >
            <Ionicons name="logo-github" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.contactText}>GitHub Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2025 Ibom Transit by Uksman
          </Text>
          <Text style={styles.copyright}>
            Made with ❤️ in Nigeria 🇳🇬
          </Text>
          <Text style={styles.copyright}>
            All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  appIcon: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 8,
  },
  version: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 4,
  },
  buildNumber: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
  },
  developerCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  developerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  developerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  developerDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  techStack: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  techItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});
