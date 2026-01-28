import mongoose from "mongoose";

const joinUsSchema = new mongoose.Schema(
  {
    // Singleton identifier
    singleton: {
      type: String,
      default: "join_us",
      unique: true,
    },
    // English content
    title: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    // Arabic content
    title_ar: {
      type: String,
      default: "",
    },
    text_ar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const JoinUs = mongoose.model("JoinUs", joinUsSchema);

export default JoinUs;
