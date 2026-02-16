import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import AnimatedTitle from "./AnimatedTitle";
import {
  LOGO_FADE_DELAY,
  LOGO_FADE_DURATION,
  FADE_OUT_DELAY,
  FADE_OUT_DURATION,
} from "./constants";

const smallLogo = require("../../Assests/logos/small-logo.png");

const SplashScreen = ({ onFinish }) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(LOGO_FADE_DELAY),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: LOGO_FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.delay(FADE_OUT_DELAY - LOGO_FADE_DELAY - LOGO_FADE_DURATION),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <AnimatedTitle />

      <Animated.Image
        source={smallLogo}
        style={[styles.logo, { opacity: logoOpacity }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 30,
  },
});

export default SplashScreen;
