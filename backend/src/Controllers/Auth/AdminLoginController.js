import { authenticateAdmin } from "../../Services/crud/AdminAuthService.js";

export const adminLogin = async (req, res) => {
  try {
    // Authenticate admin
    const { admin, token } = await authenticateAdmin(req.body);
console.log(admin, token);
    // Calculate cookie expiration
    const expirationTime = 12 * 60 * 60 * 1000; // 12 hours

    // Set cookie and return response
    res
      .cookie("admin_authorization", `Bearer ${token}`, {
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
        message: "Admin logged in successfully",
        data: {
          token: token,
          admin: admin,
        },
      });
  } catch (error) {
    // Handle specific errors
    if (error.message === "invalid_credentials") {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    if (error.message.startsWith("account_locked")) {
      const minutes = error.message.split(":")[1];
      return res.status(401).json({
        status: 401,
        success: false,
        message: `Account locked due to too many failed login attempts. Please try again in ${minutes} minutes.`,
        data: null,
      });
    }

    // Log errors for debugging
    console.error("Admin login error:", error);

    // Generic error response
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred during admin login",
      data: null,
    });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("admin_authorization").status(200).json({
      status: 200,
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred during admin logout",
      data: null,
    });
  }
};

export const verifyAdminToken = async (req, res) => {
  try {
    // If the middleware passes, the token is valid and req.admin contains the data
    res.status(200).json({
      status: 200,
      success: true,
      message: "Token is valid",
      data: {
        admin: {
          _id: req.admin.adminId,
          email: req.admin.email,
          role: req.admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      status: 401,
      success: false,
      message: "Invalid token",
    });
  }
};
