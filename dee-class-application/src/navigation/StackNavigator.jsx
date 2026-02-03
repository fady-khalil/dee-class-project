import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomNavigator";
import { HeaderBack } from "../components/navigation";
import HomeMainScreen from "../Screens/Home/HomeMainScreen";
import CourseDetail from "../Screens/Course/CourseDetail";
import CourseContent from "../Screens/Course/CourseContent";
import InstructorProfileScreen from "../Screens/InstructorProfile/InstructorProfileScreen";
import MyCourses from "../Screens/Profile/MyCourses";
import MyProfiles from "../Screens/Profile/MyProfiles";
import EditProfile from "../Screens/Profile/EditProfile";
import ChangePassword from "../Screens/Profile/ChangePassword";
import SubscriptionDetails from "../Screens/Profile/SubscriptionDetails";
import Login from "../Screens/Auth/Login";
import Register from "../Screens/Auth/Register";
import VerifyEmail from "../Screens/Auth/VerifyEmail";
import ForgotPassword from "../Screens/Auth/ForgotPassword";
import GiftCode from "../Screens/Auth/GiftCode";
import GiftLogin from "../Screens/Auth/GiftLogin";
import GiftRegister from "../Screens/Auth/GiftRegister";
import GiftVerifyEmail from "../Screens/Auth/GiftVerifyEmail";
import GiftSuccess from "../Screens/Auth/GiftSuccess";
import GiftPlanScreen from "../Screens/Gift/GiftPlanScreen";
import GiftPurchaseSuccess from "../Screens/Gift/GiftPurchaseSuccess";
import Profile from "../Screens/Profile/Profile";
import SettingsScreen from "../Screens/Settings/SettingsScreen";
import PlansScreen from "../Screens/Plans/PlansScreen";
import PaymentSuccessScreen from "../Screens/Payment/PaymentSuccessScreen";
import DownloadCoursesScreen from "../Screens/Downloads/DownloadCoursesScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      // initialRouteName="Main"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="HomeScreen" component={HomeMainScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetail} />
      <Stack.Screen name="CourseContent" component={CourseContent} />
      <Stack.Screen
        name="InstructorProfile"
        component={InstructorProfileScreen}
      />
      <Stack.Screen name="MyCourses" component={MyCourses} />
      <Stack.Screen name="MyProfiles" component={MyProfiles} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="SubscriptionDetails" component={SubscriptionDetails} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="Downloads" component={DownloadCoursesScreen} />
      {/* Gift Code Screens */}
      <Stack.Screen name="GiftCode" component={GiftCode} />
      <Stack.Screen name="GiftLogin" component={GiftLogin} />
      <Stack.Screen name="GiftRegister" component={GiftRegister} />
      <Stack.Screen name="GiftVerifyEmail" component={GiftVerifyEmail} />
      <Stack.Screen name="GiftSuccess" component={GiftSuccess} />
      <Stack.Screen name="GiftPlan" component={GiftPlanScreen} />
      <Stack.Screen name="GiftPurchaseSuccess" component={GiftPurchaseSuccess} />
      {/* Add other screens here that need to be accessed outside the tab navigation */}
    </Stack.Navigator>
  );
};

export default StackNavigator;
