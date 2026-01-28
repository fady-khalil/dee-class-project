import jwt from "jsonwebtoken";
import Admin from "../Modules/Admin.model.js";

export const AdminIdentifier = async (req, res, next) => {
  let token;

  console.log("AdminIdentifier middleware called");

  // Check for token in Authorization header first
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // Then check cookies as fallback
  else if (req.cookies && req.cookies["admin_authorization"]) {
    const cookieToken = req.cookies["admin_authorization"];
    if (cookieToken.startsWith("Bearer ")) {
      token = cookieToken.split(" ")[1];
    } else {
      token = cookieToken; // In case it's not prefixed
    }
  }

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Admin authentication token is required",
    });
  }

  try {
    console.log("Verifying token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Check if token is for admin
    if (!decoded.isAdmin) {
      console.log("Token is not for admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Not authorized as an admin",
      });
    }

    // Find admin by ID
    console.log("Looking up admin with ID:", decoded.adminId);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      console.log("Admin not found");
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Admin account not found",
      });
    }

    if (!admin.active) {
      console.log("Admin account not active");
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Admin account deactivated",
      });
    }

    // Attach admin data to request
    console.log("Admin authenticated:", admin.email, admin.role);
    req.admin = {
      ...decoded,
      permissions: admin.permissions,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

// Middleware to check specific permissions
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    // Super admin always has all permissions
    if (req.admin.role === "super_admin") {
      return next();
    }

    // Check specific permission
    if (
      req.admin.permissions &&
      req.admin.permissions[resource] &&
      req.admin.permissions[resource][action]
    ) {
      return next();
    }

    return res.status(403).json({
      status: 403,
      success: false,
      message: "You don't have permission to perform this action",
    });
  };
};
