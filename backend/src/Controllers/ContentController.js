import HeroSection from "../Modules/HeroSection.model.js";
import JoinUs from "../Modules/JoinUs.model.js";
import TrendingCourse from "../Modules/TrendingCourse.model.js";
import Course from "../Modules/Course.model.js";
import ContactInfo from "../Modules/ContactInfo.model.js";
import PrivacyPolicy from "../Modules/PrivacyPolicy.model.js";
import TermsOfService from "../Modules/TermsOfService.model.js";
import FAQ from "../Modules/FAQ.model.js";
import BottomBanner from "../Modules/BottomBanner.model.js";

// API.video API key
const API_VIDEO_KEY = process.env.API_VIDEO_KEY || "NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw";

// =====================
// HERO SECTION
// =====================

// Get hero section (admin - returns all fields)
export const getHeroSection = async (req, res) => {
  try {
    let heroSection = await HeroSection.findOne({ singleton: "hero_section" });

    // Create default if not exists
    if (!heroSection) {
      heroSection = await HeroSection.create({ singleton: "hero_section" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Hero section retrieved successfully",
      data: heroSection,
    });
  } catch (error) {
    console.error("Error getting hero section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving hero section",
      data: error.message,
    });
  }
};

// Update hero section
export const updateHeroSection = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar, featured_courses } = req.body;

    let heroSection = await HeroSection.findOne({ singleton: "hero_section" });

    if (!heroSection) {
      heroSection = new HeroSection({ singleton: "hero_section" });
    }

    // Update fields
    if (title !== undefined) heroSection.title = title;
    if (title_ar !== undefined) heroSection.title_ar = title_ar;
    if (text !== undefined) heroSection.text = text;
    if (text_ar !== undefined) heroSection.text_ar = text_ar;
    if (featured_courses !== undefined) heroSection.featured_courses = featured_courses;

    await heroSection.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Hero section updated successfully",
      data: heroSection,
    });
  } catch (error) {
    console.error("Error updating hero section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating hero section",
      data: error.message,
    });
  }
};

// Get all courses for selection (admin)
export const getCoursesForSelection = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("_id name name_ar slug")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error getting courses for selection:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving courses",
      data: error.message,
    });
  }
};

// =====================
// JOIN US SECTION
// =====================

// Get join us section (admin - returns all fields)
export const getJoinUs = async (req, res) => {
  try {
    let joinUs = await JoinUs.findOne({ singleton: "join_us" });

    // Create default if not exists
    if (!joinUs) {
      joinUs = await JoinUs.create({ singleton: "join_us" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Join Us section retrieved successfully",
      data: joinUs,
    });
  } catch (error) {
    console.error("Error getting join us section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving join us section",
      data: error.message,
    });
  }
};

// Update join us section
export const updateJoinUs = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar } = req.body;

    let joinUs = await JoinUs.findOne({ singleton: "join_us" });

    if (!joinUs) {
      joinUs = new JoinUs({ singleton: "join_us" });
    }

    // Update fields
    if (title !== undefined) joinUs.title = title;
    if (title_ar !== undefined) joinUs.title_ar = title_ar;
    if (text !== undefined) joinUs.text = text;
    if (text_ar !== undefined) joinUs.text_ar = text_ar;

    await joinUs.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Join Us section updated successfully",
      data: joinUs,
    });
  } catch (error) {
    console.error("Error updating join us section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating join us section",
      data: error.message,
    });
  }
};

// =====================
// TRENDING COURSE / REELS
// =====================

// Get trending course section (admin - returns all fields)
export const getTrendingCourse = async (req, res) => {
  try {
    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    // Create default if not exists
    if (!trendingCourse) {
      trendingCourse = await TrendingCourse.create({ singleton: "trending_course" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trending Course section retrieved successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error getting trending course section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving trending course section",
      data: error.message,
    });
  }
};

// Update trending course section (title, text only)
export const updateTrendingCourse = async (req, res) => {
  try {
    const { title, title_ar, text, text_ar } = req.body;

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      trendingCourse = new TrendingCourse({ singleton: "trending_course" });
    }

    // Update fields
    if (title !== undefined) trendingCourse.title = title;
    if (title_ar !== undefined) trendingCourse.title_ar = title_ar;
    if (text !== undefined) trendingCourse.text = text;
    if (text_ar !== undefined) trendingCourse.text_ar = text_ar;

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Trending Course section updated successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error updating trending course section:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating trending course section",
      data: error.message,
    });
  }
};

// Fetch video data from api.video by videoId
export const fetchVideoData = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
      });
    }

    const response = await fetch(`https://ws.api.video/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${API_VIDEO_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        status: response.status,
        success: false,
        message: `Failed to fetch video: ${response.statusText}`,
      });
    }

    const videoData = await response.json();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Video data fetched successfully",
      data: {
        videoId: videoData.videoId,
        title: videoData.title,
        description: videoData.description || "",
        public: videoData.public,
        assets: {
          hls: videoData.assets?.hls,
          iframe: videoData.assets?.iframe,
          player: videoData.assets?.player,
          thumbnail: videoData.assets?.thumbnail,
          mp4: videoData.assets?.mp4,
        },
        createdAt: videoData.createdAt,
        updatedAt: videoData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching video data:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while fetching video data",
      data: error.message,
    });
  }
};

// Add a reel to trending course
export const addReel = async (req, res) => {
  try {
    const { videoId, title, description, assets, courseId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Video ID is required",
      });
    }

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      trendingCourse = new TrendingCourse({ singleton: "trending_course" });
    }

    // Check if reel already exists
    const existingReel = trendingCourse.reels.find((r) => r.videoId === videoId);
    if (existingReel) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "This video is already added as a reel",
      });
    }

    // Add new reel
    const newReel = {
      videoId,
      title: title || "",
      description: description || "",
      public: true,
      assets: assets || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (courseId) newReel.course = courseId;

    trendingCourse.reels.push(newReel);

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Reel added successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error adding reel:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while adding reel",
      data: error.message,
    });
  }
};

// Remove a reel from trending course
export const removeReel = async (req, res) => {
  try {
    const { videoId } = req.params;

    let trendingCourse = await TrendingCourse.findOne({ singleton: "trending_course" });

    if (!trendingCourse) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Trending course section not found",
      });
    }

    // Remove reel by videoId
    trendingCourse.reels = trendingCourse.reels.filter((r) => r.videoId !== videoId);

    await trendingCourse.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Reel removed successfully",
      data: trendingCourse,
    });
  } catch (error) {
    console.error("Error removing reel:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while removing reel",
      data: error.message,
    });
  }
};

// =====================
// CONTACT INFO
// =====================

// Get contact info
export const getContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne({ singleton: "contact_info" });

    if (!contactInfo) {
      contactInfo = await ContactInfo.create({ singleton: "contact_info" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Contact info retrieved successfully",
      data: contactInfo,
    });
  } catch (error) {
    console.error("Error getting contact info:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving contact info",
      data: error.message,
    });
  }
};

// Update contact info
export const updateContactInfo = async (req, res) => {
  try {
    const { pageTitle, pageTitle_ar, pageSubtitle, pageSubtitle_ar, email, phone, address, address_ar, workingHours, workingHours_ar, socialMedia } = req.body;

    let contactInfo = await ContactInfo.findOne({ singleton: "contact_info" });

    if (!contactInfo) {
      contactInfo = new ContactInfo({ singleton: "contact_info" });
    }

    if (pageTitle !== undefined) contactInfo.pageTitle = pageTitle;
    if (pageTitle_ar !== undefined) contactInfo.pageTitle_ar = pageTitle_ar;
    if (pageSubtitle !== undefined) contactInfo.pageSubtitle = pageSubtitle;
    if (pageSubtitle_ar !== undefined) contactInfo.pageSubtitle_ar = pageSubtitle_ar;
    if (email !== undefined) contactInfo.email = email;
    if (phone !== undefined) contactInfo.phone = phone;
    if (address !== undefined) contactInfo.address = address;
    if (address_ar !== undefined) contactInfo.address_ar = address_ar;
    if (workingHours !== undefined) contactInfo.workingHours = workingHours;
    if (workingHours_ar !== undefined) contactInfo.workingHours_ar = workingHours_ar;
    if (socialMedia !== undefined) contactInfo.socialMedia = socialMedia;

    await contactInfo.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Contact info updated successfully",
      data: contactInfo,
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating contact info",
      data: error.message,
    });
  }
};

// =====================
// PRIVACY POLICY
// =====================

// Get privacy policy
export const getPrivacyPolicy = async (req, res) => {
  try {
    let privacyPolicy = await PrivacyPolicy.findOne({ singleton: "privacy_policy" });

    if (!privacyPolicy) {
      privacyPolicy = await PrivacyPolicy.create({ singleton: "privacy_policy" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy retrieved successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error getting privacy policy:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving privacy policy",
      data: error.message,
    });
  }
};

// Update privacy policy
export const updatePrivacyPolicy = async (req, res) => {
  try {
    const { content, content_ar } = req.body;

    let privacyPolicy = await PrivacyPolicy.findOne({ singleton: "privacy_policy" });

    if (!privacyPolicy) {
      privacyPolicy = new PrivacyPolicy({ singleton: "privacy_policy" });
    }

    if (content !== undefined) privacyPolicy.content = content;
    if (content_ar !== undefined) privacyPolicy.content_ar = content_ar;

    await privacyPolicy.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy updated successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating privacy policy",
      data: error.message,
    });
  }
};

// =====================
// TERMS OF SERVICE
// =====================

// Get terms of service
export const getTermsOfService = async (req, res) => {
  try {
    let termsOfService = await TermsOfService.findOne({ singleton: "terms_of_service" });

    if (!termsOfService) {
      termsOfService = await TermsOfService.create({ singleton: "terms_of_service" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Terms of service retrieved successfully",
      data: termsOfService,
    });
  } catch (error) {
    console.error("Error getting terms of service:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving terms of service",
      data: error.message,
    });
  }
};

// Update terms of service
export const updateTermsOfService = async (req, res) => {
  try {
    const { content, content_ar } = req.body;

    let termsOfService = await TermsOfService.findOne({ singleton: "terms_of_service" });

    if (!termsOfService) {
      termsOfService = new TermsOfService({ singleton: "terms_of_service" });
    }

    if (content !== undefined) termsOfService.content = content;
    if (content_ar !== undefined) termsOfService.content_ar = content_ar;

    await termsOfService.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Terms of service updated successfully",
      data: termsOfService,
    });
  } catch (error) {
    console.error("Error updating terms of service:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating terms of service",
      data: error.message,
    });
  }
};

// =====================
// FAQ
// =====================

// Get FAQ
export const getFAQ = async (req, res) => {
  try {
    let faq = await FAQ.findOne({ singleton: "faq" });

    if (!faq) {
      faq = await FAQ.create({ singleton: "faq" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error getting FAQ:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving FAQ",
      data: error.message,
    });
  }
};

// Update FAQ (page title only)
export const updateFAQ = async (req, res) => {
  try {
    const { pageTitle, pageTitle_ar } = req.body;

    let faq = await FAQ.findOne({ singleton: "faq" });

    if (!faq) {
      faq = new FAQ({ singleton: "faq" });
    }

    if (pageTitle !== undefined) faq.pageTitle = pageTitle;
    if (pageTitle_ar !== undefined) faq.pageTitle_ar = pageTitle_ar;

    await faq.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating FAQ",
      data: error.message,
    });
  }
};

// Add FAQ item
export const addFAQItem = async (req, res) => {
  try {
    const { question, question_ar, answer, answer_ar, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Question and answer are required",
      });
    }

    let faq = await FAQ.findOne({ singleton: "faq" });

    if (!faq) {
      faq = new FAQ({ singleton: "faq" });
    }

    faq.items.push({
      question,
      question_ar: question_ar || "",
      answer,
      answer_ar: answer_ar || "",
      order: order || faq.items.length,
      isActive: true,
    });

    await faq.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ item added successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error adding FAQ item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while adding FAQ item",
      data: error.message,
    });
  }
};

// Update FAQ item
export const updateFAQItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { question, question_ar, answer, answer_ar, order, isActive } = req.body;

    let faq = await FAQ.findOne({ singleton: "faq" });

    if (!faq) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "FAQ not found",
      });
    }

    const itemIndex = faq.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "FAQ item not found",
      });
    }

    if (question !== undefined) faq.items[itemIndex].question = question;
    if (question_ar !== undefined) faq.items[itemIndex].question_ar = question_ar;
    if (answer !== undefined) faq.items[itemIndex].answer = answer;
    if (answer_ar !== undefined) faq.items[itemIndex].answer_ar = answer_ar;
    if (order !== undefined) faq.items[itemIndex].order = order;
    if (isActive !== undefined) faq.items[itemIndex].isActive = isActive;

    await faq.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ item updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error updating FAQ item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating FAQ item",
      data: error.message,
    });
  }
};

// Delete FAQ item
export const deleteFAQItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    let faq = await FAQ.findOne({ singleton: "faq" });

    if (!faq) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "FAQ not found",
      });
    }

    faq.items = faq.items.filter((item) => item._id.toString() !== itemId);

    await faq.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ item deleted successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error deleting FAQ item:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting FAQ item",
      data: error.message,
    });
  }
};

// =====================
// BOTTOM BANNER
// =====================

// Get bottom banner (admin)
export const getBottomBanner = async (req, res) => {
  try {
    let banner = await BottomBanner.findOne({ singleton: "bottom_banner" });

    if (!banner) {
      banner = await BottomBanner.create({ singleton: "bottom_banner" });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Bottom banner retrieved successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error getting bottom banner:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving bottom banner",
      data: error.message,
    });
  }
};

// Update bottom banner
export const updateBottomBanner = async (req, res) => {
  try {
    const { isActive, registered_content, registered_content_ar, guest_content, guest_content_ar, app_store_url, play_store_url } = req.body;

    let banner = await BottomBanner.findOne({ singleton: "bottom_banner" });

    if (!banner) {
      banner = new BottomBanner({ singleton: "bottom_banner" });
    }

    if (isActive !== undefined) banner.isActive = isActive;
    if (registered_content !== undefined) banner.registered_content = registered_content;
    if (registered_content_ar !== undefined) banner.registered_content_ar = registered_content_ar;
    if (guest_content !== undefined) banner.guest_content = guest_content;
    if (guest_content_ar !== undefined) banner.guest_content_ar = guest_content_ar;
    if (app_store_url !== undefined) banner.app_store_url = app_store_url;
    if (play_store_url !== undefined) banner.play_store_url = play_store_url;

    await banner.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Bottom banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error updating bottom banner:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating bottom banner",
      data: error.message,
    });
  }
};
