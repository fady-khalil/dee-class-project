import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables
dotenv.config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Get all model files from the Modules directory
const getModelFiles = () => {
  const modulesPath = path.join(__dirname, "../Modules");
  const files = fs.readdirSync(modulesPath);
  return files
    .filter((file) => file.endsWith(".model.js"))
    .map((file) => file.replace(".model.js", ""));
};

// Function to import a model dynamically
const importModel = async (modelName) => {
  try {
    const modulePath = `../Modules/${modelName}.model.js`;
    const module = await import(modulePath);
    return module.default;
  } catch (error) {
    console.error(`Error importing model ${modelName}:`, error);
    return null;
  }
};

// Main function to reset collections
const resetCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://dr-diana:yw9s5fMb6a3801u4@dbaas-db-3677583-6aa4556f.mongo.ondigitalocean.com/admin"
    );
    console.log("Connected to MongoDB");

    // Get available models
    const availableModels = getModelFiles();
    console.log("\nAvailable collections to reset:");
    availableModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model}`);
    });

    // Ask user which collections to reset
    const answer = await prompt(
      "\nEnter collection numbers to reset (comma-separated) or 'all' for all collections: "
    );

    let collectionsToReset = [];

    if (answer.toLowerCase() === "all") {
      collectionsToReset = availableModels;
    } else {
      const selectedIndexes = answer
        .split(",")
        .map((num) => parseInt(num.trim()) - 1);
      collectionsToReset = selectedIndexes
        .map((index) => availableModels[index])
        .filter(Boolean);
    }

    if (collectionsToReset.length === 0) {
      console.log("No valid collections selected. Exiting.");
      process.exit(0);
    }

    // Confirm reset
    const confirmation = await prompt(
      `\nWARNING: You are about to reset the following collections:\n${collectionsToReset.join(
        ", "
      )}\n\nThis will DELETE ALL DATA in these collections. Are you sure? (yes/no): `
    );

    if (confirmation.toLowerCase() !== "yes") {
      console.log("Reset cancelled. Exiting.");
      process.exit(0);
    }

    // Reset each selected collection
    console.log("\nResetting collections...");

    for (const modelName of collectionsToReset) {
      try {
        const Model = await importModel(modelName);
        if (Model) {
          await Model.deleteMany({});
          console.log(`✅ Reset ${modelName} collection`);
        } else {
          console.log(`⚠️ Could not reset ${modelName}: Model not found`);
        }
      } catch (error) {
        console.error(`❌ Error resetting ${modelName}:`, error);
      }
    }

    console.log("\nDatabase reset completed successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close MongoDB connection and readline
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
};

// Run the function
console.log("=== Database Reset Tool ===");
resetCollections();
