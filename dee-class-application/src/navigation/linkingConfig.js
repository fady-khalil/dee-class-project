import * as Linking from "expo-linking";

// Get the Expo development URL prefix for Expo Go
const expoPrefix = Linking.createURL("/");
console.log("Expo deep link prefix:", expoPrefix);

export const linking = {
  // Include Expo Go prefix for development AND production scheme
  prefixes: [expoPrefix, "deeclass://", "https://yourwebsite.com"],
  config: {
    screens: {
      PaymentSuccess: {
        path: "payment/success",
        parse: {
          session_id: (session_id) => session_id,
          type: (type) => type,
        },
      },
      GiftPurchaseSuccess: {
        path: "gift/success",
        parse: {
          session_id: (session_id) => session_id,
        },
      },
      Main: {
        screens: {
          Home: "home",
          Library: "library",
          MyProgress: "my-progress",
          Profile: "profile",
        },
      },
      CourseDetails: {
        path: "course/:slug",
        parse: {
          slug: (slug) => slug,
        },
      },
    },
  },
};
