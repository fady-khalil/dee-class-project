import Course from "../Modules/Course.model.js";
import CourseCategory from "../Modules/CourseCategory.model.js";
import HeroSection from "../Modules/HeroSection.model.js";
import JoinUs from "../Modules/JoinUs.model.js";
import TrendingCourse from "../Modules/TrendingCourse.model.js";

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

// Helper function to transform course for response
const transformCourse = (course, lang, isAdmin = false) => {
  const transformed = { ...course };

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

// Get home page data
export const getHomeData = async (req, res, next) => {
  try {
    const lang = req.language || "en";
    const isAdmin = req.isAdminRoute || false;

    // 1. Get Hero Section
    let heroSection = await HeroSection.findOne({ singleton: "hero_section" }).lean();

    let heroData = null;
    if (heroSection) {
      heroData = {
        title: lang === "ar" ? heroSection.title_ar : heroSection.title,
        text: lang === "ar" ? heroSection.text_ar : heroSection.text,
      };
    }

    // 2. Get Featured Courses (from hero section selection)
    let featuredCourses = [];
    if (heroSection?.featured_courses?.length > 0) {
      const courses = await Course.find({ _id: { $in: heroSection.featured_courses } })
        .populate("category", "title translations slug")
        .populate("instructor", "name name_ar profileImage slug")
        .select("name name_ar slug price image trailer category instructor")
        .lean();

      featuredCourses = courses.map((course) => transformCourse(course, lang, isAdmin));
    }

    // 3. Get Join Us Section
    let joinUsSection = await JoinUs.findOne({ singleton: "join_us" }).lean();

    let joinUsData = null;
    if (joinUsSection) {
      joinUsData = {
        title: lang === "ar" ? joinUsSection.title_ar : joinUsSection.title,
        text: lang === "ar" ? joinUsSection.text_ar : joinUsSection.text,
      };
    }

    // 4. Get Newly Added Courses (6 most recent)
    const newlyAddedCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("category", "title translations slug")
      .populate("instructor", "name name_ar profileImage slug")
      .select("name name_ar slug price image trailer category instructor")
      .lean();

    const transformedNewCourses = newlyAddedCourses.map((course) =>
      transformCourse(course, lang, isAdmin)
    );

    // 5. Get Recommended Courses
    const categories = await CourseCategory.find().lean();
    const recommendedCourses = [];

    if (categories.length > 0) {
      const randomCategories = categories
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(6, categories.length));

      for (const category of randomCategories) {
        const coursesForCategory = await Course.find({ category: category._id })
          .select("name name_ar slug price image trailer category instructor")
          .populate("category", "title translations slug")
          .populate("instructor", "name name_ar profileImage slug")
          .limit(1)
          .lean();

        if (coursesForCategory.length > 0) {
          recommendedCourses.push(transformCourse(coursesForCategory[0], lang, isAdmin));
        }
      }

      // Fill up to 6 if needed
      if (recommendedCourses.length < 6) {
        const additionalCourses = await Course.aggregate([
          { $match: { _id: { $nin: recommendedCourses.map((c) => c._id) } } },
          { $sample: { size: 6 - recommendedCourses.length } },
          {
            $project: {
              name: 1,
              name_ar: 1,
              slug: 1,
              price: 1,
              image: 1,
              trailer: 1,
            },
          },
        ]);

        additionalCourses.forEach((course) => {
          recommendedCourses.push(transformCourse(course, lang, isAdmin));
        });
      }
    }

    // 6. Get Trending Course / Reels Section
    let trendingSection = await TrendingCourse.findOne({ singleton: "trending_course" }).lean();

    let trendingData = null;
    if (trendingSection) {
      trendingData = {
        title: lang === "ar" ? trendingSection.title_ar : trendingSection.title,
        text: lang === "ar" ? trendingSection.text_ar : trendingSection.text,
        reels: trendingSection.reels || [],
      };
    }

    // Return combined home page data
    res.status(200).json({
      status: 200,
      success: true,
      message: "Home page data retrieved successfully",
      data: {
        hero: heroData,
        featured_courses: featuredCourses,
        join_us: joinUsData,
        newlyAddedCourses: transformedNewCourses,
        recommendedCourses: recommendedCourses,
        trending: trendingData,
      },
    });
  } catch (error) {
    console.error("Error in getHomeData:", error);
    next(error);
  }
};
