import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin, { ADMIN_ROLES } from "../Modules/Admin.model.js";
import { hashPassword } from "../utils/hashing.js";

// Load environment variables
dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const fullName = "D Class";
    const email = "admin@d_class.com";
    const password = "admin@123";

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin with this email already exists!");
      console.log("Updating to super admin role...");

      // Update existing admin to super admin
      existingAdmin.role = ADMIN_ROLES.SUPER_ADMIN;
      existingAdmin.fullName = fullName;
      existingAdmin.password = await hashPassword(password);
      existingAdmin.active = true;
      await existingAdmin.save();

      console.log("\n=== Admin Updated to Super Admin ===");
    } else {
      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the super admin
      const superAdmin = new Admin({
        fullName,
        email,
        password: hashedPassword,
        role: ADMIN_ROLES.SUPER_ADMIN,
      });

      await superAdmin.save();
      console.log("\n=== Super Admin Created Successfully ===");
    }

    console.log("Name:", fullName);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role: Super Admin");
    console.log("\nYou can now log in to the admin dashboard with these credentials.");

  } catch (error) {
    console.error("Error creating super admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdmin();
