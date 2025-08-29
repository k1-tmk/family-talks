/**
 * StorageService - Data Persistence and Backup
 * 
 * This service handles all data storage operations for the Family Talks app.
 * It manages local storage, app settings, and Google Drive backup functionality.
 * 
 * Key Features:
 * - Local data persistence using AsyncStorage
 * - App settings management
 * - Google Drive backup and restore
 * - Data encryption for sensitive information
 * 
 * React Native Concepts:
 * - AsyncStorage: Persistent local storage
 * - File system operations: Reading/writing files
 * - Google Drive API integration
 * - Data serialization: Converting objects to/from JSON
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// Import types
import { AppSettings, BackupInfo, Message, Chat, FamilyMember } from '../types/Message';

// Storage keys for different data types
const STORAGE_KEYS = {
  APP_SETTINGS: 'family_talks_app_settings',
  MESSAGES: 'family_talks_messages',
  CHATS: 'family_talks_chats',
  BACKUP_INFO: 'family_talks_backup_info',
  ENCRYPTION_KEY: 'family_talks_encryption_key',
};

/**
 * StorageService Class
 * Handles all data storage and backup operations
 */
export class StorageService {
  /**
   * Get app settings from storage
   * @returns Promise<AppSettings | null> - App settings or null if not found
   */
  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (settingsData) {
        return JSON.parse(settingsData);
      }
      return null;
    } catch (error) {
      console.error('Get app settings error:', error);
      return null;
    }
  }

  /**
   * Save app settings to storage
   * @param settings - App settings to save
   */
  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Save app settings error:', error);
      throw new Error('Failed to save app settings');
    }
  }

  /**
   * Get all messages from storage
   * @returns Promise<Message[]> - Array of all messages
   */
  static async getMessages(): Promise<Message[]> {
    try {
      const messagesData = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Get messages error:', error);
      return [];
    }
  }

  /**
   * Save messages to storage
   * @param messages - Array of messages to save
   */
  static async saveMessages(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Save messages error:', error);
      throw new Error('Failed to save messages');
    }
  }

  /**
   * Add a new message to storage
   * @param message - New message to add
   */
  static async addMessage(message: Message): Promise<void> {
    try {
      const messages = await this.getMessages();
      messages.push(message);
      await this.saveMessages(messages);
    } catch (error) {
      console.error('Add message error:', error);
      throw new Error('Failed to add message');
    }
  }

  /**
   * Get all chats from storage
   * @returns Promise<Chat[]> - Array of all chats
   */
  static async getChats(): Promise<Chat[]> {
    try {
      const chatsData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      if (chatsData) {
        const chats = JSON.parse(chatsData);
        // Convert timestamp strings back to Date objects
        return chats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp),
          } : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Get chats error:', error);
      return [];
    }
  }

  /**
   * Save chats to storage
   * @param chats - Array of chats to save
   */
  static async saveChats(chats: Chat[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Save chats error:', error);
      throw new Error('Failed to save chats');
    }
  }

  /**
   * Get backup information
   * @returns Promise<BackupInfo | null> - Backup info or null if not found
   */
  static async getBackupInfo(): Promise<BackupInfo | null> {
    try {
      const backupData = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_INFO);
      if (backupData) {
        const backup = JSON.parse(backupData);
        return {
          ...backup,
          lastBackup: new Date(backup.lastBackup),
        };
      }
      return null;
    } catch (error) {
      console.error('Get backup info error:', error);
      return null;
    }
  }

  /**
   * Save backup information
   * @param backupInfo - Backup information to save
   */
  static async saveBackupInfo(backupInfo: BackupInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_INFO, JSON.stringify(backupInfo));
    } catch (error) {
      console.error('Save backup info error:', error);
      throw new Error('Failed to save backup info');
    }
  }

  /**
   * Create a backup file for Google Drive upload
   * @returns Promise<string> - Path to the backup file
   */
  static async createBackupFile(): Promise<string> {
    try {
      // Get all data to backup
      const messages = await this.getMessages();
      const chats = await this.getChats();
      const familyMembers = await this.getFamilyMembers();
      const appSettings = await this.getAppSettings();

      // Create backup object
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          messages,
          chats,
          familyMembers,
          appSettings,
        },
      };

      // Create backup directory if it doesn't exist
      const backupDir = `${RNFS.DocumentDirectoryPath}/backups`;
      const dirExists = await RNFS.exists(backupDir);
      if (!dirExists) {
        await RNFS.mkdir(backupDir);
      }

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `family_talks_backup_${timestamp}.json`;
      const backupFilePath = `${backupDir}/${backupFileName}`;

      // Write backup file
      await RNFS.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

      return backupFilePath;
    } catch (error) {
      console.error('Create backup file error:', error);
      throw new Error('Failed to create backup file');
    }
  }

  /**
   * Restore data from a backup file
   * @param backupFilePath - Path to the backup file
   */
  static async restoreFromBackup(backupFilePath: string): Promise<void> {
    try {
      // Read backup file
      const backupData = await RNFS.readFile(backupFilePath, 'utf8');
      const backup = JSON.parse(backupData);

      // Validate backup data
      if (!backup.data || !backup.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Restore data
      if (backup.data.messages) {
        await this.saveMessages(backup.data.messages);
      }
      if (backup.data.chats) {
        await this.saveChats(backup.data.chats);
      }
      if (backup.data.familyMembers) {
        // Note: This would need to be handled by AuthService
        console.log('Family members restore not implemented yet');
      }
      if (backup.data.appSettings) {
        await this.saveAppSettings(backup.data.appSettings);
      }

      // Update backup info
      const backupInfo: BackupInfo = {
        lastBackup: new Date(),
        backupSize: await this.getBackupFileSize(backupFilePath),
        fileCount: 1,
        isEncrypted: false,
      };
      await this.saveBackupInfo(backupInfo);

    } catch (error) {
      console.error('Restore from backup error:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  /**
   * Get the size of a backup file
   * @param filePath - Path to the file
   * @returns Promise<number> - File size in bytes
   */
  private static async getBackupFileSize(filePath: string): Promise<number> {
    try {
      const stats = await RNFS.stat(filePath);
      return stats.size;
    } catch (error) {
      console.error('Get file size error:', error);
      return 0;
    }
  }

  /**
   * Get all family members (helper method)
   * @returns Promise<FamilyMember[]> - Array of family members
   */
  private static async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const membersData = await AsyncStorage.getItem('family_talks_family_members');
      if (membersData) {
        return JSON.parse(membersData);
      }
      return [];
    } catch (error) {
      console.error('Get family members error:', error);
      return [];
    }
  }

  /**
   * Clear all stored data (for testing or reset purposes)
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      
      // Also clear backup files
      const backupDir = `${RNFS.DocumentDirectoryPath}/backups`;
      const dirExists = await RNFS.exists(backupDir);
      if (dirExists) {
        await RNFS.unlink(backupDir);
      }
    } catch (error) {
      console.error('Clear all data error:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Get storage usage statistics
   * @returns Promise<{totalSize: number, messageCount: number, chatCount: number}>
   */
  static async getStorageStats(): Promise<{
    totalSize: number;
    messageCount: number;
    chatCount: number;
  }> {
    try {
      const messages = await this.getMessages();
      const chats = await this.getChats();
      
      // Calculate approximate storage size
      const messageSize = JSON.stringify(messages).length;
      const chatSize = JSON.stringify(chats).length;
      const totalSize = messageSize + chatSize;

      return {
        totalSize,
        messageCount: messages.length,
        chatCount: chats.length,
      };
    } catch (error) {
      console.error('Get storage stats error:', error);
      return {
        totalSize: 0,
        messageCount: 0,
        chatCount: 0,
      };
    }
  }
}
