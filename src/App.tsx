/**
 * Family Talks - Main App Component
 * 
 * This is the root component of the Family Talks application.
 * It sets up navigation, context providers, and the overall app structure.
 * 
 * React Native Concepts:
 * - NavigationContainer: Wraps the entire navigation system
 * - Stack Navigator: Manages screen transitions
 * - Context: Provides data to child components without prop drilling
 * - useEffect: Handles side effects like app initialization
 * - useState: Manages local component state
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import ChatListScreen from './screens/ChatListScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import BackupScreen from './screens/BackupScreen';
import AdminScreen from './screens/AdminScreen';

// Import components
import TabBarIcon from './components/TabBarIcon';

// Import services
import { AuthService } from './services/AuthService';
import { StorageService } from './services/StorageService';

// Import types
import { FamilyMember, AppSettings } from './types/Message';

// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ignore specific warnings for development
LogBox.ignoreLogs(['AsyncStorage has been extracted']);

/**
 * Main Tab Navigator
 * Provides bottom tab navigation for the main app screens
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon 
            routeName={route.name} 
            focused={focused} 
            color={color} 
            size={size} 
          />
        ),
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Family' }}
      />
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Component
 * Root component that manages authentication state and navigation
 */
export default function App() {
  // State management for app initialization
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  /**
   * Initialize the app when it first loads
   * This runs once when the component mounts
   */
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize app data and check authentication status
   * Loads user data, settings, and checks if user is logged in
   */
  const initializeApp = async () => {
    try {
      // Check if user is already authenticated
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }

      // Load app settings
      const settings = await StorageService.getAppSettings();
      if (settings) {
        setAppSettings(settings);
      } else {
        // Set default settings if none exist
        const defaultSettings: AppSettings = {
          encryptionEnabled: true,
          autoBackup: true,
          backupFrequency: 'weekly',
          notificationsEnabled: true,
          soundEnabled: true,
          theme: 'auto',
          language: 'en',
        };
        await StorageService.saveAppSettings(defaultSettings);
        setAppSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      // Handle initialization errors gracefully
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user login
   * Updates authentication state and loads user data
   */
  const handleLogin = async (user: FamilyMember) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    await AuthService.setCurrentUser(user);
  };

  /**
   * Handle user logout
   * Clears authentication state and user data
   */
  const handleLogout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    await AuthService.clearCurrentUser();
  };

  // Show loading screen while initializing
  if (isLoading) {
    return null; // You can add a proper loading screen here
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            // Authenticated user sees main app
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Backup" component={BackupScreen} />
              <Stack.Screen name="Admin" component={AdminScreen} />
            </>
          ) : (
            // Unauthenticated user sees login
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
