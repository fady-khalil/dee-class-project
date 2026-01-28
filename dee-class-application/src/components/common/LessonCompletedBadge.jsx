import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import COLORS from "../../styles/colors";

const sizeStyles = {
  small: { iconSize: 16, pad: 4, textSize: 12, textPadH: 6, textPadV: 2 },
  medium: { iconSize: 20, pad: 6, textSize: 14, textPadH: 8, textPadV: 4 },
  large: { iconSize: 24, pad: 8, textSize: 16, textPadH: 10, textPadV: 6 },
};

const LessonCompletedBadge = ({ variant = "icon", size = "medium", style }) => {
  const { t } = useTranslation();
  const s = sizeStyles[size] || sizeStyles.medium;

  const iconElement = (
    <View
      style={[
        {
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: s.pad,
          borderRadius: s.iconSize,
        },
        style,
      ]}
    >
      <Icon name="check-circle" size={s.iconSize} color={COLORS.primary} />
    </View>
  );

  if (variant === "icon") {
    return iconElement;
  }

  if (variant === "text") {
    return (
      <Text
        style={[
          {
            backgroundColor: COLORS.primary + "10",
            color: COLORS.primary,
            fontSize: s.textSize,
            fontWeight: "600",
            paddingHorizontal: s.textPadH,
            paddingVertical: s.textPadV,
            borderRadius: s.textSize,
            overflow: "hidden",
          },
          style,
        ]}
      >
        {t("courses.completed")}
      </Text>
    );
  }

  if (variant === "icon-text") {
    return (
      <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
        {iconElement}
        <Text
          style={{
            color: COLORS.primary,
            fontSize: s.textSize,
            fontWeight: "600",
            marginLeft: 4,
          }}
        >
          {t("courses.completed")}
        </Text>
      </View>
    );
  }

  return null;
};

export default LessonCompletedBadge;
