import Course from "../Modules/Course.model.js";
import Instructor from "../Modules/Instructor.model.js";
import CourseCategory from "../Modules/CourseCategory.model.js";
import SearchLog from "../Modules/SearchLog.model.js";

// Reuse the same image normalizer from CourseController
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null;
  if (typeof imagePath === "string") {
    if (imagePath.includes("uploads/")) return imagePath;
    if (imagePath.includes("uploads\\"))
      return imagePath.substring(imagePath.indexOf("uploads\\")).replace(/\\/g, "/");
    if (imagePath.includes("C:")) {
      const parts = imagePath.split("\\");
      return `uploads/${parts[parts.length - 1]}`;
    }
  }
  return imagePath;
};

const transformCourseForSearch = (doc, lang = "en") => {
  const d = doc.toObject ? doc.toObject() : doc;
  const name = lang === "ar" && d.name_ar ? d.name_ar : d.name;
  const image = normalizeImagePath(
    lang === "ar" && d.image_ar?.data ? d.image_ar.data : d.image?.data
  );

  let category = d.category;
  if (category?.translations) {
    const catLang = category.translations[lang] || category.translations.en;
    category = { _id: category._id, slug: category.slug, title: catLang?.title };
  }

  let instructor = d.instructor;
  if (instructor?._id) {
    instructor = {
      _id: instructor._id,
      slug: instructor.slug,
      name: lang === "ar" && instructor.name_ar ? instructor.name_ar : instructor.name,
      profileImage: normalizeImagePath(instructor.profileImage?.data),
    };
  }

  const thumbnail =
    d.trailer?.assets?.thumbnail ||
    d.video?.assets?.thumbnail ||
    null;

  return { _id: d._id, slug: d.slug, name, image, thumbnail, instructor, category };
};

const transformInstructorForSearch = (doc, lang = "en") => {
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    _id: d._id,
    slug: d.slug,
    name: lang === "ar" && d.name_ar ? d.name_ar : d.name,
    profileImage: normalizeImagePath(d.profileImage?.data),
  };
};

const transformCategoryForSearch = (doc, lang = "en") => {
  const d = doc.toObject ? doc.toObject() : doc;
  const langData = d.translations?.[lang] || d.translations?.en;
  return { _id: d._id, slug: d.slug, title: langData?.title };
};

export const search = async (req, res) => {
  try {
    const lang = req.language || "en";
    const q = (req.query.q || "").trim();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { courses: [], instructors: [], categories: [], suggestions: [] },
        query: q,
        totalResults: 0,
      });
    }

    const regex = new RegExp(q, "i");
    const skip = (page - 1) * pageSize;

    const [courses, instructors, categories] = await Promise.all([
      Course.find({
        $or: [
          { name: regex },
          { name_ar: regex },
          { description: regex },
          { description_ar: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("category", "title translations slug")
        .populate("instructor", "name name_ar profileImage slug"),

      Instructor.find({
        $or: [{ name: regex }, { name_ar: regex }],
      }).limit(3),

      CourseCategory.find({
        $or: [
          { "translations.en.title": regex },
          { "translations.ar.title": regex },
        ],
      }).limit(3),
    ]);

    // Log the search query (fire-and-forget)
    SearchLog.findOneAndUpdate(
      { query: q.toLowerCase() },
      { $inc: { count: 1 }, lastSearched: new Date() },
      { upsert: true }
    ).catch(() => {});

    const data = {
      courses: courses.map((c) => transformCourseForSearch(c, lang)),
      instructors: instructors.map((i) => transformInstructorForSearch(i, lang)),
      categories: categories.map((c) => transformCategoryForSearch(c, lang)),
    };

    const totalResults =
      data.courses.length + data.instructors.length + data.categories.length;

    res.status(200).json({
      success: true,
      data,
      query: q,
      totalResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed", error: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await SearchLog.find()
      .sort({ count: -1 })
      .limit(5)
      .select("query");

    res.status(200).json({
      success: true,
      data: suggestions.map((s) => s.query),
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ success: false, message: "Failed to get suggestions" });
  }
};
