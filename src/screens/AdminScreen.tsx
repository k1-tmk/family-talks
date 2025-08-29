/**
 * AdminScreen Component
 * 
 * This screen provides admin functionality for managing family members.
 * Only users with admin or parent roles can access this screen.
 * 
 * React Native Concepts:
 * - Modal: Overlay dialogs for member management
 * - Form handling: Input validation and state management
 * - Permission checks: Role-based access control
 * - Async operations: Managing family member data
 * - Error handling: User-friendly error messages
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { FamilyMember, FamilyRole, AdminAction } from '../types/Message';

// Import services
import { AuthService } from '../services/AuthService';

// Import utilities
import { getRoleDisplayName, getRoleDescription, canManageMembers, isAdmin } from '../utils/RolePermissions';

// Import components
import FamilyMemberCard from '../components/FamilyMemberCard';

/**
 * AdminScreen Component
 * Provides admin interface for managing family members
 */
const AdminScreen: React.FC = () => {
  // State management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<FamilyRole>('other');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // Edit form states
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState<FamilyRole>('other');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');

  /**
   * Load initial data when component mounts
   */
  useEffect(() => {
    loadAdminData();
  }, []);

  /**
   * Load all data needed for admin screen
   */
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      const [user, members, actions] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getFamilyMembers(),
        AuthService.getAdminActions(),
      ]);

      setCurrentUser(user);
      setFamilyMembers(members);
      setAdminActions(actions);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdminData();
    setIsRefreshing(false);
  };

  /**
   * Check if current user has admin access
   */
  const hasAdminAccess = (): boolean => {
    if (!currentUser) return false;
    return canManageMembers(currentUser.role);
  };

  /**
   * Handle adding a new family member
   */
  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const newMember = await AuthService.addFamilyMember(
        currentUser,
        newMemberName.trim(),
        newMemberRole,
        newMemberEmail.trim() || undefined,
        newMemberPhone.trim() || undefined
      );

      // Refresh data
      await loadAdminData();
      
      // Reset form and close modal
      setNewMemberName('');
      setNewMemberRole('other');
      setNewMemberEmail('');
      setNewMemberPhone('');
      setAddMemberModal(false);

      Alert.alert('Success', `Added ${newMember.name} to the family!`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add member');
    }
  };

  /**
   * Handle editing a family member
   */
  const handleEditMember = async () => {
    if (!selectedMember || !currentUser) return;

    try {
      const updates: Partial<FamilyMember> = {};
      
      if (editMemberName.trim() !== selectedMember.name) {
        updates.name = editMemberName.trim();
      }
      if (editMemberRole !== selectedMember.role) {
        updates.role = editMemberRole;
      }
      if (editMemberEmail.trim() !== (selectedMember.email || '')) {
        updates.email = editMemberEmail.trim() || undefined;
      }
      if (editMemberPhone.trim() !== (selectedMember.phone || '')) {
        updates.phone = editMemberPhone.trim() || undefined;
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'No changes made');
        return;
      }

      await AuthService.editFamilyMember(currentUser, selectedMember.id, updates);
      
      // Refresh data
      await loadAdminData();
      
      // Close modal
      setEditMemberModal(false);
      setSelectedMember(null);

      Alert.alert('Success', 'Member updated successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update member');
    }
  };

  /**
   * Handle removing a family member
   */
  const handleRemoveMember = (member: FamilyMember) => {
    if (!currentUser) return;

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from the family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.removeFamilyMember(currentUser, member.id);
              await loadAdminData();
              Alert.alert('Success', `${member.name} has been removed from the family`);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  /**
   * Open edit member modal
   */
  const openEditModal = (member: FamilyMember) => {
    setSelectedMember(member);
    setEditMemberName(member.name);
    setEditMemberRole(member.role);
    setEditMemberEmail(member.email || '');
    setEditMemberPhone(member.phone || '');
    setEditMemberModal(true);
  };

  /**
   * Render individual family member with admin controls
   */
  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <View style={styles.memberContainer}>
      <FamilyMemberCard
        member={item}
        isCurrentUser={item.id === currentUser?.id}
        onPress={() => {}} // No navigation needed in admin view
      />
      
      {/* Admin Controls */}
      {hasAdminAccess() && item.id !== currentUser?.id && (
        <View style={styles.adminControls}>
          <TouchableOpacity
            style={[styles.adminButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Icon name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.adminButtonText}>Edit</Text>
          </TouchableOpacity>
          
          {isAdmin(currentUser?.role || 'other') && (
            <TouchableOpacity
              style={[styles.adminButton, styles.removeButton]}
              onPress={() => handleRemoveMember(item)}
            >
              <Icon name="delete" size={16} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  /**
   * Render admin action log item
   */
  const renderAdminAction = ({ item }: { item: AdminAction }) => (
    <View style={styles.actionItem}>
      <View style={styles.actionHeader}>
        <Text style={styles.actionOperation}>{item.operation.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.actionTime}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.actionDetails}>{item.details}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="admin-panel-settings" size={40} color="#4A90E2" />
          <Text style={styles.loadingText}>Loading admin panel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasAdminAccess()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Icon name="block" size={80} color="#E74C3C" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access the admin panel.
          </Text>
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
          <Icon name="admin-panel-settings" size={32} color="#4A90E2" />
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>
            Manage your family members and settings
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={() => setAddMemberModal(true)}
          >
            <Icon name="person-add" size={24} color="#FFFFFF" />
            <Text style={styles.addMemberButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {/* Family Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Family Members ({familyMembers.length})
          </Text>
          
          <FlatList
            data={familyMembers}
            renderItem={renderFamilyMember}
            keyExtractor={(item) => item.id}
            horizontal={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Admin Actions Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Admin Actions ({adminActions.length})
          </Text>
          
          {adminActions.length > 0 ? (
            <FlatList
              data={adminActions.slice(-10)} // Show last 10 actions
              renderItem={renderAdminAction}
              keyExtractor={(item) => item.id}
              horizontal={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="history" size={48} color="#BDC3C7" />
              <Text style={styles.emptyStateText}>No admin actions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={addMemberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="Enter member name"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {(['other', 'child', 'grandparent', 'parent'] as FamilyRole[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newMemberRole === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setNewMemberRole(role)}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newMemberRole === role && styles.roleOptionTextSelected
                  ]}>
                    {getRoleDisplayName(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddMemberModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddMember}
              >
                <Text style={styles.confirmButtonText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        visible={editMemberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Family Member</Text>
            
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={editMemberName}
              onChangeText={setEditMemberName}
              placeholder="Enter member name"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {(['other', 'child', 'grandparent', 'parent'] as FamilyRole[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    editMemberRole === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setEditMemberRole(role)}
                >
                  <Text style={[
                    styles.roleOptionText,
                    editMemberRole === role && styles.roleOptionTextSelected
                  ]}>
                    {getRoleDisplayName(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editMemberEmail}
              onChangeText={setEditMemberEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editMemberPhone}
              onChangeText={setEditMemberPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditMemberModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEditMember}
              >
                <Text style={styles.confirmButtonText}>Update Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles for the AdminScreen
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 16,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  addMemberButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  memberContainer: {
    marginBottom: 16,
  },
  adminControls: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#F39C12',
  },
  removeButton: {
    backgroundColor: '#E74C3C',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionOperation: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  actionTime: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  actionDetails: {
    fontSize: 14,
    color: '#2C3E50',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  roleOptionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  roleOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminScreen;
