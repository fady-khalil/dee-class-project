import React from "react";
import StackNavigator from "./StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { linking } from "./linkingConfig";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar
          backgroundColor="black"
          barStyle="light-content"
          translucent={false}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
          <StackNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
