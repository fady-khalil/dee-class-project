import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin, { ADMIN_ROLES } from "../Modules/Admin.model.js";
import { hashPassword } from "./hashing.js";
import readline from "readline";

// Load environment variables
dotenv.config();

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if any super admin already exists
    const existingSuperAdmin = await Admin.findOne({
      role: ADMIN_ROLES.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log("Super admin already exists!");
      process.exit(0);
    }

    console.log("\n=== Create Initial Super Admin ===\n");

    // Get admin details from user input
    const fullName = await prompt("Enter full name: ");
    const email = await prompt("Enter email: ");
    const password = await prompt("Enter password (min 8 characters): ");
    const phoneNumber = await prompt("Enter phone number (optional): ");

    if (!fullName || !email || !password) {
      console.error("Full name, email and password are required!");
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("Password must be at least 8 characters!");
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the super admin
    const superAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role: ADMIN_ROLES.SUPER_ADMIN,
      phoneNumber,
    });

    await superAdmin.save();

    console.log("\n=== Super Admin Created Successfully ===");
    console.log("Name:", fullName);
    console.log("Email:", email);
    console.log("Role: Super Admin");
    console.log(
      "\nYou can now log in to the admin dashboard with these credentials."
    );
  } catch (error) {
    console.error("Error creating super admin:", error);
  } finally {
    // Close readline interface
    rl.close();

    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the function
createSuperAdmin();
