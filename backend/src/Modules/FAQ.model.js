import mongoose from "mongoose";

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    question_ar: {
      type: String,
      default: "",
    },
    answer: {
      type: String,
      required: true,
    },
    answer_ar: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const faqSchema = new mongoose.Schema(
  {
    singleton: {
      type: String,
      default: "faq",
      unique: true,
    },
    pageTitle: {
      type: String,
      default: "",
    },
    pageTitle_ar: {
      type: String,
      default: "",
    },
    items: [faqItemSchema],
  },
  { timestamps: true }
);

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
