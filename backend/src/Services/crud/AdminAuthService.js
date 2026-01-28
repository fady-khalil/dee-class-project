import Admin from "../../Modules/Admin.model.js";
import { comparePasswords } from "../../utils/hashing.js";
import jwt from "jsonwebtoken";

export const authenticateAdmin = async (credentials) => {
  const { email, password } = credentials;

  // Find admin with necessary fields
  const admin = await Admin.findOne({ email, active: true }).select(
    "+password +accountLocked +accountLockedUntil +failedLoginAttempts"
  );

  if (!admin) {
    throw new Error("invalid_credentials");
  }

  // Check account lock status
  if (admin.accountLocked) {
    if (admin.accountLockedUntil && admin.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (admin.accountLockedUntil - new Date()) / (60 * 1000)
      );
      throw new Error(`account_locked:${remainingTime}`);
    } else {
      // Reset lock if expired
      admin.accountLocked = false;
      admin.failedLoginAttempts = 0;
      await admin.save();
    }
  }

  // Verify password
  const isPasswordValid = await comparePasswords(password, admin.password);

  if (!isPasswordValid) {
    // Handle failed login
    admin.failedLoginAttempts += 1;

    if (admin.failedLoginAttempts >= 5) {
      admin.accountLocked = true;
      admin.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await admin.save();
      throw new Error("account_locked:30");
    }

    await admin.save();
    throw new Error("invalid_credentials");
  }

  // Reset failed attempts on success
  admin.failedLoginAttempts = 0;
  admin.lastLogin = new Date();
  await admin.save();

  // Generate token
  const token = jwt.sign(
    {
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      isAdmin: true, // Flag to identify admin tokens
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  // Return admin and token
  return {
    admin: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
    },
    token,
  };
};

export const createAdmin = async (adminData) => {
  const { email } = adminData;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Error("Admin already exists");
  }

  // Create new admin
  const newAdmin = new Admin(adminData);
  await newAdmin.save();

  return {
    _id: newAdmin._id,
    fullName: newAdmin.fullName,
    email: newAdmin.email,
    role: newAdmin.role,
    permissions: newAdmin.permissions,
    createdAt: newAdmin.createdAt,
  };
};
