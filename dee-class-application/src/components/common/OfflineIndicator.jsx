import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../../context/Network";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const { isConnected, isReconnecting } = useNetwork();
  const navigation = useNavigation();

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isConnected || isReconnecting) {
      // Slide and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isConnected, isReconnecting]);

  // Rotating animation for the reconnecting icon
  useEffect(() => {
    if (isReconnecting) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.setValue(0);
    }
  }, [isReconnecting]);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleViewDownloads = () => {
    navigation.navigate("Downloads");
  };

  if (isConnected && !isReconnecting) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {isReconnecting ? (
        <>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.text}>{t("navigation.reconnecting")}</Text>
        </>
      ) : (
        <>
          <AntDesign name="wifi" size={16} color="#FFFFFF" />
          <View style={styles.textContainer}>
            <Text style={styles.textBold}>
              {t("navigation.offline_status")}
            </Text>
            <Text style={styles.text}>{t("navigation.offline_message")}</Text>
          </View>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleViewDownloads}
            activeOpacity={0.7}
          >
            <MaterialIcons name="download" size={18} color="#FFFFFF" />
            <Text style={styles.downloadText}>
              {t("downloads.view_downloads")}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70, // Above the bottom navigation
    left: 10,
    right: 10,
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    zIndex: 999,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  textBold: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
    marginLeft: 8,
  },
  downloadButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  downloadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default OfflineIndicator;
