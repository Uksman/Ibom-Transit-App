import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Policy Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            At Ibom Transit, we are committed to protecting your privacy and 
            ensuring the security of your personal information. This privacy 
            policy explains how we collect, use, and safeguard your data.
          </Text>
          
          <Text style={styles.subTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Personal Information: </Text>
            We collect information you provide when creating an account, 
            including your name, email address, phone number, and payment details.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Usage Information: </Text>
            We collect information about how you use our app, including your 
            travel history, search queries, and app interactions.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Device Information: </Text>
            We may collect information about your device, including device type, 
            operating system, and unique device identifiers.
          </Text>

          <Text style={styles.subTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            • To provide and improve our bus booking services
          </Text>
          <Text style={styles.paragraph}>
            • To process payments and communicate about bookings
          </Text>
          <Text style={styles.paragraph}>
            • To send important updates and notifications
          </Text>
          <Text style={styles.paragraph}>
            • To provide customer support and respond to inquiries
          </Text>
          <Text style={styles.paragraph}>
            • To analyze app usage and improve user experience
          </Text>

          <Text style={styles.subTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your 
            personal information. Your payment data is encrypted and processed 
            through secure payment gateways.
          </Text>

          <Text style={styles.subTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or rent your personal information to third 
            parties. We may share your information with trusted partners who 
            help us operate our service, such as payment processors and bus operators.
          </Text>

          <Text style={styles.subTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, update, or delete your personal 
            information. You can manage your account settings within the app 
            or contact us for assistance.
          </Text>

          <Text style={styles.subTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this privacy policy, please contact 
            us at privacy@ibomtransit.com or through the app's support section.
          </Text>

          <Text style={styles.lastUpdated}>
            Last updated: January 2024
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
