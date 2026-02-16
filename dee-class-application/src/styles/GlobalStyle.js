import { StyleSheet } from "react-native";
import SPACING from "./spacing";

export const GlobalStyle = StyleSheet.create({
  container: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  safeAreaView: {
    flex: 1,
  },
});
