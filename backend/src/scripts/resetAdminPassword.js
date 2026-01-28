import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await mongoose.connection.db.collection("admins").updateOne(
      { email: "dr-diana-admin@hotmail.com" },
      {
        $set: {
          password: "$2b$12$fLquT70cA1orZxiCRRs.W.rmn1wrHZtCQ6B7WW.YFZVoie.xTnjP.",
          failedLoginAttempts: 0,
          accountLocked: false,
          accountLockedUntil: null,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log("Password reset successfully!");
      console.log("Email: dr-diana-admin@hotmail.com");
      console.log("Password: Admin@123");
    } else if (result.matchedCount > 0) {
      console.log("Admin found but password was already set to this value.");
    } else {
      console.log("Admin not found with this email.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

resetPassword();
