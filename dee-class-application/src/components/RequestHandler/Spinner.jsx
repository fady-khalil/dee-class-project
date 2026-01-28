import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import COLORS from "../../styles/colors";

/**
 * Loading spinner component for React Native
 * @param {Object} props - Component props
 * @param {boolean} props.isSmall - Whether to show a small spinner
 * @param {boolean} props.isWhite - Whether to use white color
 * @param {Object} props.style - Additional style for the container
 */
const Spinner = ({ isSmall = false, isWhite = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={isSmall ? "small" : "large"}
        color={isWhite ? COLORS.white : COLORS.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Spinner;
