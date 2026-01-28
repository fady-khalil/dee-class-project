import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
    },
    purchasedItems: {
      courses: [
        {
          courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
          },
          // Store complete course details for quick access
          title: String,
          price: Number,
          slug: String,
          description: String,
          // Store video trailer details
          videoTrailer: {
            videoId: String,
            title: String,
            description: String,
            thumbnail: String,
            duration: Number,
            // Other api.video properties
            public: Boolean,
            assets: {
              thumbnail: String,
              player: String,
              hls: String,
              mp4: String,
            },
          },
          // Purchase timestamp
          purchasedAt: {
            type: Date,
            default: Date.now,
          },
          // Track watched/completed sessions
          watchedSessions: [
            {
              sessionId: {
                type: mongoose.Schema.Types.ObjectId,
              },
              watchedAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
    // Subscription fields
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
      },
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "past_due", null],
        default: null,
      },
      stripeCustomerId: {
        type: String,
        default: null,
      },
      stripeSubscriptionId: {
        type: String,
        default: null,
      },
      currentPeriodStart: {
        type: Date,
        default: null,
      },
      currentPeriodEnd: {
        type: Date,
        default: null,
      },
      profilesAllowed: {
        type: Number,
        default: 0,
      },
      canDownload: {
        type: Boolean,
        default: false,
      },
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
    },
    // Continue watching for course purchasers (users without active plan/profiles)
    // This is at user level, not profile level
    watchingHistory: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        courseSlug: {
          type: String,
        },
        videoId: {
          type: String, // api.video ID
          required: true,
        },
        timeSlap: {
          type: String, // Format: "MM:SS"
          default: "00:00",
        },
        timestamp: {
          type: Number, // Seconds
          default: 0,
        },
        lastWatchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // User profiles (like Netflix profiles) - for subscribers only
    profiles: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        avatar: {
          type: String,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        // Saved courses for this profile (My List)
        savedCourses: [
          {
            courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Course",
            },
            savedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        // Continue watching - tracks video progress
        watchingHistory: [
          {
            courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Course",
            },
            courseSlug: {
              type: String,
            },
            videoId: {
              type: String, // api.video ID
              required: true,
            },
            timeSlap: {
              type: String, // Format: "MM:SS"
              default: "00:00",
            },
            timestamp: {
              type: Number, // Seconds
              default: 0,
            },
            lastWatchedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        // Completed videos for this profile
        completedVideos: [
          {
            courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Course",
            },
            videoId: {
              type: String, // api.video ID
              required: true,
            },
            completedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        // Completed courses for this profile
        completedCourses: [
          {
            courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Course",
            },
            completedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ "subscription.stripeCustomerId": 1 });
userSchema.index({ "subscription.stripeSubscriptionId": 1 });

// Virtual to check if subscription is active
userSchema.virtual("hasActiveSubscription").get(function () {
  return (
    this.subscription?.status === "active" &&
    this.subscription?.currentPeriodEnd &&
    new Date(this.subscription.currentPeriodEnd) > new Date()
  );
});

// Ensure virtuals are included in JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
