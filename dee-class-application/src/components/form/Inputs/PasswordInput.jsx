import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import COLORS from "../../../styles/colors";
import SPACING from "../../../styles/spacing";
import Icon from "react-native-vector-icons/Ionicons";

/**
 * Password Input component with show/hide functionality
 * Note: Text alignment is handled automatically by I18nManager when RTL is enabled
 */
const PasswordInput = ({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  hasError,
  errorMessage,
  isWhite = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <View style={styles.inputContainer}>
      <View
        style={[
          styles.inputWrapper,
          isWhite ? styles.whiteInput : {},
          hasError ? styles.inputError : {},
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor={isWhite ? COLORS.lightGrey : COLORS.grey}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconButton}
        >
          <Icon
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.grey}
          />
        </TouchableOpacity>
      </View>
      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.black,
  },
  whiteInput: {
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  iconButton: {
    padding: SPACING.md,
  },
});

export default PasswordInput;
