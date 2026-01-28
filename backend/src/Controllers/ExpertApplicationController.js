import ExpertApplication from "../Modules/ExpertApplication.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads/resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Submit a new expert application (public route)
export const submitApplication = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "All fields are required (name, email, phone, location)",
      });
    }

    // Check if email already submitted
    const existingApplication = await ExpertApplication.findOne({ email });
    if (existingApplication) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "An application with this email already exists",
      });
    }

    // Create application data
    const applicationData = {
      name,
      email,
      phone,
      location,
    };

    // Add resume if uploaded
    if (req.file) {
      applicationData.resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `uploads/resumes/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    const application = new ExpertApplication(applicationData);
    await application.save();

    res.status(201).json({
      status: 201,
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while submitting application",
      error: error.message,
    });
  }
};

// Get all applications (admin route)
export const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const applications = await ExpertApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ExpertApplication.countDocuments(query);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving applications",
      error: error.message,
    });
  }
};

// Get single application (admin route)
export const getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ExpertApplication.findById(id).lean();

    if (!application) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Application retrieved successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error getting application:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving application",
      error: error.message,
    });
  }
};

// Update application status (admin route)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending", "reviewed", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid status. Must be one of: pending, reviewed, approved, rejected",
      });
    }

    const application = await ExpertApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Application not found",
      });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Application updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating application",
      error: error.message,
    });
  }
};

// Delete application (admin route)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ExpertApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Application not found",
      });
    }

    // Delete resume file if exists
    if (application.resume?.path) {
      const filePath = path.join(__dirname, "../../", application.resume.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ExpertApplication.findByIdAndDelete(id);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting application",
      error: error.message,
    });
  }
};
