/**
 * AuthService - Authentication and User Management
 * 
 * This service handles all authentication-related operations for the Family Talks app.
 * It manages user login, family creation, and user data persistence using local storage.
 * Now includes comprehensive admin functionality for managing family members.
 * 
 * Key Features:
 * - Family code authentication system
 * - Local user data storage
 * - Family member management
 * - Admin operations (add/edit/remove members)
 * - Secure data handling
 * - Permission-based access control
 * 
 * React Native Concepts:
 * - AsyncStorage: Persistent local storage for user data
 * - Async/await: Modern JavaScript for handling asynchronous operations
 * - Error handling: Try-catch blocks for robust error management
 * - Data validation: Ensuring data integrity before storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import DeviceInfo from 'react-native-device-info';

// Import types
import { FamilyMember, FamilyRole, AdminAction, AdminOperation, FamilySettings } from '../types/Message';

// Import utilities
import { getRolePermissions, isAdmin, hasPermission } from '../utils/RolePermissions';

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  CURRENT_USER: 'family_talks_current_user',
  FAMILY_MEMBERS: 'family_talks_family_members',
  FAMILY_CODE: 'family_talks_family_code',
  USER_DATA: 'family_talks_user_data',
  ADMIN_ACTIONS: 'family_talks_admin_actions',
  FAMILY_SETTINGS: 'family_talks_family_settings',
};

/**
 * AuthService Class
 * Handles all authentication and user management operations
 */
export class AuthService {
  /**
   * Authenticate a family member using family code and name
   * @param familyCode - The shared family code
   * @param memberName - The name of the family member
   * @returns Promise<FamilyMember | null> - The authenticated user or null if failed
   */
  static async authenticateFamilyMember(
    familyCode: string,
    memberName: string
  ): Promise<FamilyMember | null> {
    try {
      // Get stored family data
      const storedFamilyCode = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_CODE);
      const storedMembers = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
      
      // Check if family code matches
      if (storedFamilyCode !== familyCode) {
        return null; // Invalid family code
      }

      let familyMembers: FamilyMember[] = [];
      if (storedMembers) {
        familyMembers = JSON.parse(storedMembers);
      }

      // Check if user already exists
      let existingUser = familyMembers.find(
        member => member.name.toLowerCase() === memberName.toLowerCase()
      );

      if (existingUser) {
        // Update last seen and online status
        existingUser.lastSeen = new Date();
        existingUser.isOnline = true;
        
        // Save updated user data
        await this.saveFamilyMembers(familyMembers);
        await this.setCurrentUser(existingUser);
        
        return existingUser;
      } else {
        // Create new family member with default role
        const newMember: FamilyMember = {
          id: this.generateUserId(),
          name: memberName,
          isOnline: true,
          lastSeen: new Date(),
          deviceId: await this.getDeviceId(),
          role: 'other', // Default role, can be changed by admin
          joinedAt: new Date(),
          isActive: true,
          permissions: getRolePermissions('other'),
        };

        // Add to family members list
        familyMembers.push(newMember);
        await this.saveFamilyMembers(familyMembers);
        
        // Set as current user
        await this.setCurrentUser(newMember);
        
        return newMember;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate family member');
    }
  }

  /**
   * Create a new family with the first member as admin
   * @param familyCode - The new family code
   * @param memberName - The name of the first family member
   * @returns Promise<FamilyMember | null> - The created user or null if failed
   */
  static async createFamily(
    familyCode: string,
    memberName: string
  ): Promise<FamilyMember | null> {
    try {
      // Check if family already exists
      const existingFamilyCode = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_CODE);
      if (existingFamilyCode) {
        throw new Error('Family already exists');
      }

      // Create first family member as admin
      const adminMember: FamilyMember = {
        id: this.generateUserId(),
        name: memberName,
        isOnline: true,
        lastSeen: new Date(),
        deviceId: await this.getDeviceId(),
        role: 'admin', // First member is admin
        joinedAt: new Date(),
        isActive: true,
        permissions: getRolePermissions('admin'),
      };

      // Save family code
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_CODE, familyCode);
      
      // Save family members
      await this.saveFamilyMembers([adminMember]);
      
      // Set as current user
      await this.setCurrentUser(adminMember);

      // Create default family settings
      const defaultSettings: FamilySettings = {
        familyName: `${memberName}'s Family`,
        allowGuestInvites: false,
        messageRetentionDays: 365,
        requireApprovalForJoining: false,
        maxMembers: 20,
        autoArchiveOldChats: true,
        emergencyContacts: [],
      };
      await this.saveFamilySettings(defaultSettings);
      
      return adminMember;
    } catch (error) {
      console.error('Create family error:', error);
      throw new Error('Failed to create family');
    }
  }

  /**
   * Add a new family member (admin only)
   * @param adminUser - The admin user performing the action
   * @param memberName - Name of the new member
   * @param role - Role to assign to the new member
   * @param email - Optional email address
   * @param phone - Optional phone number
   * @returns Promise<FamilyMember> - The newly created member
   */
  static async addFamilyMember(
    adminUser: FamilyMember,
    memberName: string,
    role: FamilyRole = 'other',
    email?: string,
    phone?: string
  ): Promise<FamilyMember> {
    try {
      // Check if user has permission to add members
      if (!hasPermission(adminUser.role, 'canAddMembers')) {
        throw new Error('Insufficient permissions to add family members');
      }

      // Get current family members
      const familyMembers = await this.getFamilyMembers();
      
      // Check if member already exists
      const existingMember = familyMembers.find(
        member => member.name.toLowerCase() === memberName.toLowerCase()
      );
      
      if (existingMember) {
        throw new Error('Family member with this name already exists');
      }

      // Create new member
      const newMember: FamilyMember = {
        id: this.generateUserId(),
        name: memberName,
        isOnline: false,
        lastSeen: new Date(),
        deviceId: '', // Will be set when they first log in
        role,
        email,
        phone,
        joinedAt: new Date(),
        isActive: true,
        permissions: getRolePermissions(role),
      };

      // Add to family members list
      familyMembers.push(newMember);
      await this.saveFamilyMembers(familyMembers);

      // Log admin action
      await this.logAdminAction(adminUser.id, 'add_member', newMember.id, 
        `Added new family member: ${memberName} with role: ${role}`);

      return newMember;
    } catch (error) {
      console.error('Add family member error:', error);
      throw error;
    }
  }

  /**
   * Edit an existing family member (admin only)
   * @param adminUser - The admin user performing the action
   * @param memberId - ID of the member to edit
   * @param updates - Partial member data to update
   * @returns Promise<FamilyMember> - The updated member
   */
  static async editFamilyMember(
    adminUser: FamilyMember,
    memberId: string,
    updates: Partial<FamilyMember>
  ): Promise<FamilyMember> {
    try {
      // Check if user has permission to edit members
      if (!hasPermission(adminUser.role, 'canEditMembers')) {
        throw new Error('Insufficient permissions to edit family members');
      }

      // Get current family members
      const familyMembers = await this.getFamilyMembers();
      
      // Find the member to edit
      const memberIndex = familyMembers.findIndex(member => member.id === memberId);
      if (memberIndex === -1) {
        throw new Error('Family member not found');
      }

      const member = familyMembers[memberIndex];
      
      // Prevent editing admin role unless it's the current user
      if (updates.role && member.role === 'admin' && memberId !== adminUser.id) {
        throw new Error('Cannot change admin role');
      }

      // Update member data
      const updatedMember: FamilyMember = {
        ...member,
        ...updates,
        // Update permissions if role changed
        permissions: updates.role ? getRolePermissions(updates.role) : member.permissions,
      };

      // Update in the array
      familyMembers[memberIndex] = updatedMember;
      await this.saveFamilyMembers(familyMembers);

      // Log admin action
      await this.logAdminAction(adminUser.id, 'edit_member', memberId, 
        `Edited family member: ${member.name}`);

      return updatedMember;
    } catch (error) {
      console.error('Edit family member error:', error);
      throw error;
    }
  }

  /**
   * Remove a family member (admin only)
   * @param adminUser - The admin user performing the action
   * @param memberId - ID of the member to remove
   * @returns Promise<void>
   */
  static async removeFamilyMember(
    adminUser: FamilyMember,
    memberId: string
  ): Promise<void> {
    try {
      // Check if user has permission to remove members
      if (!hasPermission(adminUser.role, 'canRemoveMembers')) {
        throw new Error('Insufficient permissions to remove family members');
      }

      // Get current family members
      const familyMembers = await this.getFamilyMembers();
      
      // Find the member to remove
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) {
        throw new Error('Family member not found');
      }

      // Prevent removing admin
      if (member.role === 'admin') {
        throw new Error('Cannot remove admin member');
      }

      // Prevent removing self
      if (memberId === adminUser.id) {
        throw new Error('Cannot remove yourself');
      }

      // Remove member from array
      const updatedMembers = familyMembers.filter(m => m.id !== memberId);
      await this.saveFamilyMembers(updatedMembers);

      // Log admin action
      await this.logAdminAction(adminUser.id, 'remove_member', memberId, 
        `Removed family member: ${member.name}`);

    } catch (error) {
      console.error('Remove family member error:', error);
      throw error;
    }
  }

  /**
   * Change a member's role (admin only)
   * @param adminUser - The admin user performing the action
   * @param memberId - ID of the member to change role
   * @param newRole - New role to assign
   * @returns Promise<FamilyMember> - The updated member
   */
  static async changeMemberRole(
    adminUser: FamilyMember,
    memberId: string,
    newRole: FamilyRole
  ): Promise<FamilyMember> {
    try {
      // Check if user has permission to edit members
      if (!hasPermission(adminUser.role, 'canEditMembers')) {
        throw new Error('Insufficient permissions to change member roles');
      }

      // Get current family members
      const familyMembers = await this.getFamilyMembers();
      
      // Find the member to change
      const memberIndex = familyMembers.findIndex(member => member.id === memberId);
      if (memberIndex === -1) {
        throw new Error('Family member not found');
      }

      const member = familyMembers[memberIndex];
      
      // Prevent changing admin role
      if (member.role === 'admin') {
        throw new Error('Cannot change admin role');
      }

      // Update member role and permissions
      const updatedMember: FamilyMember = {
        ...member,
        role: newRole,
        permissions: getRolePermissions(newRole),
      };

      // Update in the array
      familyMembers[memberIndex] = updatedMember;
      await this.saveFamilyMembers(familyMembers);

      // Log admin action
      await this.logAdminAction(adminUser.id, 'change_role', memberId, 
        `Changed role of ${member.name} from ${member.role} to ${newRole}`);

      return updatedMember;
    } catch (error) {
      console.error('Change member role error:', error);
      throw error;
    }
  }

  /**
   * Get the currently logged-in user
   * @returns Promise<FamilyMember | null> - Current user or null if not logged in
   */
  static async getCurrentUser(): Promise<FamilyMember | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        const user = JSON.parse(userData);
        // Ensure dates are properly converted
        if (user.lastSeen) {
          user.lastSeen = new Date(user.lastSeen);
        }
        if (user.joinedAt) {
          user.joinedAt = new Date(user.joinedAt);
        }
        // Update last seen timestamp
        user.lastSeen = new Date();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Set the current user in storage
   * @param user - The user to set as current
   */
  static async setCurrentUser(user: FamilyMember): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Set current user error:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Clear current user data (logout)
   */
  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Clear current user error:', error);
    }
  }

  /**
   * Get all family members
   * @returns Promise<FamilyMember[]> - Array of all family members
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const membersData = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
      if (membersData) {
        const members = JSON.parse(membersData);
        // Ensure all dates are properly converted
        return members.map((member: any) => ({
          ...member,
          lastSeen: member.lastSeen ? new Date(member.lastSeen) : new Date(),
          joinedAt: member.joinedAt ? new Date(member.joinedAt) : new Date(),
        }));
      }
      return [];
    } catch (error) {
      console.error('Get family members error:', error);
      return [];
    }
  }

  /**
   * Save family members to storage
   * @param members - Array of family members to save
   */
  static async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
    } catch (error) {
      console.error('Save family members error:', error);
      throw new Error('Failed to save family members');
    }
  }

  /**
   * Get family settings
   * @returns Promise<FamilySettings | null> - Family settings or null if not found
   */
  static async getFamilySettings(): Promise<FamilySettings | null> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_SETTINGS);
      if (settingsData) {
        return JSON.parse(settingsData);
      }
      return null;
    } catch (error) {
      console.error('Get family settings error:', error);
      return null;
    }
  }

  /**
   * Save family settings
   * @param settings - Family settings to save
   */
  static async saveFamilySettings(settings: FamilySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Save family settings error:', error);
      throw new Error('Failed to save family settings');
    }
  }

  /**
   * Log admin actions for audit trail
   * @param adminId - ID of admin performing action
   * @param operation - Type of operation
   * @param targetMemberId - ID of affected member (optional)
   * @param details - Description of action
   */
  private static async logAdminAction(
    adminId: string,
    operation: AdminOperation,
    targetMemberId?: string,
    details?: string
  ): Promise<void> {
    try {
      const actionsData = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_ACTIONS);
      let actions: AdminAction[] = [];
      
      if (actionsData) {
        actions = JSON.parse(actionsData);
      }

      const newAction: AdminAction = {
        id: this.generateActionId(),
        adminId,
        targetMemberId,
        operation,
        details: details || '',
        timestamp: new Date(),
      };

      actions.push(newAction);
      
      // Keep only last 100 actions to prevent storage bloat
      if (actions.length > 100) {
        actions = actions.slice(-100);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_ACTIONS, JSON.stringify(actions));
    } catch (error) {
      console.error('Log admin action error:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Get admin action log
   * @returns Promise<AdminAction[]> - Array of admin actions
   */
  static async getAdminActions(): Promise<AdminAction[]> {
    try {
      const actionsData = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_ACTIONS);
      if (actionsData) {
        const actions = JSON.parse(actionsData);
        return actions.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Get admin actions error:', error);
      return [];
    }
  }

  /**
   * Update user's online status
   * @param userId - ID of the user to update
   * @param isOnline - New online status
   */
  static async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const members = await this.getFamilyMembers();
      const updatedMembers = members.map(member => 
        member.id === userId 
          ? { ...member, isOnline, lastSeen: new Date() }
          : member
      );
      
      await this.saveFamilyMembers(updatedMembers);
      
      // Update current user if it's the same user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.isOnline = isOnline;
        currentUser.lastSeen = new Date();
        await this.setCurrentUser(currentUser);
      }
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }

  /**
   * Get family code
   * @returns Promise<string | null> - Family code or null if not found
   */
  static async getFamilyCode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_CODE);
    } catch (error) {
      console.error('Get family code error:', error);
      return null;
    }
  }

  /**
   * Generate a unique user ID
   * @returns string - Unique user identifier
   */
  private static generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate a unique action ID
   * @returns string - Unique action identifier
   */
  private static generateActionId(): string {
    return 'action_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate a simple device ID
   * @returns string - Simple device identifier
   */
  private static getDeviceId(): string {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if user is authenticated
   * @returns Promise<boolean> - True if user is logged in
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout current user
   * Clears user data and updates online status
   */
  static async logout(): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        // Update online status to offline
        await this.updateUserOnlineStatus(currentUser.id, false);
      }
      
      // Clear current user data
      await this.clearCurrentUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
