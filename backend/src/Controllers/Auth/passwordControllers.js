import {
  validatePasswordChange,
  generatePasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
} from "../../Services/crud/PasswordService.js";
import { getMessage } from "../../utils/authMessages.js";

export const ChangePassword = async (req, res) => {
  const lang = req.language || "en";

  try {
    console.log("Change password request body:", {
      ...req.body,
      oldPassword: "[REDACTED]",
      newPassword: "[REDACTED]",
      confirmPassword: "[REDACTED]",
    });

    // Add explicit check for req.user
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: getMessage("authentication_required", lang),
        data: null,
      });
    }

    const { userId, verified } = req.user;
    console.log("User making request:", { userId, verified });

    // Set security headers
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Extract validated data from middleware
    const { oldPassword, newPassword, confirmPassword } = req.validatedData;
    console.log("Validated data received", {
      hasOldPassword: !!oldPassword,
      hasNewPassword: !!newPassword,
      hasConfirmPassword: !!confirmPassword,
    });

    // Verify user must be verified to change password (can be removed if needed)
    if (!verified) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: getMessage("verification_required_password", lang),
        data: null,
      });
    }

    // Use service layer
    await validatePasswordChange(
      userId,
      oldPassword,
      newPassword,
      confirmPassword
    );

    // Return success
    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("password_changed", lang),
      data: null,
    });
  } catch (error) {
    console.error("Password change error:", {
      message: error.message,
      stack: error.stack,
    });

    // Handle specific errors
    if (error.message === "user_not_found") {
      return res.status(404).json({
        status: 404,
        success: false,
        message: getMessage("user_not_found", lang),
        data: null,
      });
    }

    if (error.message === "invalid_password") {
      return res.status(401).json({
        status: 401,
        success: false,
        message: getMessage("invalid_old_password", lang),
        data: null,
      });
    }

    if (error.message === "same_as_old") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("password_same_as_old", lang),
        data: null,
      });
    }

    if (error.message === "passwords_do_not_match") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("passwords_do_not_match", lang),
        data: null,
      });
    }

    // Generic error response
    res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("password_change_error", lang),
      data: null,
    });
  }
};

// 1. Request forgot password OTP
export const requestPasswordReset = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Set security headers
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");

    const { email } = req.validatedData;

    // Generate and send OTP
    await generatePasswordResetOTP(email);

    // Return success without revealing if user exists (security best practice)
    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("password_reset_code_sent_generic", lang),
      data: null,
    });
  } catch (error) {
    // We don't expose specific errors to prevent user enumeration
    console.error("Password reset request error:", error);

    // Always return success to prevent user enumeration
    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("password_reset_code_sent_generic", lang),
      data: null,
    });
  }
};

// 2. Verify OTP code
export const verifyResetCode = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Set security headers
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");

    const { email, code } = req.validatedData;

    // Verify the OTP
    await verifyPasswordResetOTP(email, code);

    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("verification_successful_set_password", lang),
      data: null,
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === "user_not_found") {
      return res.status(404).json({
        status: 404,
        success: false,
        message: getMessage("user_not_found", lang),
        data: null,
      });
    }

    if (error.message === "code_expired") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("code_expired", lang),
        data: null,
      });
    }

    if (error.message === "invalid_code") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("invalid_code", lang),
        data: null,
      });
    }

    if (error.message === "no_code_found") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("no_code_found", lang),
        data: null,
      });
    }

    // Log errors for debugging
    console.error("Reset code verification error:", error);

    // Generic error response
    return res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("verification_check_error", lang),
      data: null,
    });
  }
};

// 3. Set new password after OTP verification
export const setNewPassword = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Set security headers
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");

    const { email, code, newPassword } = req.validatedData;

    // Reset password with OTP
    await resetPasswordWithOTP(email, code, newPassword);

    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("password_reset_success", lang),
      data: null,
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === "user_not_found") {
      return res.status(404).json({
        status: 404,
        success: false,
        message: getMessage("user_not_found", lang),
        data: null,
      });
    }

    if (error.message === "code_expired") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("code_expired", lang),
        data: null,
      });
    }

    if (error.message === "invalid_code") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("invalid_code", lang),
        data: null,
      });
    }

    if (error.message === "no_code_found") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("no_code_found", lang),
        data: null,
      });
    }

    // Log errors for debugging
    console.error("Password reset error:", error);

    // Generic error response
    return res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("password_reset_error", lang),
      data: null,
    });
  }
};

// forgot password
