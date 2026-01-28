import ApiVideoClient from "@api.video/nodejs-client";
import fs from "fs";
import path from "path";

class VideoService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize the client lazily (when first needed)
   * @private
   */
  _initClient() {
    if (this.initialized) return;

    this.apiKey = process.env.API_VIDEO_KEY;
    if (!this.apiKey) {
      throw new Error("API_VIDEO_KEY environment variable is not set");
    }
    console.log(
      "Initializing api.video client with key:",
      this.apiKey.substring(0, 5) + "..."
    );
    this.client = new ApiVideoClient({ apiKey: this.apiKey });
    this.initialized = true;
    console.log("api.video client initialized successfully");
  }

  /**
   * Check if client is initialized
   * @private
   */
  _checkClient() {
    this._initClient();
    if (!this.client) {
      throw new Error("VideoService: API client not initialized");
    }
  }

  /**
   * Create a video object in api.video
   * @param {Object} videoData - Video metadata including title, description
   * @returns {Promise<Object>} - The complete api.video response
   */
  async createVideo(videoData) {
    try {
      this._checkClient();
      console.log("VideoService: Creating video with data:", videoData);
      const videoCreationPayload = {
        title: videoData.title || "Course Trailer",
        description: videoData.description || "Course trailer video",
        public: true,
      };

      // Return the complete response object
      const response = await this.client.videos.create(videoCreationPayload);
      console.log(
        "VideoService: Video created successfully with ID:",
        response.videoId
      );
      return response;
    } catch (error) {
      console.error("VideoService: Error creating video in api.video:", error);
      console.error("Error details:", error.message);
      throw error;
    }
  }

  /**
   * Create a public video object in api.video
   * @param {String} title - Video title
   * @param {String} description - Video description
   * @returns {Promise<Object>} - The complete api.video response
   */
  async createPublicVideo(title, description) {
    return this.createVideo({
      title,
      description,
      public: true,
    });
  }

  /**
   * Create a private video object in api.video
   * @param {String} title - Video title
   * @param {String} description - Video description
   * @returns {Promise<Object>} - The complete api.video response
   */
  async createPrivateVideo(title, description) {
    try {
      this._checkClient();
      console.log("VideoService: Creating private video");
      const videoCreationPayload = {
        title: title || "Untitled Video",
        description: description || "No description",
        public: false,
      };

      // Return the complete response object
      const response = await this.client.videos.create(videoCreationPayload);
      console.log(
        "VideoService: Private video created successfully with ID:",
        response.videoId
      );
      return response;
    } catch (error) {
      console.error("VideoService: Error creating private video:", error);
      console.error("Error details:", error.message);
      throw error;
    }
  }

  /**
   * Create a delegated upload token for direct uploads from the frontend
   * @param {String} title - Optional title for the video
   * @param {Boolean} isPublic - Whether the video should be public
   * @returns {Promise<Object>} - The token and upload data
   */
  async createDelegatedUploadToken(title = "Uploaded Video", isPublic = true) {
    try {
      this._checkClient();
      console.log("VideoService: Creating delegated upload token");

      const tokenData = {
        ttl: 3600, // Token valid for 1 hour
      };

      // Create the token
      const tokenResponse = await this.client.uploadTokens.createToken(
        tokenData
      );
      console.log("VideoService: Delegated upload token created successfully");

      return {
        token: tokenResponse.token,
        ttl: tokenResponse.ttl,
      };
    } catch (error) {
      console.error(
        "VideoService: Error creating delegated upload token:",
        error
      );
      console.error("Error details:", error.message);
      throw error;
    }
  }

  /**
   * Generate a token for accessing private videos
   * @param {String} videoId - The video ID
   * @param {Number} ttl - Time to live in seconds (default 15 minutes)
   * @returns {Promise<String>} - The access token
   */
  async generateVideoAccessToken(videoId, ttl = 900) {
    try {
      this._checkClient();
      console.log(`VideoService: Generating access token for video ${videoId}`);

      // Create a token valid for the specified time (15 minutes by default)
      const token = await this.client.tokens.generatePlaybackToken(videoId, {
        ttl,
      });

      console.log("VideoService: Access token generated successfully");
      return token;
    } catch (error) {
      console.error(`VideoService: Error generating access token:`, error);
      throw error;
    }
  }

  /**
   * Get video details with access token for private videos
   * @param {String} videoId - The video ID
   * @returns {Promise<Object>} - Video details with access token
   */
  async getVideoDetailsWithToken(videoId) {
    try {
      this._checkClient();
      console.log(
        `VideoService: Getting details with token for video ID ${videoId}`
      );

      // Get the basic video details
      const videoDetails = await this.getVideoDetails(videoId);

      // Generate an access token
      const token = await this.generateVideoAccessToken(videoId);

      // Return the video details with the token
      return {
        ...videoDetails,
        accessToken: token,
        securePlaybackUrls: {
          hls: `${videoDetails.assets.hls}?token=${token}`,
          mp4: `${videoDetails.assets.mp4}?token=${token}`,
          player: `${videoDetails.assets.player}?token=${token}`,
        },
      };
    } catch (error) {
      console.error(
        `VideoService: Error getting video details with token:`,
        error
      );
      throw error;
    }
  }

  /**
   * Filter sensitive data from video details for public/non-purchased viewing
   * @param {Object} videoDetails - Full video details from api.video
   * @returns {Object} - Filtered video details with only non-sensitive info
   */
  filterVideoDetails(videoDetails) {
    // Extract only the fields we want to expose publicly
    const {
      videoId,
      title,
      description,
      public: isPublic,
      panoramic,
      mp4Support,
      publishedAt,
      createdAt,
      updatedAt,
      tags,
      duration,
    } = videoDetails;

    // Include only the thumbnail from assets
    const assets = {
      thumbnail: videoDetails.assets?.thumbnail || null,
    };

    return {
      videoId,
      title,
      description,
      public: isPublic,
      panoramic,
      mp4Support,
      publishedAt,
      createdAt,
      updatedAt,
      tags,
      duration,
      assets,
    };
  }

  /**
   * Get video details from api.video by ID
   * @param {String} videoId - The video ID
   * @returns {Promise<Object>} - Video details
   */
  async getVideoDetails(videoId) {
    try {
      this._checkClient();
      console.log(`VideoService: Getting details for video ID ${videoId}`);
      const video = await this.client.videos.get(videoId);
      return video;
    } catch (error) {
      console.error(`VideoService: Error getting video details:`, error);
      throw error;
    }
  }

  /**
   * Upload a video file to api.video
   * @param {String} videoId - The video ID from api.video
   * @param {Buffer|ReadStream|String} videoFile - The video file to upload
   * @returns {Promise<Object>} - The complete api.video response after upload
   */
  async uploadVideo(videoId, videoFile) {
    try {
      this._checkClient();
      console.log(`VideoService: Uploading video file to ID ${videoId}`);
      console.log("VideoFile path:", videoFile);

      // Check if file exists and convert to absolute path if needed
      if (typeof videoFile === "string") {
        const absolutePath = path.isAbsolute(videoFile)
          ? videoFile
          : path.resolve(process.cwd(), videoFile);

        console.log("Absolute path:", absolutePath);

        if (!fs.existsSync(absolutePath)) {
          throw new Error(`Video file not found at path: ${absolutePath}`);
        }

        const stats = fs.statSync(absolutePath);
        console.log("VideoService: File exists at path, size:", stats.size);

        if (stats.size === 0) {
          throw new Error("Video file is empty (0 bytes)");
        }

        // Create a read stream for the file
        const fileStream = fs.createReadStream(absolutePath);

        // Return the complete response object using the file stream
        const response = await this.client.videos.upload(videoId, fileStream);
        console.log("VideoService: Video uploaded successfully");
        return response;
      } else {
        // Handle Buffer or ReadStream directly
        const response = await this.client.videos.upload(videoId, videoFile);
        console.log("VideoService: Video uploaded successfully");
        return response;
      }
    } catch (error) {
      console.error(`VideoService: Error uploading video to api.video:`, error);
      console.error("Error details:", error.message);
      throw error;
    }
  }

  /**
   * Get video details from api.video
   * @param {String} videoId - The video ID from api.video
   * @returns {Promise<Object>} - The complete api.video response
   */
  async getVideo(videoId) {
    try {
      this._checkClient();
      console.log(`VideoService: Getting video details for ID ${videoId}`);
      // Return the complete response object
      const response = await this.client.videos.get(videoId);
      console.log("VideoService: Video details retrieved successfully");
      return response;
    } catch (error) {
      console.error(`VideoService: Error getting video from api.video:`, error);
      throw error;
    }
  }

  /**
   * Disable MP4 progressive download support for a video
   * @param {String} videoId - The video ID to update
   * @returns {Promise<Object>} - The updated video object
   */
  async disableMp4Support(videoId) {
    try {
      this._checkClient();
      console.log(`VideoService: Disabling mp4Support for video ${videoId}`);

      const updated = await this.client.videos.update(videoId, {
        mp4Support: false,
      });

      console.log(
        `VideoService: mp4Support disabled for video ${videoId}:`,
        updated.mp4Support
      );
      return updated;
    } catch (error) {
      console.error(
        `VideoService: Error disabling mp4Support for video ${videoId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a video from api.video
   * @param {String} videoId - The video ID to delete
   * @returns {Promise<void>}
   */
  async deleteVideo(videoId) {
    try {
      this._checkClient();
      console.log(`VideoService: Deleting video with ID ${videoId}`);
      await this.client.videos.delete(videoId);
      console.log("VideoService: Video deleted successfully");
    } catch (error) {
      console.error(
        `VideoService: Error deleting video from api.video:`,
        error
      );
      throw error;
    }
  }

  /**
   * Enforce that a video is public
   * @param {String} videoId - The video ID to update
   * @returns {Promise<Object>} - The updated video object
   */
  async enforcePublic(videoId) {
    try {
      this._checkClient();
      console.log(`VideoService: Enforcing public access for video ${videoId}`);

      // First get the current video details
      const video = await this.client.videos.get(videoId);

      // If already public, return as is
      if (video.public === true) {
        console.log(`VideoService: Video ${videoId} is already public`);
        return video;
      }

      // Update video to be public
      const updatePayload = {
        public: true,
      };

      const updatedVideo = await this.client.videos.update(
        videoId,
        updatePayload
      );
      console.log(`VideoService: Successfully made video ${videoId} public`);

      return updatedVideo;
    } catch (error) {
      console.error(`VideoService: Error enforcing public access:`, error);
      throw error;
    }
  }

  /**
   * Enforce that a video is private and verify token generation works
   * @param {String} videoId - The video ID to update
   * @returns {Promise<Object>} - The updated video object with token info
   */
  async enforcePrivateAccess(videoId) {
    try {
      this._checkClient();
      console.log(
        `VideoService: Enforcing private access for video ${videoId}`
      );

      // First get the current video details
      const video = await this.client.videos.get(videoId);

      // Update video to be private if it's currently public
      if (video.public === true) {
        const updatePayload = {
          public: false,
        };

        await this.client.videos.update(videoId, updatePayload);
        console.log(`VideoService: Made video ${videoId} private`);
      }

      // Verify we can generate a token
      const token = await this.generateVideoAccessToken(videoId);
      console.log(
        `VideoService: Successfully generated token for video ${videoId}`
      );

      // Get updated video details
      const updatedVideo = await this.client.videos.get(videoId);

      // Add token data to the response
      updatedVideo.accessToken = token;
      updatedVideo.securePlaybackUrls = {
        hls: `${updatedVideo.assets.hls}?token=${token}`,
        mp4: `${updatedVideo.assets.mp4}?token=${token}`,
        player: `${updatedVideo.assets.player}?token=${token}`,
      };

      return updatedVideo;
    } catch (error) {
      console.error(`VideoService: Error enforcing private access:`, error);
      throw error;
    }
  }
}

export default new VideoService();
