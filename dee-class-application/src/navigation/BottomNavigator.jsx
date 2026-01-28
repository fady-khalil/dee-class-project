import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Platform, StyleSheet, View } from "react-native";
import COLORS from "../styles/colors";
import HomeMainScreen from "../Screens/Home/HomeMainScreen";
import MyProgress from "../Screens/My Progress/MyProgress";
import Library from "../Screens/Librarie/Library";
import { useAuth } from "../context/Authentication/LoginAuth";
import OfflineIndicator from "../components/common/OfflineIndicator";
import OfflineScreen from "../components/common/OfflineScreen";
import { useNetwork } from "../context/Network";

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon with forced direction
const TabBarIcon = ({ focused, iconName, iconOutlineName }) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={focused ? iconName : iconOutlineName}
        color={focused ? COLORS.primary : COLORS.lightWhite}
        size={28}
      />
    </View>
  );
};

const BottomTabNavigator = () => {
  const { isAuthenticated, allowedCourses } = useAuth();
  const { isConnected } = useNetwork();

  // Define the tabs configuration with their options
  const tabScreens = useMemo(() => {
    const screens = [
      {
        name: "Home",
        component: isConnected ? HomeMainScreen : OfflineScreen,
        options: {
          tabBarIcon: ({ focused }) =>
            TabBarIcon({
              focused,
              iconName: "home",
              iconOutlineName: "home-outline",
            }),
        },
      },
    ];

    // Add Library tab if user has allowed courses
    screens.push({
      name: "Library",
      component: isConnected ? Library : OfflineScreen,
      options: {
        tabBarIcon: ({ focused }) =>
          TabBarIcon({
            focused,
            iconName: "library",
            iconOutlineName: "library-outline",
          }),
      },
    });

    // Add My Progress tab if user is authenticated
    if (isAuthenticated) {
      screens.push({
        name: "MyProgress",
        component: isConnected ? MyProgress : OfflineScreen,
        options: {
          tabBarIcon: ({ focused }) =>
            TabBarIcon({
              focused,
              iconName: "person",
              iconOutlineName: "person-outline",
            }),
        },
      });
    }

    return screens;
  }, [isAuthenticated, allowedCourses, isConnected]);

  // Determine the initial route name based on language
  const initialRouteName = useMemo(() => {
    return "Home";
  }, []);

  return (
    <>
      <Tab.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "black",
            paddingTop: 6,
            paddingBottom: 6,
            height: 60,
          },
          tabBarItemStyle: {
            // Add any specific item styling here if needed
          },
          tabBarHideOnKeyboard: Platform.OS !== "ios",
        }}
      >
        {tabScreens.map((screen) => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}
      </Tab.Navigator>
      <OfflineIndicator />
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomTabNavigator;
