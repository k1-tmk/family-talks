/**
 * RecentActivityCard Component
 * 
 * This component displays recent message activity in a compact card format.
 * It shows the message content, sender, timestamp, and message type.
 * 
 * React Native Concepts:
 * - Props: Data passed from parent component
 * - TouchableOpacity: Makes the card interactive
 * - Conditional rendering: Different content based on message type
 * - Date formatting: Converting timestamps to readable text
 * - Message type icons: Visual indicators for different message types
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { Message } from '../types/Message';

// Props interface for the RecentActivityCard component
interface RecentActivityCardProps {
  message: Message;                // Message data to display
  onPress: () => void;            // Function to call when card is pressed
}

/**
 * RecentActivityCard Component
 * Displays recent message activity in an interactive card
 */
const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  message,
  onPress,
}) => {
  /**
   * Format the message timestamp into readable text
   * @param date - Date to format
   * @returns Formatted time string
   */
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  /**
   * Get the appropriate icon for the message type
   * @param type - Message type
   * @returns Icon name string
   */
  const getMessageTypeIcon = (type: string): string => {
    switch (type) {
      case 'text':
        return 'chat-bubble-outline';
      case 'image':
        return 'image';
      case 'voice':
        return 'mic';
      case 'file':
        return 'attach-file';
      case 'location':
        return 'location-on';
      default:
        return 'chat-bubble-outline';
    }
  };

  /**
   * Get the appropriate color for the message type
   * @param type - Message type
   * @returns Color string
   */
  const getMessageTypeColor = (type: string): string => {
    switch (type) {
      case 'text':
        return '#4A90E2';
      case 'image':
        return '#E74C3C';
      case 'voice':
        return '#F39C12';
      case 'file':
        return '#9B59B6';
      case 'location':
        return '#2ECC71';
      default:
        return '#95A5A6';
    }
  };

  /**
   * Truncate long text content
   * @param text - Text to truncate
   * @param maxLength - Maximum length before truncation
   * @returns Truncated text
   */
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Get display content based on message type
   * @param message - Message object
   * @returns Display text
   */
  const getDisplayContent = (message: Message): string => {
    switch (message.type) {
      case 'text':
        return truncateText(message.content);
      case 'image':
        return '📷 Photo';
      case 'voice':
        return '🎤 Voice message';
      case 'file':
        return '📎 File';
      case 'location':
        return '📍 Location shared';
      default:
        return 'New message';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Message Type Icon */}
      <View style={[
        styles.typeIconContainer,
        { backgroundColor: getMessageTypeColor(message.type) }
      ]}>
        <Icon
          name={getMessageTypeIcon(message.type)}
          size={20}
          color="#FFFFFF"
        />
      </View>

      {/* Message Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.messageContent} numberOfLines={2}>
          {getDisplayContent(message)}
        </Text>
        
        <Text style={styles.timestamp}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>

      {/* Message Status */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: getStatusColor(message.status) }
        ]} />
        <Icon name="chevron-right" size={16} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Get color for message status
 * @param status - Message status
 * @returns Color string
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'sending':
      return '#F39C12';
    case 'sent':
      return '#95A5A6';
    case 'delivered':
      return '#3498DB';
    case 'read':
      return '#2ECC71';
    case 'failed':
      return '#E74C3C';
    default:
      return '#BDC3C7';
  }
};

// Styles for the RecentActivityCard
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  messageContent: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: '#BDC3C7',
  },
  statusContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});

export default RecentActivityCard;
