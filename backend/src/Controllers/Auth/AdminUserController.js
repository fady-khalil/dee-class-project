import Admin from "../../Modules/Admin.model.js";
import { hashPassword } from "../../utils/hashing.js";
import { getUsers } from "../../Services/crud/UserService.js";
import User from "../../Modules/User.model.js";
import Transaction from "../../Modules/Transaction.model.js";
import GiftCode from "../../Modules/GiftCode.model.js";

// Get all admin users
export const getAdmins = async (req, res) => {
  try {
    console.log("getAdmins called by admin:", req.admin);

    // Only super admin can view admin list
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access admin list",
      });
    }

    const admins = await Admin.find()
      .select(
        "-password -failedLoginAttempts -accountLocked -accountLockedUntil"
      )
      .sort("-createdAt");
    console.log(`Found ${admins.length} admin users`);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin users retrieved successfully",
      data: admins,
    });
  } catch (error) {
    console.error("Error getting admin users:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving admin users",
    });
  }
};

// Get single admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `Getting admin with ID: ${id}, requested by: ${req.admin.email}`
    );

    // Only super admin can view admin details
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access admin details",
      });
    }

    const admin = await Admin.findById(id).select(
      "-password -failedLoginAttempts -accountLocked -accountLockedUntil"
    );

    if (!admin) {
      console.log(`Admin not found with ID: ${id}`);
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    console.log(`Admin found: ${admin.email}`);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error getting admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving admin user",
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Only super admin can create admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can create admin users",
      });
    }

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        status: 409,
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const hashedPassword = await hashPassword(password);
    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    await newAdmin.save();

    // Return admin without sensitive data
    const adminResponse = {
      _id: newAdmin._id,
      fullName: newAdmin.fullName,
      email: newAdmin.email,
      role: newAdmin.role,
      phoneNumber: newAdmin.phoneNumber,
      createdAt: newAdmin.createdAt,
    };

    res.status(201).json({
      status: 201,
      success: true,
      message: "Admin user created successfully",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating admin user",
    });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Only super admin can update admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can update admin users",
      });
    }

    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    // Check email uniqueness if changing
    if (email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(409).json({
          status: 409,
          success: false,
          message: "Another admin with this email already exists",
        });
      }
    }

    // Update fields
    admin.fullName = fullName;
    admin.email = email;
    admin.role = role;
    admin.phoneNumber = phoneNumber;

    // Update password if provided
    if (password) {
      admin.password = await hashPassword(password);
    }

    await admin.save();

    // Return updated admin without sensitive data
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      phoneNumber: admin.phoneNumber,
      updatedAt: admin.updatedAt,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user updated successfully",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating admin user",
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Only super admin can delete admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can delete admin users",
      });
    }

    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    // Prevent deletion of super admin
    if (admin.role === "super_admin") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Super admin users cannot be deleted",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting admin user",
    });
  }
};

// Get all regular users (not admins)
export const getAllUsers = async (req, res) => {
  try {
    console.log("getAllUsers called by admin:", req.admin);

    // Only super admin can view user list
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access user list",
      });
    }

    // Extract query parameters
    const {
      page,
      limit,
      search,
      isVerified,
      isPaid,
      hasItems,
      sortBy,
      sortOrder,
    } = req.query;

    // Parse boolean parameters
    const parsedOptions = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      sortBy: sortBy || "fullName",
      sortOrder: sortOrder || "asc",
    };

    // Only add boolean filters if they're explicitly set
    if (isVerified !== undefined) {
      parsedOptions.isVerified = isVerified === "true";
    }

    if (isPaid !== undefined) {
      parsedOptions.isPaid = isPaid === "true";
    }

    if (hasItems !== undefined) {
      parsedOptions.hasItems = hasItems === "true";
    }

    // Get users from service
    const { users, pagination } = await getUsers(parsedOptions);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving users",
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `Getting user with ID: ${id}, requested by: ${req.admin.email}`
    );

    // Only super admin can view user details
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access user details",
      });
    }

    // Fetch user with populated purchasedItems and subscription plan
    const user = await User.findById(id)
      .select(
        "-password -failedLoginAttempts -accountLocked -accountLockedUntil -verificationCode -verificationCodeValidation -forgotPasswordCode -forgotPasswordCodeValidation"
      )
      .populate({
        path: "purchasedItems.courses",
        select: "title thumbnail price",
      })
      .populate({
        path: "subscription.planId",
        select: "title title_ar monthlyPrice yearlyPrice currency profilesAllowed canDownload",
      });

    if (!user) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    console.log(`User found: ${user.email}`);

    // Fetch gifts purchased by this user (gifts they paid for)
    const giftsPurchased = await GiftCode.find({ purchasedBy: id })
      .populate({
        path: "planId",
        select: "title title_ar monthlyPrice yearlyPrice currency",
      })
      .populate({
        path: "redeemedBy",
        select: "fullName email",
      })
      .sort("-createdAt");

    // Fetch gifts received by this user (gifts they redeemed)
    const giftsReceived = await GiftCode.find({ redeemedBy: id })
      .populate({
        path: "planId",
        select: "title title_ar monthlyPrice yearlyPrice currency",
      })
      .populate({
        path: "purchasedBy",
        select: "fullName email",
      })
      .sort("-redeemedAt");

    // Convert user to object and add gift data
    const userData = user.toObject();
    userData.giftsPurchased = giftsPurchased;
    userData.giftsReceived = giftsReceived;

    res.status(200).json({
      status: 200,
      success: true,
      message: "User retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving user",
    });
  }
};

// Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify super admin permission
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can view user transactions",
      });
    }

    // Find transactions for this user
    const transactions = await Transaction.find({ user: userId }).sort(
      "-createdAt"
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "User transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error getting user transactions:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving user transactions",
    });
  }
};

