import { createAdmin } from "../../Services/crud/AdminAuthService.js";
import { hashPassword } from "../../utils/hashing.js";

export const createNewAdmin = async (req, res) => {
  try {
    // Only super_admin can create new admins
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can create new admin accounts",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(req.body.password);

    // Create admin
    const adminData = {
      ...req.body,
      password: hashedPassword,
    };

    const newAdmin = await createAdmin(adminData);

    res.status(201).json({
      status: 201,
      success: true,
      message: "Admin account created successfully",
      data: newAdmin,
    });
  } catch (error) {
    if (error.message === "Admin already exists") {
      return res.status(409).json({
        status: 409,
        success: false,
        message: "Admin with this email already exists",
        data: null,
      });
    }

    console.error("Create admin error:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating admin account",
      data: null,
    });
  }
};
