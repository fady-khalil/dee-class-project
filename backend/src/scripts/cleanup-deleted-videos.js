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
 * Clean up CourseSession records that reference deleted videos on api.video
 * 1. Identify sessions with video IDs that no longer exist
 * 2. Update these sessions to remove or mark deleted video references
 */
async function cleanupDeletedVideos() {
  try {
    console.log("Starting video cleanup script...");

    // Get all sessions with videos
    const sessions = await CourseSession.find({ videoId: { $ne: null } });

    console.log(`Found ${sessions.length} sessions with video IDs to check`);

    if (sessions.length === 0) {
      console.log("No sessions with videos found. Exiting.");
      process.exit(0);
    }

    // Process each session
    const results = {
      total: sessions.length,
      deleted: 0,
      valid: 0,
      error: 0,
      details: [],
    };

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      console.log(
        `\n[${i + 1}/${sessions.length}] Checking session: ${
          session._id
        }, video: ${session.videoId}`
      );

      try {
        // Try to get video details from api.video
        let videoExists = true;
        try {
          await apiVideoService.getVideoDetails(session.videoId);
          console.log(`Video ${session.videoId} exists on api.video`);
        } catch (error) {
          if (error.code === 404) {
            videoExists = false;
            console.log(
              `Video ${session.videoId} no longer exists on api.video`
            );
          } else {
            throw error; // Re-throw if it's not a 404 error
          }
        }

        if (!videoExists) {
          // Update session to mark video as deleted
          console.log(`Updating session ${session._id} to mark deleted video`);

          // Save current video data for reference
          const deletedVideoData = {
            videoId: session.videoId,
            deletedAt: new Date(),
            originalMetadata: session.videoMetadata || null,
          };

          // Update the session
          session.deletedVideoData = deletedVideoData;
          session.videoId = null;
          session.videoMetadata = {
            ...session.videoMetadata,
            status: "deleted",
            deletedAt: new Date(),
          };

          await session.save();
          console.log(
            `Updated session ${session._id} to mark video as deleted`
          );

          results.deleted++;
          results.details.push({
            sessionId: session._id.toString(),
            videoId: deletedVideoData.videoId,
            status: "deleted",
            message: "Video reference cleaned up",
          });
        } else {
          // Video exists, just log and continue
          results.valid++;
          results.details.push({
            sessionId: session._id.toString(),
            videoId: session.videoId,
            status: "valid",
            message: "Video exists on api.video",
          });
        }
      } catch (error) {
        console.error(
          `Error checking video for session ${session._id}:`,
          error.message
        );
        results.error++;
        results.details.push({
          sessionId: session._id.toString(),
          videoId: session.videoId,
          status: "error",
          error: error.message,
        });
      }
    }

    // Print summary
    console.log("\n===== Summary =====");
    console.log(`Total sessions processed: ${results.total}`);
    console.log(`Videos still valid: ${results.valid}`);
    console.log(`Deleted videos cleaned up: ${results.deleted}`);
    console.log(`Errors encountered: ${results.error}`);

    // Exit successfully
    console.log("Cleanup script completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running cleanup script:", error);
    process.exit(1);
  }
}

// Run the cleanup function
cleanupDeletedVideos();
