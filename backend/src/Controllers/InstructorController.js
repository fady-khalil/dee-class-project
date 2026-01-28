import Instructor from "../Modules/Instructor.model.js";
import Course from "../Modules/Course.model.js";

// Helper function to handle image path
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

// Transform instructor based on language
const transformInstructorWithLanguage = (doc, lang = "en") => {
  const docObj = doc.toObject ? doc.toObject() : doc;

  // Normalize image path
  let profileImagePath = null;
  if (docObj.profileImage?.data) {
    profileImagePath = normalizeImagePath(docObj.profileImage.data);
  }

  return {
    _id: docObj._id,
    slug: docObj.slug,
    name: lang === "ar" && docObj.name_ar ? docObj.name_ar : docObj.name,
    bio: lang === "ar" && docObj.bio_ar ? docObj.bio_ar : docObj.bio,
    description: lang === "ar" && docObj.description_ar ? docObj.description_ar : docObj.description,
    profileImage: profileImagePath,
    facebook: docObj.facebook,
    instagram: docObj.instagram,
    linkedin: docObj.linkedin,
    createdAt: docObj.createdAt,
    updatedAt: docObj.updatedAt,
  };
};

// Create instructor
export const createInstructor = async (req, res) => {
  try {
    const { name, name_ar, bio, bio_ar, description, description_ar, facebook, instagram, linkedin } = req.body;

    // Handle profile image upload
    let profileImage = null;
    if (req.file) {
      const filename = req.file.filename || req.file.originalname;
      profileImage = {
        data: `uploads/${filename}`,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
      };
    }

    const instructor = new Instructor({
      name,
      name_ar: name_ar || name,
      bio,
      bio_ar: bio_ar || bio,
      description,
      description_ar: description_ar || description,
      profileImage,
      facebook,
      instagram,
      linkedin,
    });

    const savedInstructor = await instructor.save();

    res.status(201).json({
      status: 201,
      success: true,
      message: "Instructor created successfully",
      data: savedInstructor,
    });
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating the instructor",
      data: error.message,
    });
  }
};

// Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const lang = req.language || req.query.lang || "en";

    const instructors = await Instructor.find().sort({ createdAt: -1 });

    const transformedInstructors = instructors.map((instructor) =>
      transformInstructorWithLanguage(instructor, lang)
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "Instructors retrieved successfully",
      data: transformedInstructors,
    });
  } catch (error) {
    console.error("Error getting instructors:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving instructors",
      data: error.message,
    });
  }
};

// Get instructor by slug
export const getInstructorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const lang = req.language || req.query.lang || "en";

    const instructor = await Instructor.findOne({ slug });

    if (!instructor) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Instructor not found",
        data: null,
      });
    }

    // Fetch all courses by this instructor
    const courses = await Course.find({ instructor: instructor._id })
      .select("name name_ar slug trailer image course_type price")
      .sort({ createdAt: -1 });

    // Transform courses based on language
    const transformedCourses = courses.map((course) => {
      const courseObj = course.toObject();
      return {
        _id: courseObj._id,
        name: lang === "ar" && courseObj.name_ar ? courseObj.name_ar : courseObj.name,
        slug: courseObj.slug,
        trailer: courseObj.trailer,
        image: courseObj.image?.data,
        course_type: courseObj.course_type,
        price: courseObj.price,
      };
    });

    const transformedInstructor = transformInstructorWithLanguage(instructor, lang);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Instructor retrieved successfully",
      data: {
        ...transformedInstructor,
        courses: transformedCourses,
      },
    });
  } catch (error) {
    console.error("Error getting instructor:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the instructor",
      data: error.message,
    });
  }
};

// Get instructor with all fields (for admin editing)
export const getInstructorForAdmin = async (req, res) => {
  try {
    const { slug } = req.params;

    const instructor = await Instructor.findOne({ slug });

    if (!instructor) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Instructor not found",
        data: null,
      });
    }

    // Normalize image path
    const instructorObj = instructor.toObject();
    if (instructorObj.profileImage?.data) {
      instructorObj.profileImage.data = normalizeImagePath(instructorObj.profileImage.data);
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Instructor retrieved successfully",
      data: instructorObj,
    });
  } catch (error) {
    console.error("Error getting instructor for admin:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving the instructor",
      data: error.message,
    });
  }
};

// Update instructor
export const updateInstructor = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, name_ar, bio, bio_ar, description, description_ar, facebook, instagram, linkedin } = req.body;

    const instructor = await Instructor.findOne({ slug });

    if (!instructor) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Instructor not found",
        data: null,
      });
    }

    // Update fields
    if (name) instructor.name = name;
    if (name_ar) instructor.name_ar = name_ar;
    if (bio !== undefined) instructor.bio = bio;
    if (bio_ar !== undefined) instructor.bio_ar = bio_ar;
    if (description !== undefined) instructor.description = description;
    if (description_ar !== undefined) instructor.description_ar = description_ar;
    if (facebook !== undefined) instructor.facebook = facebook;
    if (instagram !== undefined) instructor.instagram = instagram;
    if (linkedin !== undefined) instructor.linkedin = linkedin;

    // Handle profile image upload
    if (req.file) {
      const filename = req.file.filename || req.file.originalname;
      instructor.profileImage = {
        data: `uploads/${filename}`,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
      };
    } else if (req.body.removeImage === "true") {
      instructor.profileImage = {
        data: null,
        contentType: null,
        filename: null,
      };
    }

    const updatedInstructor = await instructor.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Instructor updated successfully",
      data: updatedInstructor,
    });
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating the instructor",
      data: error.message,
    });
  }
};

// Delete instructor
export const deleteInstructor = async (req, res) => {
  try {
    const { slug } = req.params;

    const instructor = await Instructor.findOneAndDelete({ slug });

    if (!instructor) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Instructor not found",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Instructor deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting the instructor",
      data: error.message,
    });
  }
};
