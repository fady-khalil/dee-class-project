import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Modules/User.model.js";
import Course from "../Modules/Course.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    migrateUsers();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

async function migrateUsers() {
  try {
    // Get all users with purchased courses
    const users = await User.find({
      "purchasedItems.courses.0": { $exists: true },
    });

    console.log(`Found ${users.length} users with purchased courses`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if the user's purchasedItems.courses already has the new format
        const hasNewFormat =
          user.purchasedItems.courses.length > 0 &&
          user.purchasedItems.courses[0].courseId !== undefined;

        if (hasNewFormat) {
          console.log(`User ${user._id} already has the new format. Skipping.`);
          continue;
        }

        console.log(`Migrating user ${user._id} (${user.email})`);

        // Get all the course IDs from the current user
        const oldCourseIds = user.purchasedItems.courses;

        // New array for courses with full details
        const newCourses = [];

        // Fetch full details for each course
        for (const courseId of oldCourseIds) {
          const course = await Course.findById(courseId);

          if (course) {
            newCourses.push({
              courseId: course._id,
              title: course.title,
              price: course.price,
              slug: course.slug,
              description: course.description || "",
              videoTrailer: course.videoTrailer || null,
              purchasedAt: new Date(), // We don't have the original purchase date, so use current date
            });
          } else {
            console.warn(`Course ${courseId} not found for user ${user._id}`);
          }
        }

        // Update the user with the new courses structure
        user.purchasedItems.courses = newCourses;
        await user.save();

        console.log(`Successfully migrated user ${user._id} (${user.email})`);
        successCount++;
      } catch (userError) {
        console.error(`Error migrating user ${user._id}:`, userError);
        errorCount++;
      }
    }

    console.log("Migration completed!");
    console.log(`Successfully migrated ${successCount} users`);
    console.log(`Failed to migrate ${errorCount} users`);

    process.exit(0);
  } catch (error) {
    console.error("Migration script failed:", error);
    process.exit(1);
  }
}
