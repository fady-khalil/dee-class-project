import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Modules/User.model.js";
import Course from "../Modules/Course.model.js";
import CourseSession from "../Modules/CourseSession.model.js";

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
    fixCorruptedPurchasedItems();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

async function fixCorruptedPurchasedItems() {
  try {
    // Find users with potentially corrupted data
    const users = await User.find();

    console.log(`Found ${users.length} users to check`);

    let fixedCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        let needsFixing = false;
        const cleanedCourses = [];

        // Check each course in the user's purchased items
        if (user.purchasedItems && user.purchasedItems.courses) {
          for (const item of user.purchasedItems.courses) {
            // Check if this is a corrupted entry (has buffer property)
            if (item.buffer || !item.courseId) {
              needsFixing = true;
              console.log(
                `Found corrupted entry for user ${user._id} (${user.email}):`,
                item
              );

              // If we have an _id, try to look up the course
              if (item._id) {
                try {
                  const course = await Course.findById(item._id);
                  if (course) {
                    // Get all sessions for this course
                    const sessions = await CourseSession.find({
                      course: course._id,
                    });

                    // Format sessions for storage (removing unnecessary fields for security)
                    const formattedSessions = sessions.map((session) => {
                      // Create a clean copy of the session
                      const sessionData = {
                        _id: session._id,
                        title: session.title,
                        description: session.description,
                        slug: session.slug,
                        videoId: session.videoId,
                        videoMetadata: {
                          title: session.videoMetadata?.title,
                          description: session.videoMetadata?.description,
                          duration: session.videoMetadata?.duration,
                          thumbnail: session.videoMetadata?.thumbnail,
                          // Remove direct video URLs for security
                          public: session.videoMetadata?.public || false,
                          publishedAt: session.videoMetadata?.publishedAt,
                          createdAt: session.videoMetadata?.createdAt,
                          updatedAt: session.videoMetadata?.updatedAt,
                          tags: session.videoMetadata?.tags || [],
                          // Intentionally excluding the assets with direct URLs
                        },
                      };
                      return sessionData;
                    });

                    // Add with proper structure
                    cleanedCourses.push({
                      courseId: course._id,
                      title: course.title,
                      price: course.price,
                      slug: course.slug,
                      description: course.description || "",
                      videoTrailer: course.videoTrailer || null,
                      sessions: formattedSessions, // Add the sessions to the course
                      purchasedAt: item.purchasedAt || new Date(),
                    });
                    console.log(
                      `Fixed course ${course._id} with ${formattedSessions.length} sessions for user ${user._id}`
                    );
                  }
                } catch (courseError) {
                  console.error(
                    `Error finding course ${item._id}:`,
                    courseError
                  );
                }
              }
            } else if (item.courseId) {
              // This entry looks correct, but check if it has sessions
              // If not, we should add them
              if (!item.sessions || item.sessions.length === 0) {
                try {
                  // Get all sessions for this course
                  const sessions = await CourseSession.find({
                    course: item.courseId,
                  });

                  if (sessions.length > 0) {
                    needsFixing = true;

                    // Format sessions for storage
                    const formattedSessions = sessions.map((session) => {
                      return {
                        _id: session._id,
                        title: session.title,
                        description: session.description,
                        slug: session.slug,
                        videoId: session.videoId,
                        videoMetadata: {
                          title: session.videoMetadata?.title,
                          description: session.videoMetadata?.description,
                          duration: session.videoMetadata?.duration,
                          thumbnail: session.videoMetadata?.thumbnail,
                          public: session.videoMetadata?.public || false,
                          publishedAt: session.videoMetadata?.publishedAt,
                          createdAt: session.videoMetadata?.createdAt,
                          updatedAt: session.videoMetadata?.updatedAt,
                          tags: session.videoMetadata?.tags || [],
                        },
                      };
                    });

                    // Create a copy of the item with sessions added
                    const updatedItem = {
                      ...item,
                      sessions: formattedSessions,
                    };
                    cleanedCourses.push(updatedItem);
                    console.log(
                      `Added ${formattedSessions.length} sessions to existing course ${item.courseId} for user ${user._id}`
                    );
                  } else {
                    // No sessions found, keep the item as-is
                    cleanedCourses.push(item);
                  }
                } catch (sessionError) {
                  console.error(
                    `Error finding sessions for course ${item.courseId}:`,
                    sessionError
                  );
                  // Keep the original item
                  cleanedCourses.push(item);
                }
              } else {
                // Item has sessions already, keep it as-is
                cleanedCourses.push(item);
              }
            }
          }
        }

        if (needsFixing) {
          // Update the user with cleaned courses
          user.purchasedItems.courses = cleanedCourses;
          await user.save();
          console.log(`Fixed user ${user._id} (${user.email})`);
          fixedCount++;
        } else {
          skipCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
        errorCount++;
      }
    }

    console.log("Repair completed!");
    console.log(`Fixed ${fixedCount} users`);
    console.log(`Skipped ${skipCount} users (no issues found)`);
    console.log(`Failed to process ${errorCount} users`);

    process.exit(0);
  } catch (error) {
    console.error("Repair script failed:", error);
    process.exit(1);
  }
}
