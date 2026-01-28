import mongoose from "mongoose";
import dotenv from "dotenv";
import CourseSession from "../Modules/CourseSession.model.js";
import apiVideoService from "../Services/VideoService.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dr-diana")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

/**
 * Fix all video access issues:
 * 1. Enforce private settings for all session videos
 * 2. Verify token generation works for each video
 * 3. Update session metadata with latest video info
 */
async function fixAllVideoAccess() {
  try {
    console.log("Starting video access fix script...");

    // Get all sessions with videos
    const sessions = await CourseSession.find({ videoId: { $ne: null } });

    console.log(`Found ${sessions.length} sessions with videos to fix`);

    if (sessions.length === 0) {
      console.log("No sessions with videos found. Exiting.");
      process.exit(0);
    }

    // Process each session
    const results = {
      total: sessions.length,
      successful: 0,
      failed: 0,
      details: [],
    };

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      console.log(
        `\n[${i + 1}/${sessions.length}] Processing session: ${
          session._id
        }, video: ${session.videoId}`
      );

      try {
        // Use the enforcePrivateAccess method to ensure video is private and tokens work
        const videoDetails = await apiVideoService.enforcePrivateAccess(
          session.videoId
        );
        console.log(
          `Successfully enforced private access for video ${session.videoId}`
        );

        // Update session metadata with latest info
        const thumbnailUrl =
          videoDetails.assets?.thumbnail ||
          (videoDetails.assets?.player
            ? videoDetails.assets.player.replace("/player", "/thumbnail")
            : null);

        session.videoMetadata = {
          ...(session.videoMetadata || {}),
          title: videoDetails.title,
          description: videoDetails.description,
          public: false, // Explicitly set to false
          thumbnail: thumbnailUrl,
          duration: videoDetails.duration,
          updatedAt: new Date(),
        };

        await session.save();
        console.log(
          `Updated session ${session._id} with latest video metadata`
        );

        results.successful++;
        results.details.push({
          sessionId: session._id.toString(),
          videoId: session.videoId,
          success: true,
          message: "Video access fixed successfully",
        });
      } catch (error) {
        console.error(`Error fixing video ${session.videoId}:`, error.message);
        results.failed++;
        results.details.push({
          sessionId: session._id.toString(),
          videoId: session.videoId,
          success: false,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log("\n===== Summary =====");
    console.log(`Total sessions processed: ${results.total}`);
    console.log(`Successfully fixed: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);

    // Exit successfully
    console.log("Script completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running fix script:", error);
    process.exit(1);
  }
}

// Run the fix function
fixAllVideoAccess();
