import { StyleSheet } from "react-native";
import COLORS from "../../styles/colors";

// Styles for skeleton loading animation and status handler
export const styles = StyleSheet.create({
  // Container style for the status message
  statusContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  // Status message text
  statusText: {
    flex: 1,
    fontWeight: "500",
    fontSize: 14,
    paddingRight: 10,
  },
  // Success status style
  success: {
    backgroundColor: "#E6F7EF",
    borderLeftWidth: 4,
    borderLeftColor: "#2ECC71",
  },
  successText: {
    color: "#2ECC71",
  },
  // Error status style
  error: {
    backgroundColor: "#FDEDEE",
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
  },
  // Warning status style
  warning: {
    backgroundColor: "#FEF8E8",
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  warningText: {
    color: "#F39C12",
  },
  // Info status style
  info: {
    backgroundColor: "#EBF5FC",
    borderLeftWidth: 4,
    borderLeftColor: "#3498DB",
  },
  infoText: {
    color: "#3498DB",
  },
  // Close button style
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // Skeleton loading animation
  skeletonAnimation: {
    backgroundColor: COLORS.lightGrey,
    overflow: "hidden",
    position: "relative",
  },
  skeletonShimmer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});

// Create an animation keyframe-like function for React Native skeleton animation
export const createSkeletonAnimation = (animationValue) => {
  return {
    transform: [
      {
        translateX: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-100%", "100%"],
        }),
      },
    ],
  };
};
