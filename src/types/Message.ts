/**
 * Family Talks - Type Definitions
 * 
 * This file defines all the TypeScript interfaces and types used throughout the app.
 * TypeScript helps catch errors at compile time and provides better code completion.
 * 
 * Key Concepts:
 * - Interface: Defines the structure of an object
 * - Type: Alternative way to define types
 * - Union Types: Can be one of several types
 * - Optional Properties: Properties that may not exist
 * - Readonly: Properties that cannot be changed after creation
 */

// Message types for different kinds of family communication
export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'location';

// Message status to track delivery and read states
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Enhanced family member roles with admin capabilities
export type FamilyRole = 'admin' | 'parent' | 'child' | 'grandparent' | 'other';

// Permissions for different roles
export interface RolePermissions {
  canAddMembers: boolean;        // Can add new family members
  canRemoveMembers: boolean;     // Can remove family members
  canEditMembers: boolean;       // Can edit member information
  canManageSettings: boolean;    // Can change family settings
  canModerateContent: boolean;   // Can delete messages
  canViewAnalytics: boolean;     // Can see family statistics
  canManageBackup: boolean;      // Can control backup settings
  canInviteGuests: boolean;      // Can invite temporary guests
}

// Family member information with enhanced admin features
export interface FamilyMember {
  id: string;                    // Unique identifier for each family member
  name: string;                  // Display name
  avatar?: string;               // Profile picture URL (optional)
  isOnline: boolean;             // Current online status
  lastSeen: Date;                // Last time they were active
  deviceId: string;              // Device identifier for sync
  role: FamilyRole;              // Family role with admin capabilities
  email?: string;                // Email address (optional)
  phone?: string;                // Phone number (optional)
  joinedAt: Date;                // When they joined the family
  isActive: boolean;             // Whether account is active
  permissions: RolePermissions;  // Role-based permissions
}

// Admin operation types
export type AdminOperation = 'add_member' | 'remove_member' | 'edit_member' | 'change_role' | 'deactivate_member';

// Admin action log entry
export interface AdminAction {
  id: string;                    // Unique action identifier
  adminId: string;               // ID of admin who performed action
  targetMemberId?: string;       // ID of member affected (if applicable)
  operation: AdminOperation;     // Type of operation performed
  details: string;               // Description of what was done
  timestamp: Date;               // When action was performed
  metadata?: any;                // Additional operation data
}

// Individual message structure
export interface Message {
  id: string;                    // Unique message identifier
  senderId: string;              // ID of who sent the message
  receiverId: string;            // ID of who receives the message
  content: string;               // Message content (text, file path, etc.)
  type: MessageType;             // Type of message
  timestamp: Date;               // When the message was sent
  status: MessageStatus;         // Current delivery status
  isEncrypted: boolean;          // Whether message is encrypted
  metadata?: {                   // Additional message data (optional)
    fileSize?: number;           // For file messages
    duration?: number;           // For voice messages
    coordinates?: {              // For location messages
      latitude: number;
      longitude: number;
    };
    thumbnail?: string;          // For image/video messages
  };
}

// Chat conversation between family members
export interface Chat {
  id: string;                    // Unique chat identifier
  participants: string[];        // Array of family member IDs
  lastMessage?: Message;         // Most recent message (optional)
  unreadCount: number;           // Number of unread messages
  isGroupChat: boolean;          // Whether it's a group or individual chat
  createdAt: Date;               // When the chat was created
  updatedAt: Date;               // Last activity timestamp
}

// App settings and preferences
export interface AppSettings {
  encryptionEnabled: boolean;    // Whether to encrypt messages
  autoBackup: boolean;           // Auto-backup to Google Drive
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  notificationsEnabled: boolean; // Push notification settings
  soundEnabled: boolean;         // Message sound effects
  theme: 'light' | 'dark' | 'auto';
  language: string;              // App language
}

// Google Drive backup information
export interface BackupInfo {
  lastBackup: Date;              // When last backup was performed
  backupSize: number;            // Size of backup in bytes
  fileCount: number;             // Number of files backed up
  isEncrypted: boolean;          // Whether backup is encrypted
  googleDriveFolderId?: string;  // Google Drive folder ID
}

// Network status for sync operations
export interface NetworkStatus {
  isConnected: boolean;          // Internet connection status
  connectionType: 'wifi' | 'cellular' | 'none';
  isOnline: boolean;             // Whether device is online
}

// Error types for better error handling
export interface AppError {
  code: string;                  // Error code for identification
  message: string;               // User-friendly error message
  details?: string;              // Technical details (optional)
  timestamp: Date;               // When error occurred
}

// Sync status for data synchronization
export interface SyncStatus {
  isSyncing: boolean;            // Whether sync is in progress
  lastSync: Date;                // Last successful sync
  pendingChanges: number;        // Number of unsynced changes
  error?: AppError;              // Last sync error (optional)
}

// Family settings that only admins can modify
export interface FamilySettings {
  familyName: string;            // Display name for the family
  allowGuestInvites: boolean;    // Whether guests can be invited
  messageRetentionDays: number;  // How long to keep messages
  requireApprovalForJoining: boolean; // Whether new members need approval
  maxMembers: number;            // Maximum number of family members
  autoArchiveOldChats: boolean;  // Automatically archive old conversations
  emergencyContacts: string[];   // Emergency contact information
}
