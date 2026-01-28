import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../config/BASE_URL";

export const LoginAuthContext = createContext();

// Add useAuth hook
export const useAuth = () => {
  const context = useContext(LoginAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a LoginAuthProvider");
  }
  return context;
};

export const LoginAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [allowedProfiles, setAllowedProfiles] = useState(false);
  const [allowedCourses, setAllowedCourses] = useState([]);
  const [profiles, setProfilesState] = useState(false);
  const [token, setToken] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // is authenticated is used to check if the user is logged in and have allowed profiles so have paid for a plan
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track if email is verified
  const [isVerified, setIsVerified] = useState(false);

  const setAllowedCoursesHandler = async (newAllowedCourses) => {
    if (newAllowedCourses && Array.isArray(newAllowedCourses)) {
      setAllowedCourses(newAllowedCourses);
      try {
        await AsyncStorage.setItem(
          "allowedCourses",
          JSON.stringify(newAllowedCourses)
        );
      } catch (error) {
        console.error("Error saving allowedCourses:", error);
      }
    } else {
      // If undefined or null is passed, set an empty array
      setAllowedCourses([]);
      try {
        await AsyncStorage.setItem("allowedCourses", JSON.stringify([]));
      } catch (error) {
        console.error("Error saving empty allowedCourses:", error);
      }
    }
  };

  const setProfiles = async (newProfiles) => {
    if (newProfiles !== undefined && newProfiles !== null) {
      setProfilesState(newProfiles);
      try {
        await AsyncStorage.setItem("profiles", JSON.stringify(newProfiles));
      } catch (error) {
        console.error("Error saving profiles:", error);
      }
    } else {
      // If undefined or null is passed, set to false or empty object
      setProfilesState(false);
      try {
        await AsyncStorage.setItem("profiles", JSON.stringify(false));
      } catch (error) {
        console.error("Error saving empty profiles:", error);
      }
    }
  };

  // const refreshProfiles = useCallback(async () => {
  //   if (!token) return;

  //   try {
  //     // Make sure to use the direct endpoint without language prefix
  //     const response = await fetch(`${BASE_URL}/profiles`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     // Check if response is OK before trying to parse JSON
  //     if (!response.ok) {
  //       console.error(
  //         `Failed to refresh profiles: ${response.status} ${response.statusText}`
  //       );
  //       return;
  //     }

  //     // Check for content type to ensure we're getting JSON
  //     const contentType = response.headers.get("content-type");
  //     if (!contentType || !contentType.includes("application/json")) {
  //       console.error(
  //         "Invalid response format: Expected JSON but received different content type"
  //       );
  //       return;
  //     }

  //     try {
  //       const data = await response.json();

  //       if (data.success) {
  //         setProfiles(data.data);
  //       } else {
  //         console.error(
  //           "Failed to refresh profiles:",
  //           data.message || "Unknown error"
  //         );
  //       }
  //     } catch (parseError) {
  //       console.error("Error parsing JSON response:", parseError);
  //     }
  //   } catch (error) {
  //     console.error("Error refreshing profiles:", error);
  //   }
  // }, [token]);

  // Handler to update email verification status
  const setIsVerifiedHandler = async (verified) => {
    setIsVerified(verified);
    try {
      await AsyncStorage.setItem("isVerified", JSON.stringify(verified));
      // Also update user object if it exists (save both field names for compatibility)
      if (user) {
        const updatedUser = { ...user, verified: verified, email_verified: verified };
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error saving verification status:", error);
    }
  };

  const setSelectedUserState = async (newSelectedUser) => {
    if (newSelectedUser !== undefined && newSelectedUser !== null) {
      setSelectedUser(newSelectedUser);
      try {
        await AsyncStorage.setItem(
          "selectedUser",
          JSON.stringify(newSelectedUser)
        );
      } catch (error) {
        console.error("Error saving selectedUser:", error);
      }
    } else {
      // If undefined or null is passed, set to null
      setSelectedUser(null);
      try {
        // Remove the item instead of setting it to null
        await AsyncStorage.removeItem("selectedUser");
      } catch (error) {
        console.error("Error removing selectedUser:", error);
      }
    }
  };

  const loginHandler = async (
    token,
    user,
    profilesAllowed,
    coursesAllowed,
    profiles
  ) => {
    setIsLoggedIn(true);
    setToken(token);
    setUser(user);

    try {
      await AsyncStorage.setItem("isLoggedIn", "true");

      // Only store token if it exists
      if (token) {
        await AsyncStorage.setItem("token", token);
      }

      // Only store user if it exists and is not null
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        // Set email verification status from user object (API returns 'verified' not 'email_verified')
        const emailVerified = user.verified || user.email_verified || false;
        setIsVerified(emailVerified);
        await AsyncStorage.setItem("isVerified", JSON.stringify(emailVerified));
      }

      // Handle optional parameters that might be undefined during registration
      if (profilesAllowed !== undefined && profilesAllowed !== null) {
        setAllowedProfiles(profilesAllowed);
        await AsyncStorage.setItem("allowedProfiles", String(profilesAllowed));
      }

      if (
        coursesAllowed &&
        Array.isArray(coursesAllowed) &&
        coursesAllowed.length > 0
      ) {
        setAllowedCourses(coursesAllowed);
        await AsyncStorage.setItem(
          "allowedCourses",
          JSON.stringify(coursesAllowed)
        );
      } else {
        // If coursesAllowed is undefined, null or empty, set an empty array
        setAllowedCourses([]);
        await AsyncStorage.setItem("allowedCourses", JSON.stringify([]));
      }

      if (profiles !== undefined && profiles !== null) {
        setProfiles(profiles);
        await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
      }

      if (profilesAllowed) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  };

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedIsLoggedIn = await AsyncStorage.getItem("isLoggedIn");

        if (storedIsLoggedIn) {
          setIsLoggedIn(true);

          // Handle token
          const storedToken = await AsyncStorage.getItem("token");
          if (storedToken) {
            setToken(storedToken);
          }

          // Handle user data with safe parsing
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser && storedUser !== "undefined") {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Also set verification status from user object (API returns 'verified' not 'email_verified')
            const userVerified = parsedUser.verified || parsedUser.email_verified;
            if (userVerified !== undefined) {
              setIsVerified(userVerified);
            }
          }

          // Handle isVerified
          const storedIsVerified = await AsyncStorage.getItem("isVerified");
          if (storedIsVerified && storedIsVerified !== "undefined") {
            setIsVerified(JSON.parse(storedIsVerified));
          }

          // Handle allowedProfiles
          const storedAllowedProfiles = await AsyncStorage.getItem(
            "allowedProfiles"
          );
          if (storedAllowedProfiles && storedAllowedProfiles !== "undefined") {
            setAllowedProfiles(storedAllowedProfiles);

            // Set authenticated if profiles are allowed
            if (storedAllowedProfiles !== "false") {
              setIsAuthenticated(true);
            }
          }

          // Handle allowedCourses
          const storedAllowedCourses = await AsyncStorage.getItem(
            "allowedCourses"
          );
          if (storedAllowedCourses && storedAllowedCourses !== "undefined") {
            try {
              setAllowedCourses(JSON.parse(storedAllowedCourses));
            } catch (error) {
              console.error("Error parsing allowedCourses data:", error);
              setAllowedCourses([]);
            }
          }

          // Handle profiles
          const storedProfiles = await AsyncStorage.getItem("profiles");
          if (storedProfiles && storedProfiles !== "undefined") {
            try {
              setProfiles(JSON.parse(storedProfiles));
            } catch (error) {
              console.error("Error parsing profiles data:", error);
            }
          }

          // Handle selectedUser
          const storedSelectedUser = await AsyncStorage.getItem("selectedUser");
          if (storedSelectedUser && storedSelectedUser !== "undefined") {
            try {
              setSelectedUser(JSON.parse(storedSelectedUser));
            } catch (error) {
              console.error("Error parsing selectedUser data:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };

    loadAuthData();
  }, []);

  const logoutHandler = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("allowedProfiles");
      await AsyncStorage.removeItem("allowedCourses");
      await AsyncStorage.removeItem("profiles");
      await AsyncStorage.removeItem("selectedUser");
      await AsyncStorage.removeItem("isVerified");

      setIsLoggedIn(false);
      setToken(null);
      setUser(null);
      setAllowedProfiles(false);
      setProfiles(false);
      setIsAuthenticated(false);
      setAllowedCourses([]);
      setIsVerified(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const contextValue = {
    isLoggedIn,
    user,
    allowedProfiles,
    allowedCourses,
    profiles,
    token,
    selectedUser,
    isAuthenticated,
    isVerified,
    setToken,
    setProfiles,
    setSelectedUserState,
    setAllowedCoursesHandler,
    loginHandler,
    logoutHandler,
    setUser,
    setAllowedProfiles,
    setIsAuthenticated,
    setIsVerifiedHandler,
    // refreshProfiles,
  };

  return (
    <LoginAuthContext.Provider value={contextValue}>
      {children}
    </LoginAuthContext.Provider>
  );
};
