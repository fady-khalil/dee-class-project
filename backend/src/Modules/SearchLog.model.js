import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

searchLogSchema.index({ count: -1 });

const SearchLog = mongoose.model("SearchLog", searchLogSchema);

export default SearchLog;
