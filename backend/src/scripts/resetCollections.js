import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Reset specific collections in the database
 * @param {string[]} collectionNames - Array of collection names to reset (without .model.js extension)
 * @returns {Promise<Object>} - Results of the reset operation
 */
const resetCollections = async (collectionNames = []) => {
  const results = {
    success: true,
    resetCollections: [],
    failedCollections: [],
    errors: [],
  };

  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://dr-diana:yw9s5fMb6a3801u4@dbaas-db-3677583-6aa4556f.mongo.ondigitalocean.com/admin"
    );
    console.log("Connected to MongoDB");

    if (!collectionNames || collectionNames.length === 0) {
      console.log("No collections specified to reset.");
      results.success = false;
      results.errors.push("No collections specified");
      return results;
    }

    // Reset each specified collection
    for (const modelName of collectionNames) {
      try {
        const Model = await importModel(modelName);
        if (Model) {
          await Model.deleteMany({});
          console.log(`✅ Reset ${modelName} collection`);
          results.resetCollections.push(modelName);
        } else {
          console.log(`⚠️ Could not reset ${modelName}: Model not found`);
          results.failedCollections.push(modelName);
          results.errors.push(`Model ${modelName} not found`);
        }
      } catch (error) {
        console.error(`❌ Error resetting ${modelName}:`, error);
        results.failedCollections.push(modelName);
        results.errors.push(`Error with ${modelName}: ${error.message}`);
      }
    }

    if (results.failedCollections.length > 0) {
      results.success = false;
    }

    return results;
  } catch (error) {
    console.error("Error:", error);
    results.success = false;
    results.errors.push(`General error: ${error.message}`);
    return results;
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
  }
};

// If this script is run directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const collectionsToReset = process.argv.slice(2);

  if (collectionsToReset.length === 0) {
    console.log(
      "Usage: node resetCollections.js [collection1] [collection2] ..."
    );
    console.log("Example: node resetCollections.js Book Product CourseSession");
    process.exit(1);
  }

  console.log("=== Database Reset Tool ===");
  console.log(`Collections to reset: ${collectionsToReset.join(", ")}`);

  resetCollections(collectionsToReset)
    .then((results) => {
      console.log("\n=== Reset Results ===");
      console.log(`Overall success: ${results.success ? "Yes" : "No"}`);
      console.log(
        `Reset collections: ${results.resetCollections.join(", ") || "None"}`
      );
      console.log(
        `Failed collections: ${results.failedCollections.join(", ") || "None"}`
      );

      if (results.errors.length > 0) {
        console.log("\nErrors:");
        results.errors.forEach((err) => console.log(`- ${err}`));
      }

      process.exit(results.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Failed to reset collections:", err);
      process.exit(1);
    });
}

// Export the function for use as a module
export default resetCollections;
