import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const { loginHandler, setIsAuthenticated, setAllowedCoursesHandler } =
    useContext(LoginAuthContext);
  const navigate = useNavigate();
  const { postData } = usePostDataNoLang();
  const location = useLocation();
  const [source, setSource] = useState(null);

  const redirectToApp = (sessionId) => {
    // For iOS
    const iOSDeepLink = `deeclass://payment/success?session_id=${sessionId}`;
    // For Android
    const androidDeepLink = `intent://payment/success?session_id=${sessionId}#Intent;scheme=deeclass;package=com.deeclass.app;end`;

    // Detect platform
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isAndroid) {
      window.location.href = androidDeepLink;
    } else if (isIOS) {
      window.location.href = iOSDeepLink;
    } else {
      // Fallback for desktop or if app is not installed
      window.location.href = iOSDeepLink; // Try universal link first
    }
  };

  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const sourceValue = queryParams.get("source");
    const sessionId = queryParams.get("session_id");
    const purchaseType = queryParams.get("type"); // "course" or "plan"
    setSource(sourceValue);

    if (sourceValue === "application") {
      console.log("is Application");
      // Redirect back to the mobile app
      redirectToApp(sessionId);
      return; // Stop further execution
    }

    refreshData(sessionId, purchaseType);
  }, [location]);

  const refreshData = async (sessionId, purchaseType) => {
    // Retrieve token and user from localStorage directly
    const storedToken = localStorage.getItem("token");
    let storedUser = null;

    try {
      const storedUserString = localStorage.getItem("user");
      if (storedUserString && storedUserString !== "undefined") {
        storedUser = JSON.parse(storedUserString);
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      navigate("/");
      return;
    }

    if (!storedUser?._id || !storedToken) {
      console.error("No user ID or token available");
      navigate("/");
      return;
    }

    // Pass session_id to verify payment directly (works without webhook)
    const response = await postData("webhook/refresh-data", {
      user_id: storedUser._id,
      session_id: sessionId,
    });

    console.log(storedUser, "stored user");
    console.log(storedToken, "stored token");
    console.log(response);

    if (response.success) {
      const mobileUser = response?.data?.mobile_user;

      // Update context with new user data
      loginHandler(
        storedToken,
        mobileUser,
        mobileUser?.allowed_profiles,
        mobileUser?.allowed_courses,
        mobileUser?.profiles
      );
      setAllowedCoursesHandler(mobileUser?.allowed_courses);

      // Determine where to redirect based on purchase type
      if (purchaseType === "course") {
        // Course purchase - go to my courses
        setIsAuthenticated(mobileUser?.allowed_profiles !== null);
        navigate("/my-courses");
      } else if (mobileUser?.allowed_profiles !== null) {
        // Plan purchase with profiles - go to profiles page
        setIsAuthenticated(true);
        navigate("/my-profiles");
      } else {
        // No active subscription - go home
        setIsAuthenticated(false);
        navigate("/");
      }
    } else {
      console.log(response.message);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <CheckCircle
            className="mx-auto text-green-500"
            size={120}
            weight="fill"
          />
          <div className="w-24 h-1 bg-green-500 mx-auto mt-4"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Success!
          </h2>
          <p className="text-gray-600 mb-16 max-w-md mx-auto">
            Your action has been completed successfully. Thank you for using our
            service!
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12"
        >
          <div className="text-sm text-gray-500">
            <p>Need help? Contact our support team</p>
            <a href="/contact" className="text-blue-500 hover:text-blue-600">
              Get in touch
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Success;
