import CourseCategory from "../Modules/CourseCategory.model.js";
import Course from "../Modules/Course.model.js";
import { getAll, getOne, deleteOne } from "../Services/crud/crudFunctions.js";
import {
  transformToLanguage,
  transformArrayToLanguage,
  createTranslationsObject,
} from "../utils/languageUtils.js";

// Define translatable fields for CourseCategory
const TRANSLATABLE_FIELDS = ["title"];

// Create a custom create function for multilingual support
export const createCourseCategory = async (req, res) => {
  try {
    // Create translations object
    const { title, title_ar, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Title is required",
        data: null,
      });
    }

    // Create category with translations
    const categoryData = {
      translations: {
        en: { title },
        ar: { title: title_ar || title },
      },
    };

    if (req.file) {
      categoryData.image = `uploads/${req.file.filename}`;
    }

    if (status) {
      categoryData.status = status;
    }

    const courseCategory = await CourseCategory.create(categoryData);

    res.status(201).json({
      status: 201,
      success: true,
      message: "Course category created successfully",
      data: {
        _id: courseCategory._id,
        title: title,
        slug: courseCategory.slug,
        image: courseCategory.image,
        status: courseCategory.status,
      },
    });
  } catch (error) {
    console.error("Error creating course category:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating the category",
      data: null,
    });
  }
};

// Get all course categories with language support
export const getCourseCategories = async (req, res) => {
  try {
    const categories = await CourseCategory.find().lean().exec();

    // Get course counts per category in one query
    const courseCounts = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    courseCounts.forEach((c) => {
      countMap[String(c._id)] = c.count;
    });

    // Transform categories based on language
    const language = req.language || "en";
    const transformedCategories = categories.map((category) => {
      // Get title for the current language
      const title =
        category.translations?.[language]?.title ||
        category.translations?.en?.title ||
        category.title || // Fallback for legacy data
        "Untitled";

      // Return in the same format as before
      return {
        _id: category._id,
        title: title,
        slug: category.slug,
        image: category.image,
        status: category.status || "active",
        courseCount: countMap[String(category._id)] || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        translations: category.translations,
      };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Documents retrieved successfully",
      results: transformedCategories.length,
      data: transformedCategories,
    });
  } catch (error) {
    console.error("Error getting course categories:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving categories",
      data: null,
    });
  }
};

// Course category by slug with language support
export const getCourseCategoryBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = await CourseCategory.findOne({ slug }).lean().exec();

    if (!category) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Get the appropriate language version
    const language = req.language || "en";
    const title =
      category.translations?.[language]?.title ||
      category.translations?.en?.title ||
      category.title || // Fallback for legacy data
      "Untitled";

    res.status(200).json({
      status: 200,
      success: true,
      message: "Document retrieved successfully",
      data: {
        _id: category._id,
        title: title,
        slug: category.slug,
        image: category.image,
        status: category.status || "active",
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the category",
      data: null,
    });
  }
};

// Get category with full translations for admin use
export const getCourseCategoryWithTranslations = async (req, res) => {
  try {
    const slug = req.params.slug;

    // Include all fields including translations
    const category = await CourseCategory.findOne({ slug }).exec();

    if (!category) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the category",
      data: error.message,
    });
  }
};

// Update course category with language support
export const updateCourseCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const { title, title_ar, status } = req.body;

    // Find the category
    const category = await CourseCategory.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Update translations
    if (!category.translations) {
      category.translations = { en: {}, ar: {} };
    }

    if (title) {
      category.translations.en.title = title;
    }

    if (title_ar) {
      category.translations.ar.title = title_ar;
    } else if (title && !category.translations.ar.title) {
      category.translations.ar.title = title;
    }

    if (req.file) {
      category.image = `uploads/${req.file.filename}`;
    }

    if (status) {
      category.status = status;
    }

    await category.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Category updated successfully",
      data: {
        _id: category._id,
        title: category.translations.en.title,
        slug: category.slug,
        image: category.image,
        status: category.status,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating the category",
      data: null,
    });
  }
};

// Delete course category
export const deleteCourseCategory = deleteOne(CourseCategory);
