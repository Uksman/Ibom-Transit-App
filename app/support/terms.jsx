import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Terms and Conditions Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.paragraph}>
            Welcome to Ibom Transit. By using our app, you agree to comply with 
            the following terms and conditions. Please read them carefully.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Use of Service: </Text>
            Our app provides a platform for booking bus tickets across Nigeria. 
            You agree to use it responsibly and not engage in any activities that 
            could harm the platform or other users.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Account Responsibility: </Text>
            As a user, you are responsible for maintaining the confidentiality 
            of your account information and for all activities that occur under 
            your account.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Payment and Refunds: </Text>
            Payments for tickets are processed securely through our app. Refunds 
            are subject to the terms of the bus operator you travel with.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Privacy Policy: </Text>
            Your privacy is important to us. Our privacy policy explains how we 
            collect and use your information.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Changes to Terms: </Text>
            Ibom Transit reserves the right to change these terms at any time. 
            We will notify you of any changes by updating the app with the 
            revised terms.
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
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
  },
});

