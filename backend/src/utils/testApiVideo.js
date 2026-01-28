// Test script for api.video integration
import ApiVideoClient from "@api.video/nodejs-client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Initialize with API key
const apiKey =
  process.env.API_VIDEO_KEY || "NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw";
console.log("Using API key:", apiKey);
const apiClient = new ApiVideoClient({ apiKey });

async function testApiVideo() {
  console.log("Testing api.video connection...");

  try {
    // List videos as a simple test
    const videos = await apiClient.videos.list();
    console.log("Connection successful!");
    console.log(`Found ${videos.data.length} videos in your account.`);
    console.log("First few videos:");
    videos.data.slice(0, 3).forEach((video) => {
      console.log(`- ${video.title} (ID: ${video.videoId})`);
    });

    // Test creating and uploading a video
    try {
      console.log("\nTesting video creation and upload...");

      // 1. Create a video
      const videoData = {
        title: "Test Video " + new Date().toISOString(),
        description: "This is a test video upload",
        public: true,
      };

      console.log("Creating video with data:", videoData);
      const videoObject = await apiClient.videos.create(videoData);
      console.log("Video created successfully with ID:", videoObject.videoId);

      // Check if we have a sample video file to test with
      const sampleVideoPath = path.join(process.cwd(), "sample.mp4");

      if (fs.existsSync(sampleVideoPath)) {
        // 2. Upload the video
        console.log("Uploading sample video from:", sampleVideoPath);
        const videoStats = fs.statSync(sampleVideoPath);
        console.log("File size:", videoStats.size, "bytes");

        const uploadResponse = await apiClient.videos.upload(
          videoObject.videoId,
          sampleVideoPath
        );
        console.log("Video uploaded successfully!");
        console.log("Video details:", uploadResponse);
      } else {
        console.log("No sample video file found at:", sampleVideoPath);
        console.log("Creating a sample text file to test upload failure...");

        // Create a sample text file as video
        const sampleTextPath = path.join(process.cwd(), "sample.txt");
        fs.writeFileSync(sampleTextPath, "This is not a video file");

        try {
          console.log(
            "Attempting to upload text file as video (this should fail)"
          );
          await apiClient.videos.upload(videoObject.videoId, sampleTextPath);
        } catch (uploadError) {
          console.log("Upload failed as expected:", uploadError.message);
        }

        // Clean up
        fs.unlinkSync(sampleTextPath);
      }
    } catch (videoError) {
      console.error("Error in video creation/upload test:", videoError);
    }

    return true;
  } catch (error) {
    console.error("Error connecting to api.video:");
    console.error(error);
    return false;
  }
}

// Run the test
testApiVideo()
  .then((success) => {
    if (success) {
      console.log("Test completed successfully.");
    } else {
      console.log("Test failed.");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
