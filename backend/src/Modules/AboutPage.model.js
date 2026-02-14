import mongoose from "mongoose";

const manifestoItemSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    label_ar: { type: String, default: "" },
    text: { type: String, default: "" },
    text_ar: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const galleryItemSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    size: {
      type: String,
      enum: ["large", "medium", "small"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const aboutPageSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "about_page", unique: true },
    // Scene 1: Opening
    opening_line1: { type: String, default: "" },
    opening_line1_ar: { type: String, default: "" },
    opening_line2: { type: String, default: "" },
    opening_line2_ar: { type: String, default: "" },
    // Scene 2: Story
    story_text: { type: String, default: "" },
    story_text_ar: { type: String, default: "" },
    story_image: { type: String, default: "" },
    // Scene 3: Manifesto
    manifesto: [manifestoItemSchema],
    // Scene 4: Gallery
    gallery: [galleryItemSchema],
    // Scene 5: Finale
    finale_eyebrow: { type: String, default: "" },
    finale_eyebrow_ar: { type: String, default: "" },
    finale_subtitle: { type: String, default: "" },
    finale_subtitle_ar: { type: String, default: "" },
    finale_button_text: { type: String, default: "" },
    finale_button_text_ar: { type: String, default: "" },
    finale_button_link: { type: String, default: "" },
  },
  { timestamps: true }
);

const AboutPage = mongoose.model("AboutPage", aboutPageSchema);

export default AboutPage;
