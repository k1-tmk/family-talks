/**
 * LoginScreen Component
 * 
 * This screen handles family member authentication using a simple family code system.
 * Family members can log in using a shared family code, making it easy for everyone
 * to access the family chat without complex usernames/passwords.
 * 
 * React Native Concepts:
 * - TextInput: User input field for entering family code
 * - TouchableOpacity: Button component with touch feedback
 * - useState: Manages form state (family code, error messages)
 * - Alert: Shows user-friendly error messages
 * - Navigation: Programmatically navigates to main app after login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { FamilyMember } from '../types/Message';

// Import services
import { AuthService } from '../services/AuthService';

// Props interface for navigation
interface LoginScreenProps {
  navigation: any; // In a real app, you'd use proper navigation types
}

/**
 * LoginScreen Component
 * Handles family authentication and user setup
 */
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // State management for form inputs
  const [familyCode, setFamilyCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle family code submission
   * Validates the code and creates/authenticates family member
   */
  const handleLogin = async () => {
    // Input validation
    if (!familyCode.trim() || !memberName.trim()) {
      Alert.alert('Error', 'Please enter both family code and your name');
      return;
    }

    if (familyCode.length < 4) {
      Alert.alert('Error', 'Family code must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Try to authenticate with the family code
      const user = await AuthService.authenticateFamilyMember(familyCode, memberName);
      
      if (user) {
        // Success! Navigate to main app
        // In a real app, you'd pass the user data to the main app
        Alert.alert('Success', `Welcome to Family Talks, ${memberName}!`);
        navigation.navigate('Main'); // Navigate to main app after successful login
      } else {
        Alert.alert('Error', 'Invalid family code. Please check and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new family (for the first user)
   * Generates a new family code and sets up the family
   */
  const handleCreateFamily = async () => {
    if (!memberName.trim()) {
      Alert.alert('Error', 'Please enter your name to create a family');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a new family code
      const newFamilyCode = generateFamilyCode();
      const user = await AuthService.createFamily(newFamilyCode, memberName);
      
      if (user) {
        setFamilyCode(newFamilyCode);
        Alert.alert(
          'Family Created!', 
          `Your family code is: ${newFamilyCode}\n\nShare this code with your family members so they can join!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Main') // Navigate to main app after creating family
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create family. Please try again.');
      console.error('Create family error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate a random family code
   * Creates a 6-character alphanumeric code
   */
  const generateFamilyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* App Header */}
          <View style={styles.header}>
            <Icon name="family-restroom" size={80} color="#4A90E2" />
            <Text style={styles.title}>Family Talks</Text>
            <Text style={styles.subtitle}>Private family messaging</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={memberName}
              onChangeText={setMemberName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text style={styles.label}>Family Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter family code"
              value={familyCode}
              onChangeText={setFamilyCode}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
            />

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Joining...' : 'Join Family'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleCreateFamily}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Create New Family
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              • Share your family code with family members{'\n'}
              • All messages are stored locally on your device{'\n'}
              • Optional backup to Google Drive for safety{'\n'}
              • End-to-end encryption for privacy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for the LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4A90E2',
  },
  infoSection: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
});

export default LoginScreen;
