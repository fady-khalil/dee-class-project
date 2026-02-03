import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import BASE_URL from "Utilities/BASE_URL";

const GoogleAuth = ({ onSuccess }) => {
  const handleSuccess = async (response) => {
    const googleToken = response.credential;
    console.log("Google OAuth Token:", googleToken);

    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();
      console.log("Backend Response:", data);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Google Login Failed", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="1053476553988-id9bqs99nt6vno7nfkfm0lg95h69knp6.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
