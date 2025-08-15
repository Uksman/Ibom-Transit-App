import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Help & Support Content */}
        <Text style={styles.paragraph}>If you encounter any issues or need assistance with Ibom Transit, please reach out to our support team through the following channels:</Text>
        <View style={styles.contactMethod}>
          <Ionicons name="mail" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.contactText}>Email: support@ibomtransit.com</Text>
        </View>
        <View style={styles.contactMethod}>
          <MaterialCommunityIcons name="account-question" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.contactText}>FAQ: Visit our FAQ section in the app</Text>
        </View>
        <View style={styles.contactMethod}>
          <Ionicons name="call" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.contactText}>Phone: +234 800 123 4567</Text>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1f2937',
  },
});

