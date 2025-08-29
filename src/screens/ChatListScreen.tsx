/**
 * ChatListScreen Component
 * 
 * This screen shows a list of family members to chat with.
 * It's used in the bottom tab navigation and doesn't require route parameters.
 * 
 * React Native Concepts:
 * - FlatList: Efficient list rendering for family members
 * - Navigation: Navigate to individual chat screens
 * - State management: Load and display family members
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { FamilyMember } from '../types/Message';

// Import services
import { AuthService } from '../services/AuthService';

// Import components
import FamilyMemberCard from '../components/FamilyMemberCard';

// Props interface for navigation
interface ChatListScreenProps {
  navigation: any;
}

/**
 * ChatListScreen Component
 * Shows list of family members to chat with
 */
const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  // State management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setIsLoading(true);
      const [user, members] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getFamilyMembers(),
      ]);
      
      setCurrentUser(user);
      // Filter out current user from the list
      setFamilyMembers(members.filter(member => member.id !== user?.id));
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFamilyMembers();
    setIsRefreshing(false);
  };

  const handleMemberPress = (member: FamilyMember) => {
    // Navigate to individual chat with this member
    if (navigation && navigation.navigate) {
      navigation.navigate('Chat', { memberId: member.id, memberName: member.name });
    }
  };

  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <FamilyMemberCard
      member={item}
      isCurrentUser={false}
      onPress={() => handleMemberPress(item)}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="refresh" size={40} color="#4A90E2" />
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Family Chats</Text>
        <Text style={styles.subtitle}>
          Tap on a family member to start chatting
        </Text>
      </View>

      {/* Family Members List */}
      <FlatList
        data={familyMembers}
        renderItem={renderFamilyMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.membersList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chat-bubble-outline" size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No family members yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add family members from the Home screen
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Styles for the ChatListScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  membersList: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
});

export default ChatListScreen;
