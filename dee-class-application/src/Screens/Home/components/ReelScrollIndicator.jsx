import React from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import COLORS from "../../../styles/colors";

const ReelScrollIndicator = ({ reelsData, activeIndex, onIndicatorClick }) => {
  return (
    <View style={styles.container}>
      {reelsData.map((_, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={styles.indicatorContainer}
            onPress={() => onIndicatorClick(index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.indicator,
                isActive ? styles.activeIndicator : null,
                {
                  height: isActive ? 20 : 6,
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -50 }],
    zIndex: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    padding: 6,
    marginVertical: 2,
  },
  indicator: {
    width: 4,
    height: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 4,
    height: 20,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ReelScrollIndicator;
