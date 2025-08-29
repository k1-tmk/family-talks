/**
 * FamilyMemberCard Component
 * 
 * This component displays a family member's information in a card format.
 * It shows the member's name, avatar, online status, and last seen time.
 * 
 * React Native Concepts:
 * - Props: Data passed from parent component
 * - TouchableOpacity: Makes the card interactive
 * - Conditional rendering: Different styles based on online status
 * - Date formatting: Converting timestamps to readable text
 * - Avatar placeholder: Default icon when no avatar is provided
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import types
import { FamilyMember } from '../types/Message';

// Props interface for the FamilyMemberCard component
interface FamilyMemberCardProps {
  member: FamilyMember;           // Family member data to display
  isCurrentUser: boolean;         // Whether this is the current user
  onPress: () => void;            // Function to call when card is pressed
}

/**
 * FamilyMemberCard Component
 * Displays family member information in an interactive card
 */
const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  isCurrentUser,
  onPress,
}) => {
  /**
   * Format the last seen time into readable text
   * @param date - Date to format
   * @returns Formatted time string
   */
  const formatLastSeen = (date: Date | string): string => {
    // Ensure we have a valid Date object
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Unknown';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
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
   * Get the appropriate avatar icon based on family role
   * @param role - Family member role
   * @returns Icon name string
   */
  const getAvatarIcon = (role: string): string => {
    switch (role) {
      case 'parent':
        return 'person';
      case 'child':
        return 'child-care';
      case 'grandparent':
        return 'elderly';
      default:
        return 'person-outline';
    }
  };

  /**
   * Get the appropriate avatar color based on family role
   * @param role - Family member role
   * @returns Color string
   */
  const getAvatarColor = (role: string): string => {
    switch (role) {
      case 'parent':
        return '#4A90E2';
      case 'child':
        return '#F39C12';
      case 'grandparent':
        return '#9B59B6';
      default:
        return '#95A5A6';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCurrentUser && styles.currentUserCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[
            styles.avatarPlaceholder,
            { backgroundColor: getAvatarColor(member.role) }
          ]}>
            <Icon
              name={getAvatarIcon(member.role)}
              size={24}
              color="#FFFFFF"
            />
          </View>
        )}
        
        {/* Online Status Indicator */}
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: member.isOnline ? '#2ECC71' : '#BDC3C7' }
        ]} />
      </View>

      {/* Member Information */}
      <View style={styles.memberInfo}>
        <Text style={[
          styles.memberName,
          isCurrentUser && styles.currentUserName
        ]}>
          {member.name}
          {isCurrentUser && ' (You)'}
        </Text>
        
        <Text style={styles.memberRole}>
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </Text>
        
        <Text style={styles.lastSeen}>
          {member.isOnline ? 'Online' : `Last seen ${formatLastSeen(member.lastSeen)}`}
        </Text>
      </View>

      {/* Action Arrow */}
      <Icon name="chevron-right" size={20} color="#BDC3C7" />
    </TouchableOpacity>
  );
};

// Styles for the FamilyMemberCard
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    backgroundColor: '#F8F9FA',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#4A90E2',
  },
  memberRole: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  lastSeen: {
    fontSize: 11,
    color: '#BDC3C7',
  },
});

export default FamilyMemberCard;
