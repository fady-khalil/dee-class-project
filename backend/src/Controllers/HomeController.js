import Course from "../Modules/Course.model.js";
import CourseCategory from "../Modules/CourseCategory.model.js";
import HeroSection from "../Modules/HeroSection.model.js";
import JoinUs from "../Modules/JoinUs.model.js";
import TrendingCourse from "../Modules/TrendingCourse.model.js";
import ContactInfo from "../Modules/ContactInfo.model.js";
import PrivacyPolicy from "../Modules/PrivacyPolicy.model.js";
import TermsOfService from "../Modules/TermsOfService.model.js";
import FAQ from "../Modules/FAQ.model.js";
import BottomBanner from "../Modules/BottomBanner.model.js";

// Helper function to normalize image path
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null;

  if (typeof imagePath === "string") {
    if (imagePath.includes("uploads/")) {
      return imagePath;
    } else if (imagePath.includes("uploads\\")) {
      return imagePath.substring(imagePath.indexOf("uploads\\")).replace(/\\/g, "/");
    } else if (imagePath.includes("C:")) {
      const parts = imagePath.split("\\");
      const filename = parts[parts.length - 1];
      return `uploads/${filename}`;
    }
  }
  return imagePath;
};

// Helper to get thumbnail from course based on type
const getCourseThumbnail = (course) => {
  // 1. Trailer thumbnail
  if (course.trailer?.assets?.thumbnail) return course.trailer.assets.thumbnail;
  // 2. Single course video thumbnail
  if (course.course_type === 'single' && course.video?.assets?.thumbnail) {
    return course.video.assets.thumbnail;
  }
  // 3. Series first episode thumbnail
  if (course.course_type === 'series' && course.series?.[0]?.video?.assets?.thumbnail) {
    return course.series[0].video.assets.thumbnail;
  }
  // 4. Playlist first lesson thumbnail
  if (course.course_type === 'playlist' && course.chapters?.[0]?.lessons?.[0]?.video?.assets?.thumbnail) {
    return course.chapters[0].lessons[0].video.assets.thumbnail;
  }
  return null;
};

// Helper function to transform course for response
const transformCourse = (course, lang, isAdmin = false) => {
  const transformed = { ...course };

  // Add thumbnail
  transformed.thumbnail = getCourseThumbnail(course);

  // Normalize image path
  if (transformed.image?.data) {
    transformed.image = normalizeImagePath(transformed.image.data);
  } else if (typeof transformed.image === "string") {
    transformed.image = normalizeImagePath(transformed.image);
  }

  if (!isAdmin) {
    // Apply language transformation
    if (lang === "ar" && transformed.name_ar) {
      transformed.name = transformed.name_ar;
    }
    delete transformed.name_ar;

    // Transform category
    if (transformed.category?.translations) {
      const catLangData = transformed.category.translations[lang] || transformed.category.translations.en;
      if (catLangData) {
        Object.keys(catLangData).forEach((key) => {
          transformed.category[key] = catLangData[key];
        });
      }
      delete transformed.category.translations;
    }

    // Transform instructor
    if (transformed.instructor) {
      if (lang === "ar" && transformed.instructor.name_ar) {
        transformed.instructor.name = transformed.instructor.name_ar;
      }
      delete transformed.instructor?.name_ar;
    }
  }

  return transformed;
};

// Light select — only what the home page needs (no heavy video/series/chapters)
const HOME_COURSE_SELECT = "name name_ar slug price image trailer category instructor course_type";

// Get home page data
export const getHomeData = async (req, res, next) => {
  try {
    const lang = req.language || "en";
    const isAdmin = req.isAdminRoute || false;

    // Run ALL independent queries in parallel
    const [heroSection, joinUsSection, newlyAddedCourses, trendingSection, faqDoc, allCategories, contactInfoDoc, courseCounts] =
      await Promise.all([
        HeroSection.findOne({ singleton: "hero_section" }).lean(),
        JoinUs.findOne({ singleton: "join_us" }).lean(),
        Course.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .populate("category", "title translations slug")
          .populate("instructor", "name name_ar profileImage slug")
          .select(HOME_COURSE_SELECT)
          .lean(),
        TrendingCourse.findOne({ singleton: "trending_course" }).populate("reels.course", "slug name name_ar").lean(),
        FAQ.findOne({ singleton: "faq" }).lean(),
        CourseCategory.find().lean(),
        ContactInfo.findOne({ singleton: "contact_info" }).lean(),
        Course.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      ]);

    // Hero data
    let heroData = null;
    if (heroSection) {
      heroData = {
        title: lang === "ar" ? heroSection.title_ar : heroSection.title,
        text: lang === "ar" ? heroSection.text_ar : heroSection.text,
      };
    }

    // Featured courses (depends on heroSection)
    let featuredCourses = [];
    if (heroSection?.featured_courses?.length > 0) {
      const courses = await Course.find({ _id: { $in: heroSection.featured_courses } })
        .populate("category", "title translations slug")
        .populate("instructor", "name name_ar profileImage slug")
        .select(HOME_COURSE_SELECT)
        .lean();
      featuredCourses = courses.map((c) => transformCourse(c, lang, isAdmin));
    }

    // Join us
    let joinUsData = null;
    if (joinUsSection) {
      joinUsData = {
        title: lang === "ar" ? joinUsSection.title_ar : joinUsSection.title,
        text: lang === "ar" ? joinUsSection.text_ar : joinUsSection.text,
      };
    }

    // Newly added
    const transformedNewCourses = newlyAddedCourses.map((c) =>
      transformCourse(c, lang, isAdmin)
    );

    // Recommended — single aggregation instead of N+1 loop
    const recommendedCourses = await Course.aggregate([
      { $sample: { size: 6 } },
      {
        $project: {
          name: 1, name_ar: 1, slug: 1, price: 1, image: 1,
          trailer: 1, course_type: 1,
        },
      },
    ]);
    const transformedRecommended = recommendedCourses.map((c) =>
      transformCourse(c, lang, isAdmin)
    );

    // Categories — same format as GET /course-categories
    const countMap = {};
    courseCounts.forEach((c) => { countMap[String(c._id)] = c.count; });
    const categoriesData = allCategories.map((cat) => ({
      _id: cat._id,
      title: cat.translations?.[lang]?.title || cat.translations?.en?.title || cat.title || "Untitled",
      slug: cat.slug,
      image: cat.image,
      status: cat.status || "active",
      courseCount: countMap[String(cat._id)] || 0,
    }));

    // Contact info
    let contactData = null;
    if (contactInfoDoc) {
      contactData = {
        email: contactInfoDoc.email,
        phone: contactInfoDoc.phone,
        address: lang === "ar" ? contactInfoDoc.address_ar : contactInfoDoc.address,
        socialMedia: contactInfoDoc.socialMedia,
      };
    }

    // Trending
    let trendingData = null;
    if (trendingSection) {
      trendingData = {
        title: lang === "ar" ? trendingSection.title_ar : trendingSection.title,
        text: lang === "ar" ? trendingSection.text_ar : trendingSection.text,
        reels: trendingSection.reels || [],
      };
    }

    // FAQ
    let faqItems = [];
    if (faqDoc?.items) {
      faqItems = faqDoc.items
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          _id: item._id,
          question: lang === "ar" ? item.question_ar || item.question : item.question,
          answer: lang === "ar" ? item.answer_ar || item.answer : item.answer,
        }));
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Home page data retrieved successfully",
      data: {
        hero: heroData,
        featured_courses: featuredCourses,
        join_us: joinUsData,
        newlyAddedCourses: transformedNewCourses,
        recommendedCourses: transformedRecommended,
        trending: trendingData,
        faq: faqItems,
        categories: categoriesData,
        contact_info: contactData,
      },
    });
  } catch (error) {
    console.error("Error in getHomeData:", error);
    next(error);
  }
};

// Get Contact Info (public)
export const getContactInfoPublic = async (req, res, next) => {
  try {
    const lang = req.language || "en";

    let contactInfo = await ContactInfo.findOne({ singleton: "contact_info" }).lean();

    if (!contactInfo) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Contact info retrieved successfully",
        data: null,
      });
    }

    const data = {
      pageTitle: lang === "ar" ? contactInfo.pageTitle_ar : contactInfo.pageTitle,
      pageSubtitle: lang === "ar" ? contactInfo.pageSubtitle_ar : contactInfo.pageSubtitle,
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: lang === "ar" ? contactInfo.address_ar : contactInfo.address,
      workingHours: lang === "ar" ? contactInfo.workingHours_ar : contactInfo.workingHours,
      socialMedia: contactInfo.socialMedia,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Contact info retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getContactInfoPublic:", error);
    next(error);
  }
};

// Get Privacy Policy (public)
export const getPrivacyPolicyPublic = async (req, res, next) => {
  try {
    const lang = req.language || "en";

    let privacyPolicy = await PrivacyPolicy.findOne({ singleton: "privacy_policy" }).lean();

    if (!privacyPolicy) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Privacy policy retrieved successfully",
        data: null,
      });
    }

    const data = {
      content: lang === "ar" ? privacyPolicy.content_ar : privacyPolicy.content,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getPrivacyPolicyPublic:", error);
    next(error);
  }
};

// Get Terms of Service (public)
export const getTermsOfServicePublic = async (req, res, next) => {
  try {
    const lang = req.language || "en";

    let termsOfService = await TermsOfService.findOne({ singleton: "terms_of_service" }).lean();

    if (!termsOfService) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Terms of service retrieved successfully",
        data: null,
      });
    }

    const data = {
      content: lang === "ar" ? termsOfService.content_ar : termsOfService.content,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Terms of service retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getTermsOfServicePublic:", error);
    next(error);
  }
};

// Get FAQ (public)
export const getFAQPublic = async (req, res, next) => {
  try {
    const lang = req.language || "en";

    let faq = await FAQ.findOne({ singleton: "faq" }).lean();

    if (!faq) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "FAQ retrieved successfully",
        data: null,
      });
    }

    const data = {
      pageTitle: lang === "ar" ? faq.pageTitle_ar : faq.pageTitle,
      items: (faq.items || [])
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          _id: item._id,
          question: lang === "ar" ? item.question_ar || item.question : item.question,
          answer: lang === "ar" ? item.answer_ar || item.answer : item.answer,
        })),
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "FAQ retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFAQPublic:", error);
    next(error);
  }
};

// Submit contact form (public)
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Import the transporter
    const transporter = (await import("../middlewares/SendMail.js")).default;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured");
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Server configuration error",
      });
    }

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; margin-bottom: 5px; display: block; }
          .value { background: white; padding: 12px; border-radius: 5px; border: 1px solid #eee; }
          .message-box { background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <span class="label">Phone:</span>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">Subject:</span>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <div class="message-box">${message}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from the Dee Class contact form.</p>
            <p>Submitted at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: adminEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: htmlContent,
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error in submitContactForm:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

// Get Bottom Banner (public)
export const getBottomBannerPublic = async (req, res, next) => {
  try {
    const banner = await BottomBanner.findOne({ singleton: "bottom_banner" }).lean();

    if (!banner) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Bottom banner retrieved successfully",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Bottom banner retrieved successfully",
      data: {
        isActive: banner.isActive,
        registered_content: banner.registered_content,
        registered_content_ar: banner.registered_content_ar,
        guest_content: banner.guest_content,
        guest_content_ar: banner.guest_content_ar,
        app_store_url: banner.app_store_url,
        play_store_url: banner.play_store_url,
      },
    });
  } catch (error) {
    console.error("Error in getBottomBannerPublic:", error);
    next(error);
  }
};
