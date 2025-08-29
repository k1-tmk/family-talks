/**
 * TabBarIcon Component
 * 
 * This component renders the appropriate icon for each tab in the bottom navigation.
 * It uses react-native-vector-icons to display beautiful, scalable icons.
 * 
 * React Native Concepts:
 * - Props: Data passed from parent component
 * - Conditional rendering: Different icons based on route name
 * - Icon libraries: Using vector icons for crisp, scalable graphics
 */

import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Props interface for the TabBarIcon component
interface TabBarIconProps {
  routeName: string;    // Name of the current route/tab
  focused: boolean;     // Whether this tab is currently selected
  color: string;        // Color to use for the icon
  size: number;         // Size of the icon
}

/**
 * TabBarIcon Component
 * Renders the appropriate icon for each navigation tab
 */
const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, focused, color, size }) => {
  // Define which icon to show for each route
  const getIconName = (route: string): string => {
    switch (route) {
      case 'Home':
        return 'home';           // House icon for home/family
      case 'Chat':
        return 'chat';           // Chat bubble for messages
      case 'Profile':
        return 'person';         // Person icon for profile
      case 'Settings':
        return 'settings';       // Gear icon for settings
      default:
        return 'help';           // Default help icon
    }
  };

  // Get the icon name based on the route
  const iconName = getIconName(routeName);

  return (
    <Icon
      name={iconName}
      size={size}
      color={color}
      // You can add additional styling here if needed
      style={{
        // Optional: Add a subtle scale effect when focused
        transform: [{ scale: focused ? 1.1 : 1.0 }],
      }}
    />
  );
};

export default TabBarIcon;
