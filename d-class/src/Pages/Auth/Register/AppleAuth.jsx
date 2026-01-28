import React, { useEffect, useState } from "react";
import AppleLogin from "react-apple-login";

const AppleAuth = ({ onSuccess }) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Add this useEffect to load the Apple JS SDK
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById("apple-sign-in-script")) {
      if (window.AppleID) {
        setSdkLoaded(true);
      }
      return;
    }

    // Load Apple Sign-In SDK
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.id = "apple-sign-in-script";

    // Add event listener to initialize AppleID when script loads
    script.onload = () => {
      // Give time for AppleID to initialize
      setTimeout(() => {
        try {
          // Check if AppleID is defined before using it
          if (typeof window.AppleID !== "undefined") {
            // Initialize AppleID
            window.AppleID.auth.init({
              clientId: "com.deeclass.web",
              scope: "name email",
              redirectURI: "https://dee-class.netlify.app/auth/callback",
              usePopup: true,
            });
            setSdkLoaded(true);
          } else {
            console.error("AppleID is not available on window object");
          }
        } catch (error) {
          console.error("Error initializing Apple Sign-In:", error);
        }
      }, 1000); // Increased timeout to ensure script has time to initialize
    };

    script.onerror = () => {
      console.error("Failed to load Apple Sign-In SDK");
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById("apple-sign-in-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleAppleLogin = (response) => {
    if (response.error) {
      console.error("Apple login failed:", response.error);
    } else {
      console.log("Apple login successful", response);

      // The `response` contains the authorization code and ID token
      const { code, id_token } = response;

      // You can now store the `id_token` or `code` in localStorage or state for now
      // You will use this token when backend is developed to validate the user
      console.log("ID Token:", id_token);
      console.log("Authorization Code:", code);

      if (onSuccess) {
        onSuccess(response);
      }
    }
  };

  const handleError = (error) => {
    console.error("Apple Sign-In Error:", error);
  };

  // Custom handler for the button click
  const handleCustomAppleSignIn = () => {
    if (sdkLoaded && typeof window.AppleID !== "undefined") {
      try {
        window.AppleID.auth.signIn();
      } catch (error) {
        console.error("Error during Apple Sign-In:", error);
      }
    } else {
      console.error("Apple SDK not loaded yet");
    }
  };

  // Always fall back to the AppleLogin component instead of conditionally rendering
  return (
    <div>
      <AppleLogin
        clientId="com.deeclass.web"
        redirectURI="https://dee-class.netlify.app/auth/callback"
        scope="name email"
        responseType="code id_token"
        responseMode="form_post"
        usePopup={true}
        render={(renderProps) => (
          <button
            onClick={
              sdkLoaded && typeof window.AppleID !== "undefined"
                ? handleCustomAppleSignIn
                : renderProps.onClick
            }
            className="apple-auth-btn"
            style={{
              backgroundColor: "#fff",
              fontFamily: "Google Sans, arial, sans-serif",
              color: "#3c4043",
              padding: "9px 15px",
              textAlign: "center",
              letterSpacing: "0.25px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "1px solid #dadce0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              fontSize: "14px",
              gap: "8px",
              transition: "background-color 0.3s, box-shadow 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f7f7f7";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 170 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.71 3.35-4.91 0.21-9.81-1.96-14.7-6.52-3.14-2.73-7.06-7.41-11.77-14.04-5.04-7.08-9.18-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.05-28.07 3.69-6.31 8.61-11.27 14.76-14.87 6.15-3.61 12.8-5.44 19.95-5.56 3.91 0 9.05 1.21 15.43 3.59 6.36 2.38 10.45 3.59 12.25 3.59 1.34 0 5.88-1.41 13.57-4.23 7.28-2.59 13.41-3.67 18.42-3.25 13.63 1.1 23.86 6.48 30.63 16.19-12.19 7.39-18.22 17.73-18.11 31 0.09 10.34 3.86 18.94 11.3 25.77 3.36 3.19 7.13 5.65 11.3 7.36-0.9 2.62-1.85 5.12-2.86 7.51zM119.11 7.24c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.38-0.12-0.97-0.19-1.99-0.19-3.07 0-7.77 3.39-16.09 9.4-22.91 3-3.45 6.82-6.31 11.45-8.6 4.62-2.25 8.99-3.5 13.1-3.71 0.12 1.09 0.17 2.17 0.17 3.24z"
                fill="black"
              />
            </svg>
            <span>Sign in with Apple</span>
          </button>
        )}
        callback={handleAppleLogin}
        onError={handleError}
      />
    </div>
  );
};

export default AppleAuth;
