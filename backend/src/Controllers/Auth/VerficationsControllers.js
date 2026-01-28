import {
  generateAndSendVerificationCode,
  verifyEmailCode,
} from "../../Services/crud/VerificationService.js";
import { getMessage } from "../../utils/authMessages.js";

export const sendVerificationEmail = async (req, res) => {
  const lang = req.language || "en";

  try {
    const { email } = req.body;

    await generateAndSendVerificationCode(email);

    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("verification_code_sent", lang),
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

    if (error.message === "already_verified") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("already_verified", lang),
        data: null,
      });
    }

    if (error.message === "email_send_failed") {
      return res.status(500).json({
        status: 500,
        success: false,
        message: getMessage("email_send_failed", lang),
        data: null,
      });
    }

    // Log the error
    console.error("Verification email error:", error);

    // Generic error response
    return res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("verification_error", lang),
      data: null,
    });
  }
};

export const verifyVerificationCode = async (req, res) => {
  const lang = req.language || "en";

  try {
    const { email, code } = req.validatedData;

    await verifyEmailCode(email, code);

    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("email_verified", lang),
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

    if (error.message === "already_verified") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("already_verified", lang),
        data: null,
      });
    }

    if (error.message === "code_not_found") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: getMessage("code_not_found", lang),
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

    // Log the error
    console.error("Verification code error:", error);

    // Generic error response
    return res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("verification_check_error", lang),
      data: null,
    });
  }
};
