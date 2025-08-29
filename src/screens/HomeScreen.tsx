/**
 * HomeScreen Component
 * 
 * This screen serves as the main dashboard for the Family Talks app.
 * It displays family members, recent activity, and provides quick access to key features.
 * Now includes admin panel access for users with appropriate permissions.
 * 
 * React Native Concepts:
 * - FlatList: Efficient list rendering for family members
 * - useEffect: Load data when component mounts
 * - useState: Manage component state
 * - TouchableOpacity: Interactive elements with touch feedback
 * - RefreshControl: Pull-to-refresh functionality
 * - Navigation: Programmatic navigation to other screens
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { FamilyMember, Message, Chat } from '../types/Message';

// Import services
import { AuthService } from '../services/AuthService';
import { StorageService } from '../services/StorageService';

// Import utilities
import { canManageMembers, isAdmin } from '../utils/RolePermissions';

// Import components
import FamilyMemberCard from '../components/FamilyMemberCard';
import RecentActivityCard from '../components/RecentActivityCard';

// Props interface for navigation
interface HomeScreenProps {
  navigation: any; // In a real app, you'd use proper navigation types
}

/**
 * HomeScreen Component
 * Main dashboard showing family overview and recent activity
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // State management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load initial data when component mounts
   */
  useEffect(() => {
    loadHomeData();
  }, []);

  /**
   * Load all data needed for the home screen
   */
  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Load data in parallel for better performance
      const [user, members, messages, chats] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getFamilyMembers(),
        StorageService.getMessages(),
        StorageService.getChats(),
      ]);

      setCurrentUser(user);
      setFamilyMembers(members);
      setRecentMessages(messages.slice(-5)); // Last 5 messages
      setRecentChats(chats.slice(-3)); // Last 3 chats
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadHomeData();
    setIsRefreshing(false);
  }, []);

  /**
   * Handle family member selection
   * @param member - Selected family member
   */
  const handleMemberPress = (member: FamilyMember) => {
    // Navigate to chat with this member
    if (navigation && navigation.navigate) {
      navigation.navigate('Chat', { memberId: member.id, memberName: member.name });
    } else {
      Alert.alert('Navigation Error', 'Unable to navigate to chat');
    }
  };

  /**
   * Handle recent message selection
   * @param message - Selected message
   */
  const handleMessagePress = (message: Message) => {
    // Navigate to the specific chat
    if (navigation && navigation.navigate) {
      navigation.navigate('Chat', { chatId: message.chatId, messageId: message.id });
    } else {
      Alert.alert('Navigation Error', 'Unable to navigate to message');
    }
  };

  /**
   * Handle recent chat selection
   * @param chat - Selected chat
   */
  const handleChatPress = (chat: Chat) => {
    // Navigate to the chat
    if (navigation && navigation.navigate) {
      navigation.navigate('Chat', { chatId: chat.id });
    } else {
      Alert.alert('Navigation Error', 'Unable to navigate to chat');
    }
  };

  /**
   * Navigate to admin panel
   */
  const navigateToAdmin = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Admin');
    } else {
      Alert.alert('Navigation Error', 'Unable to navigate to admin panel');
    }
  };

  /**
   * Check if current user has admin access
   */
  const hasAdminAccess = (): boolean => {
    if (!currentUser) return false;
    return canManageMembers(currentUser.role);
  };

  /**
   * Render individual family member
   */
  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <FamilyMemberCard
      member={item}
      isCurrentUser={item.id === currentUser?.id}
      onPress={() => handleMemberPress(item)}
    />
  );

  /**
   * Render recent activity item
   */
  const renderRecentActivity = ({ item }: { item: Message }) => (
    <RecentActivityCard
      message={item}
      onPress={() => handleMessagePress(item)}
    />
  );

  /**
   * Render quick action button
   */
  const renderQuickAction = (icon: string, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <Icon name={icon} size={24} color="#4A90E2" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="refresh" size={40} color="#4A90E2" />
          <Text style={styles.loadingText}>Loading family data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {currentUser?.name || 'Family Member'}! 👋
          </Text>
          <Text style={styles.subtitleText}>
            Stay connected with your family
          </Text>
          
          {/* Admin Badge */}
          {hasAdminAccess() && (
            <View style={styles.adminBadge}>
              <Icon name="admin-panel-settings" size={16} color="#FFFFFF" />
              <Text style={styles.adminBadgeText}>
                {isAdmin(currentUser?.role || 'other') ? 'Administrator' : 'Parent'}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction('chat', 'New Message', () => 
              Alert.alert('New Message', 'Start a new conversation')
            )}
            {renderQuickAction('photo-camera', 'Share Photo', () => 
              Alert.alert('Share Photo', 'Share a photo with family')
            )}
            {renderQuickAction('location-on', 'Share Location', () => 
              Alert.alert('Share Location', 'Share your location')
            )}
            {renderQuickAction('backup', 'Backup Data', () => 
              Alert.alert('Backup', 'Backup to Google Drive')
            )}
            
            {/* Admin Panel Link */}
            {hasAdminAccess() && (
              renderQuickAction('admin-panel-settings', 'Admin Panel', navigateToAdmin)
            )}
          </View>
        </View>

        {/* Family Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <Text style={styles.memberCount}>
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
            </Text>
            
            {/* Add Member Button for Admins */}
            {hasAdminAccess() && (
              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => {
                  if (navigation && navigation.navigate) {
                    navigation.navigate('Admin');
                  }
                }}
              >
                <Icon name="person-add" size={16} color="#4A90E2" />
                <Text style={styles.addMemberButtonText}>Add Member</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={familyMembers}
            renderItem={renderFamilyMember}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersList}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {recentMessages.length > 0 ? (
            <FlatList
              data={recentMessages}
              renderItem={renderRecentActivity}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="chat-bubble-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyStateText}>No recent messages</Text>
              <Text style={styles.emptyStateSubtext}>
                Start a conversation with your family!
              </Text>
            </View>
          )}
        </View>

        {/* Family Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{familyMembers.length}</Text>
            <Text style={styles.statLabel}>Family Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recentMessages.length}</Text>
            <Text style={styles.statLabel}>Recent Messages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {familyMembers.filter(m => m.isOnline).length}
            </Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </View>
        </View>

        {/* Admin Quick Access */}
        {hasAdminAccess() && (
          <View style={styles.adminQuickAccess}>
            <Text style={styles.sectionTitle}>Admin Quick Access</Text>
            <TouchableOpacity
              style={styles.adminPanelButton}
              onPress={navigateToAdmin}
            >
              <Icon name="admin-panel-settings" size={24} color="#FFFFFF" />
              <Text style={styles.adminPanelButtonText}>
                Open Admin Panel
              </Text>
            </TouchableOpacity>
            <Text style={styles.adminPanelSubtext}>
              Manage family members, roles, and settings
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the HomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  adminBadge: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    width: '22%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  memberCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  addMemberButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 4,
  },
  membersList: {
    paddingRight: 20,
  },
  activityList: {
    paddingRight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  adminQuickAccess: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
  },
  adminPanelButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  adminPanelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  adminPanelSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default HomeScreen;
