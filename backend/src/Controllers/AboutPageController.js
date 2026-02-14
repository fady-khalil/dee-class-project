import AboutPage from "../Modules/AboutPage.model.js";

const getOrCreate = async () => {
  let doc = await AboutPage.findOne({ singleton: "about_page" });
  if (!doc) doc = await AboutPage.create({ singleton: "about_page" });
  return doc;
};

export const getAboutPage = async (req, res) => {
  try {
    const data = await getOrCreate();
    res.status(200).json({
      status: 200,
      success: true,
      message: "About page retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error getting about page:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving about page",
      data: error.message,
    });
  }
};

export const updateAboutPage = async (req, res) => {
  try {
    const aboutPage = await getOrCreate();
    const textFields = [
      "opening_line1", "opening_line1_ar", "opening_line2", "opening_line2_ar",
      "story_text", "story_text_ar",
      "finale_eyebrow", "finale_eyebrow_ar",
      "finale_subtitle", "finale_subtitle_ar",
      "finale_button_text", "finale_button_text_ar", "finale_button_link",
    ];
    textFields.forEach((f) => {
      if (req.body[f] !== undefined) aboutPage[f] = req.body[f];
    });
    if (req.body.manifesto !== undefined) aboutPage.manifesto = req.body.manifesto;
    await aboutPage.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "About page updated successfully",
      data: aboutPage,
    });
  } catch (error) {
    console.error("Error updating about page:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating about page",
      data: error.message,
    });
  }
};

export const updateStoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "No image file provided",
      });
    }
    const aboutPage = await getOrCreate();
    aboutPage.story_image = `uploads/${req.file.filename}`;
    await aboutPage.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Story image updated successfully",
      data: aboutPage,
    });
  } catch (error) {
    console.error("Error updating story image:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating story image",
      data: error.message,
    });
  }
};

export const addGalleryItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Image is required",
      });
    }
    const { size, order } = req.body;
    const aboutPage = await getOrCreate();
    aboutPage.gallery.push({
      image: `uploads/${req.file.filename}`,
      size: size || "medium",
      order: order !== undefined ? Number(order) : aboutPage.gallery.length,
    });
    await aboutPage.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Gallery item added successfully",
      data: aboutPage,
    });
  } catch (error) {
    console.error("Error adding gallery item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while adding gallery item",
      data: error.message,
    });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { size, order } = req.body;
    const aboutPage = await getOrCreate();
    const item = aboutPage.gallery.id(itemId);
    if (!item) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Gallery item not found",
      });
    }
    if (req.file) item.image = `uploads/${req.file.filename}`;
    if (size !== undefined) item.size = size;
    if (order !== undefined) item.order = Number(order);
    await aboutPage.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Gallery item updated successfully",
      data: aboutPage,
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating gallery item",
      data: error.message,
    });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const aboutPage = await getOrCreate();
    aboutPage.gallery = aboutPage.gallery.filter(
      (item) => item._id.toString() !== itemId
    );
    await aboutPage.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Gallery item deleted successfully",
      data: aboutPage,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting gallery item",
      data: error.message,
    });
  }
};

export const getAboutPagePublic = async (req, res, next) => {
  try {
    const lang = req.language || "en";
    const aboutPage = await AboutPage.findOne({ singleton: "about_page" }).lean();
    if (!aboutPage) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "About page retrieved successfully",
        data: null,
      });
    }
    const pick = (en, ar) => (lang === "ar" ? ar || en : en);
    const data = {
      opening: {
        line1: pick(aboutPage.opening_line1, aboutPage.opening_line1_ar),
        line2: pick(aboutPage.opening_line2, aboutPage.opening_line2_ar),
      },
      story: {
        text: pick(aboutPage.story_text, aboutPage.story_text_ar),
        image: aboutPage.story_image,
      },
      manifesto: (aboutPage.manifesto || [])
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          label: pick(item.label, item.label_ar),
          text: pick(item.text, item.text_ar),
        })),
      gallery: (aboutPage.gallery || [])
        .sort((a, b) => a.order - b.order)
        .map((item) => ({ src: item.image, size: item.size })),
      finale: {
        eyebrow: pick(aboutPage.finale_eyebrow, aboutPage.finale_eyebrow_ar),
        subtitle: pick(aboutPage.finale_subtitle, aboutPage.finale_subtitle_ar),
        button_text: pick(aboutPage.finale_button_text, aboutPage.finale_button_text_ar),
        button_link: aboutPage.finale_button_link,
      },
    };
    res.status(200).json({
      status: 200,
      success: true,
      message: "About page retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getAboutPagePublic:", error);
    next(error);
  }
};
