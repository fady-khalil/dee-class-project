import { createContext, useState, useEffect } from "react";
export const LoginAuthContext = createContext();

// Helper function to check if user is verified
// Backend uses 'verified' field (boolean)
const checkIsVerified = (value) => {
  return value === true || value === 1 || value === "1";
};

export const LoginAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [allowedProfiles, setAllowedProfiles] = useState(false);
  const [allowedCourses, setAllowedCourses] = useState([]);
  const [profiles, setProfilesState] = useState(false);
  const [token, setToken] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // is authenticated is used to check if the user is logged in and have allowed profiles so have paid for a plan
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAllowedCoursesHandler = (newAllowedCourses) => {
    setAllowedCourses(newAllowedCourses);
    if (newAllowedCourses) {
      localStorage.setItem("allowedCourses", JSON.stringify(newAllowedCourses));
    }
  };

  const setProfiles = (newProfiles) => {
    setProfilesState(newProfiles);
    if (newProfiles) {
      localStorage.setItem("profiles", JSON.stringify(newProfiles));
    }
  };

  const setSelectedUserState = (newSelectedUser) => {
    setSelectedUser(newSelectedUser);
    if (newSelectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(newSelectedUser));
    }
  };

  const loginHandler = (
    token,
    user,
    profilesAllowed,
    coursesAllowed,
    profiles
  ) => {
    setIsLoggedIn(true);
    setToken(token);
    setUser(user);

    // Handle verified from user object (backend uses 'verified' field)
    const userIsVerified = checkIsVerified(user?.verified);
    setIsVerified(userIsVerified);
    localStorage.setItem("isVerified", userIsVerified);

    // Handle optional parameters that might be undefined during registration
    if (profilesAllowed !== null) {
      setAllowedProfiles(profilesAllowed);
      localStorage.setItem("allowedProfiles", profilesAllowed);
    }

    if (coursesAllowed?.length !== 0) {
      setAllowedCourses(coursesAllowed);
      localStorage.setItem("allowedCourses", JSON.stringify(coursesAllowed));
    }

    if (profiles !== null) {
      setProfiles(profiles);
    }

    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (profilesAllowed) {
      setIsAuthenticated(true);
    }
  };

  // Handler to update verification status (called after email verification)
  const setIsVerifiedHandler = (verified) => {
    const isVerifiedValue = checkIsVerified(verified);
    setIsVerified(isVerifiedValue);
    localStorage.setItem("isVerified", isVerifiedValue);

    // Update user object with new verification status (backend uses 'verified' field)
    if (user) {
      const updatedUser = { ...user, verified: isVerifiedValue };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

    if (storedIsLoggedIn) {
      setIsLoggedIn(true);

      // Handle token - no parsing needed
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }

      // Handle user data with safe parsing
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Also restore isVerified from user object (backend uses 'verified' field)
          setIsVerified(checkIsVerified(parsedUser?.verified));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }

      // Handle isVerified with safe retrieval
      const storedIsVerified = localStorage.getItem("isVerified");
      if (storedIsVerified !== null) {
        setIsVerified(storedIsVerified === "true");
      }

      // Handle allowedProfiles with safe retrieval
      const storedAllowedProfiles = localStorage.getItem("allowedProfiles");
      if (storedAllowedProfiles && storedAllowedProfiles !== "undefined") {
        setAllowedProfiles(storedAllowedProfiles);

        // Set authenticated if profiles are allowed
        if (storedAllowedProfiles !== "false") {
          setIsAuthenticated(true);
        }
      }

      // Handle allowedCourses with safe retrieval
      const storedAllowedCourses = localStorage.getItem("allowedCourses");
      if (storedAllowedCourses && storedAllowedCourses !== "undefined") {
        try {
          setAllowedCourses(JSON.parse(storedAllowedCourses));
        } catch (error) {
          console.error("Error parsing allowedCourses data:", error);
          setAllowedCourses([]);
        }
      }

      // Handle profiles with safe parsing
      try {
        const storedProfiles = localStorage.getItem("profiles");
        if (storedProfiles && storedProfiles !== "undefined") {
          setProfiles(JSON.parse(storedProfiles));
        }
      } catch (error) {
        console.error("Error parsing profiles data:", error);
      }

      // Handle selectedUser with safe parsing
      try {
        const storedSelectedUser = localStorage.getItem("selectedUser");
        if (storedSelectedUser && storedSelectedUser !== "undefined") {
          setSelectedUser(JSON.parse(storedSelectedUser));
        }
      } catch (error) {
        console.error("Error parsing selectedUser data:", error);
        localStorage.removeItem("selectedUser");
      }
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("allowedProfiles");
    localStorage.removeItem("allowedCourses");
    localStorage.removeItem("profiles");
    localStorage.removeItem("selectedUser");
    localStorage.removeItem("isVerified");

    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setAllowedProfiles(false);
    setProfiles(false);
    setIsAuthenticated(false);
    setAllowedCourses([]);
    setIsVerified(false);
  };

  return (
    <LoginAuthContext.Provider
      value={{
        isLoggedIn,
        user,
        allowedProfiles,
        allowedCourses,
        token,
        isAuthenticated,
        isVerified,
        setToken,
        setProfiles,
        profiles,
        selectedUser,
        setSelectedUserState,
        setAllowedCoursesHandler,
        setIsVerifiedHandler,
        // handlers
        loginHandler,
        logoutHandler,
        setUser,
        setAllowedProfiles,
        setIsAuthenticated,
      }}
    >
      {children}
    </LoginAuthContext.Provider>
  );
};
