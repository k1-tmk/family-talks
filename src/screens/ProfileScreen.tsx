/**
 * ProfileScreen Component
 * 
 * This is a placeholder screen for user profile management.
 * It will be implemented later with profile editing features.
 * 
 * React Native Concepts:
 * - Placeholder components: Temporary screens during development
 * - Navigation: Screen that can be navigated to
 * - Basic layout: Simple view structure
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * ProfileScreen Component
 * Placeholder for user profile management
 */
const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="person" size={80} color="#4A90E2" />
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Profile management coming soon!
        </Text>
        <Text style={styles.description}>
          This screen will include:
          {'\n'}• Edit personal information
          {'\n'}• Change profile picture
          {'\n'}• Update family role
          {'\n'}• Privacy settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Styles for the ProfileScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ProfileScreen;
