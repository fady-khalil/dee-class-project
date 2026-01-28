import React from "react";
import { View, Text, FlatList, I18nManager, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * IMPORTANT: RTL Best Practices
 *
 * When I18nManager.forceRTL(true) is set and app restarts, React Native AUTOMATICALLY:
 * - Flips flexDirection: "row" to behave as "row-reverse"
 * - Flips textAlign: "left" to behave as "right"
 * - Mirrors all layouts appropriately
 *
 * DO NOT manually check isRTL to flip layouts - this causes double-flipping!
 *
 * Use these components only when you need:
 * - writingDirection for proper punctuation placement
 * - To check language for content-specific logic (not layout)
 */

// Standard View - RTL is handled automatically by I18nManager
// Only use this if you need a View wrapper, not for RTL flipping
export const I18nView = ({ style, children, ...props }) => {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

// Text component with proper writingDirection for punctuation
// writingDirection ensures punctuation marks appear correctly
export const I18nText = ({ style, children, ...props }) => {
  const isRTL = I18nManager.isRTL;

  // Only set writingDirection - let I18nManager handle textAlign
  const directionStyle = {
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  return (
    <Text style={[directionStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// Standard FlatList - RTL is handled automatically
// inverted prop should only be used for specific scroll direction needs
export const I18nFlatList = (props) => {
  return <FlatList {...props} />;
};

// Hook to check current RTL state
// Use this for content logic, NOT for layout flipping
export const useLanguageDirection = () => {
  const { i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return {
    isRTL,
    language: i18n.language,
    // These are provided for reference but layouts should use I18nManager automatic flipping
    // Use 'start'/'end' instead of 'left'/'right' in styles for automatic RTL support
  };
};

// Utility to check if app is in RTL mode
export const isAppRTL = () => I18nManager.isRTL;
