import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const clearCollections = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!\n");

    // Get the collections
    const db = mongoose.connection.db;

    // Clear Users collection
    console.log("Clearing Users collection...");
    const usersResult = await db.collection("users").deleteMany({});
    console.log(`Deleted ${usersResult.deletedCount} users\n`);

    // Clear Transactions collection
    console.log("Clearing Transactions collection...");
    const transactionsResult = await db.collection("transactions").deleteMany({});
    console.log(`Deleted ${transactionsResult.deletedCount} transactions\n`);

    console.log("========================================");
    console.log("Summary:");
    console.log(`- Users deleted: ${usersResult.deletedCount}`);
    console.log(`- Transactions deleted: ${transactionsResult.deletedCount}`);
    console.log("========================================");
    console.log("\nAll collections cleared successfully!");

  } catch (error) {
    console.error("Error clearing collections:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
clearCollections();
