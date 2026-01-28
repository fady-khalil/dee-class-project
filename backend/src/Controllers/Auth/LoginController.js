import { authenticateUser } from "../../Services/crud/AuthService.js";
import { getMessage } from "../../utils/authMessages.js";

export const login = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Authenticate user (validation already done in middleware)
    const { user, token } = await authenticateUser(req.validatedData);

    // Calculate cookie expiration
    const expirationTime = 12 * 60 * 60 * 1000; // 12 hours

    // Set cookie and return response
    res
      .cookie("authorization", `Bearer ${token}`, {
        httpOnly: true,
        expires: new Date(Date.now() + expirationTime),
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: expirationTime,
      })
      .status(200)
      .json({
        status: 200,
        success: true,
        message: getMessage("login_success", lang),
        data: {
          token: token,
          user: user,
        },
      });
  } catch (error) {
    // Handle specific errors
    if (error.message === "invalid_credentials") {
      return res.status(401).json({
        status: 401,
        success: false,
        message: getMessage("invalid_credentials", lang),
        data: null,
      });
    }

    if (error.message.startsWith("account_locked")) {
      const minutes = error.message.split(":")[1];
      return res.status(401).json({
        status: 401,
        success: false,
        message: getMessage("account_locked", lang, { minutes }),
        data: null,
      });
    }

    // Log errors for debugging
    console.error("Login error:", error);

    // Generic error response
    res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("login_error", lang),
      data: null,
    });
  }
};
