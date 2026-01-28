import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import COLORS from "../../../styles/colors";

/**
 * Reusable Input component for React Native
 * Note: Text alignment is handled automatically by I18nManager when RTL is enabled
 */
const Input = ({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  hasError,
  errorMessage,
  secureTextEntry = false,
  isWhite = false,
  keyboardType = "default",
  autoCapitalize = "none",
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          isWhite ? styles.whiteInput : {},
          hasError ? styles.inputError : {},
        ]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={isWhite ? COLORS.lightGrey : COLORS.grey}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    textAlign: "start",
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.darkWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    color: COLORS.black,
    textAlign: "left",
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
    marginTop: 4,
  },
});

export default Input;
