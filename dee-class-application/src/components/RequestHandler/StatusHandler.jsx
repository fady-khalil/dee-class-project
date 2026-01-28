import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { styles } from "./Style";

/**
 * Component for displaying status messages to the user
 * (success, error, warning, info)
 */
const StatusHandler = ({
  isVisible,
  status,
  message,
  autoClose = true,
  hideStatus,
  messages,
}) => {
  // Auto-close the status message after 3 seconds if autoClose is true
  useEffect(() => {
    let timer;
    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        hideStatus();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoClose, hideStatus]);

  // If not visible, return null
  if (!isVisible) return null;

  // Get appropriate style for the status type
  const containerStyle = styles[status] || styles.info;
  const textStyle = styles[`${status}Text`] || styles.infoText;

  // Get message text - either from messages object or use direct message
  const messageText = messages && message in messages ? messages[message] : message;

  return (
    <View style={[styles.statusContainer, containerStyle]}>
      <Text style={[styles.statusText, textStyle]}>{messageText}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={hideStatus}>
        <Text style={[styles.closeIcon, textStyle]}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Component for displaying skeleton loading animation
 */
export const SkeletonLoader = ({ style, children, isLoading = true }) => {
  // Animation for skeleton loading effect
  const animationValue = new Animated.Value(0);

  // Start animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      animationValue.setValue(0);
    }

    return () => {
      animationValue.setValue(0);
    };
  }, [isLoading, animationValue]);

  // If not loading, render children
  if (!isLoading) return children;

  // Create the shimmer effect
  const shimmerStyle = {
    transform: [
      {
        translateX: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-100%", "100%"],
        }),
      },
    ],
  };

  return (
    <View style={[styles.skeletonAnimation, style]}>
      <Animated.View style={[styles.skeletonShimmer, shimmerStyle]} />
    </View>
  );
};

export default StatusHandler;
