import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Import models
import User from "../Modules/User.model.js";
import Transaction from "../Modules/Transaction.model.js";
import CourseLike from "../Modules/CourseLike.model.js";
import CourseComment from "../Modules/CourseComment.model.js";

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Reset options
const RESET_OPTIONS = {
  1: {
    name: "Delete ALL users",
    description: "Completely removes all user accounts, transactions, likes, and comments",
    action: async () => {
      const result = await User.deleteMany({});
      const transResult = await Transaction.deleteMany({});
      const likesResult = await CourseLike.deleteMany({});
      const commentsResult = await CourseComment.deleteMany({});
      return `Deleted ${result.deletedCount} users, ${transResult.deletedCount} transactions, ${likesResult.deletedCount} likes, ${commentsResult.deletedCount} comments`;
    },
  },
  2: {
    name: "Reset user data (keep accounts)",
    description:
      "Keeps user accounts but clears purchases, subscriptions, profiles, likes, comments, and watch history",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            purchasedItems: { courses: [] },
            subscription: {
              planId: null,
              status: null,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              profilesAllowed: 0,
              canDownload: false,
              cancelAtPeriodEnd: false,
            },
            profiles: [],
            watchingHistory: [],
            verified: false,
            failedLoginAttempts: 0,
            accountLocked: false,
            accountLockedUntil: null,
          },
          $unset: {
            verificationCode: "",
            verificationCodeValidation: "",
            forgotPasswordCode: "",
            forgotPasswordCodeValidation: "",
          },
        }
      );
      await Transaction.deleteMany({});
      const likesResult = await CourseLike.deleteMany({});
      const commentsResult = await CourseComment.deleteMany({});
      return `Reset data for ${result.modifiedCount} users, deleted ${likesResult.deletedCount} likes, ${commentsResult.deletedCount} comments`;
    },
  },
  3: {
    name: "Reset subscriptions only",
    description: "Clears all subscription data but keeps purchases and profiles",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            subscription: {
              planId: null,
              status: null,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              profilesAllowed: 0,
              canDownload: false,
              cancelAtPeriodEnd: false,
            },
          },
        }
      );
      return `Reset subscriptions for ${result.modifiedCount} users`;
    },
  },
  4: {
    name: "Reset profiles only",
    description: "Clears all user profiles, likes, and comments (profile-related data)",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            profiles: [],
          },
        }
      );
      const likesResult = await CourseLike.deleteMany({});
      const commentsResult = await CourseComment.deleteMany({});
      return `Reset profiles for ${result.modifiedCount} users, deleted ${likesResult.deletedCount} likes, ${commentsResult.deletedCount} comments`;
    },
  },
  5: {
    name: "Reset purchased items only",
    description: "Clears all purchased courses",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            purchasedItems: { courses: [] },
          },
        }
      );
      await Transaction.deleteMany({});
      return `Reset purchased items for ${result.modifiedCount} users`;
    },
  },
  6: {
    name: "Reset watch history only",
    description: "Clears all watching history (continue watching)",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            watchingHistory: [],
            "profiles.$[].watchingHistory": [],
            "profiles.$[].completedVideos": [],
            "profiles.$[].completedCourses": [],
          },
        }
      );
      return `Reset watch history for ${result.modifiedCount} users`;
    },
  },
  7: {
    name: "Reset verification status",
    description: "Marks all users as unverified",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            verified: false,
          },
          $unset: {
            verificationCode: "",
            verificationCodeValidation: "",
          },
        }
      );
      return `Reset verification for ${result.modifiedCount} users`;
    },
  },
  8: {
    name: "Unlock all accounts",
    description: "Unlocks all locked accounts and resets failed login attempts",
    action: async () => {
      const result = await User.updateMany(
        {},
        {
          $set: {
            failedLoginAttempts: 0,
            accountLocked: false,
            accountLockedUntil: null,
          },
        }
      );
      return `Unlocked ${result.modifiedCount} user accounts`;
    },
  },
};

// Main function
const resetUsers = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Get current user count
    const userCount = await User.countDocuments();
    console.log(`Current users in database: ${userCount}\n`);

    if (userCount === 0) {
      console.log("No users found in the database.");
      process.exit(0);
    }

    // Display options
    console.log("=== Reset Options ===\n");
    Object.entries(RESET_OPTIONS).forEach(([key, option]) => {
      console.log(`${key}. ${option.name}`);
      console.log(`   ${option.description}\n`);
    });

    // Get user selection
    const selection = await prompt("Enter option number (or 'q' to quit): ");

    if (selection.toLowerCase() === "q") {
      console.log("Exiting...");
      process.exit(0);
    }

    const option = RESET_OPTIONS[selection];

    if (!option) {
      console.log("Invalid option selected. Exiting.");
      process.exit(1);
    }

    // Confirm action
    console.log(`\nYou selected: ${option.name}`);
    console.log(`Description: ${option.description}\n`);

    const confirmation = await prompt(
      "WARNING: This action cannot be undone. Type 'CONFIRM' to proceed: "
    );

    if (confirmation !== "CONFIRM") {
      console.log("Action cancelled. Exiting.");
      process.exit(0);
    }

    // Execute the action
    console.log("\nExecuting...");
    const result = await option.action();
    console.log(`\n${result}`);
    console.log("\nOperation completed successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
};

// Run the script
console.log("\n=== User Reset Tool ===\n");
resetUsers();
