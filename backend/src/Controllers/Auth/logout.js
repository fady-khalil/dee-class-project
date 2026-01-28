import { getMessage } from "../../utils/authMessages.js";

export const logout = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Check if user is logged in
    if (!req.cookies.authorization && !req.headers.authorization) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: getMessage("already_logged_out", lang),
        data: null,
      });
    }

    // Clear authorization cookie
    res.clearCookie("authorization", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });

    // No token blacklisting for simplicity
    // In production, you might want to blacklist tokens

    // Return success response
    return res.status(200).json({
      status: 200,
      success: true,
      message: getMessage("logout_success", lang),
      data: null,
    });
  } catch (error) {
    // Log error but still attempt to clear cookie
    console.error("Logout error:", error);

    // Clear cookie even if an error occurs
    res.clearCookie("authorization", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });

    return res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("logout_error", lang),
      data: null,
    });
  }
};
