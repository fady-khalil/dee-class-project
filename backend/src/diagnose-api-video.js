import ApiVideoClient from "@api.video/nodejs-client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function diagnoseApiVideo() {
  console.log("=".repeat(50));
  console.log("API.VIDEO CONNECTION DIAGNOSTIC TOOL");
  console.log("=".repeat(50));

  // Check API key
  const apiKey =
    process.env.API_VIDEO_KEY || "NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw";
  console.log(
    `Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(
      apiKey.length - 5
    )}`
  );

  try {
    // Step 1: Initialize the client
    console.log("\n1. Initializing api.video client...");
    const client = new ApiVideoClient({ apiKey });
    console.log("✓ Client initialized successfully");

    // Step 2: Test creating a video
    console.log("\n2. Testing video creation...");
    const videoData = {
      title: "Diagnostic Test Video",
      description: "Test video for api.video diagnostic tool",
      public: true,
    };

    // Try to create a test video
    const video = await client.videos.create(videoData);
    console.log(`✓ Test video created with ID: ${video.videoId}`);
    console.log(`Video title: ${video.title}`);
    console.log(`Public: ${video.public}`);

    // Step 3: Get the created video
    console.log("\n3. Testing video retrieval...");
    const retrievedVideo = await client.videos.get(video.videoId);
    console.log(`✓ Video retrieved successfully: ${retrievedVideo.videoId}`);

    // Step 4: Test token generation if available
    console.log("\n4. Testing token generation...");
    try {
      // Check if we have the tokens API available
      if (
        client.tokens &&
        typeof client.tokens.generatePlaybackToken === "function"
      ) {
        const token = await client.tokens.generatePlaybackToken(video.videoId, {
          ttl: 3600,
        });
        console.log(
          `✓ Token generated successfully: ${token.substring(0, 10)}...`
        );
      } else if (
        client.privateTokens &&
        typeof client.privateTokens.generate === "function"
      ) {
        const tokenResponse = await client.privateTokens.generate(
          video.videoId,
          { ttl: 3600 }
        );
        const token = tokenResponse.token || tokenResponse;
        console.log(
          `✓ Token generated successfully (using fallback method): ${token.substring(
            0,
            10
          )}...`
        );
      } else {
        console.log("⚠ Token generation not supported in this SDK version");
      }
    } catch (tokenError) {
      console.error(`⚠ Error generating token: ${tokenError.message}`);
    }

    // Step 5: Clean up by deleting the test video
    console.log("\n5. Cleaning up by deleting test video...");
    await client.videos.delete(video.videoId);
    console.log(`✓ Test video deleted successfully`);

    // Conclusion
    console.log("\n=".repeat(50));
    console.log("DIAGNOSTIC RESULTS: SUCCESS");
    console.log("The api.video service is connected and working properly");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n=".repeat(50));
    console.error("DIAGNOSTIC RESULTS: FAILURE");
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    console.error("=".repeat(50));

    // Give troubleshooting advice
    console.log("\nTROUBLESHOOTING SUGGESTIONS:");
    console.log("1. Verify your API key is correct in the .env file");
    console.log("2. Check your internet connection");
    console.log(
      "3. Ensure api.video service is not down (check status.api.video)"
    );
    console.log("4. Update @api.video/nodejs-client to the latest version");
    console.log("5. If using a proxy, check proxy settings");
  }
}

// Run the diagnostic tool
diagnoseApiVideo().catch(console.error);
