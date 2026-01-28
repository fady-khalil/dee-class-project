import Admin from "../../Modules/Admin.model.js";
import { hashPassword } from "../../utils/hashing.js";
import { getUsers } from "../../Services/crud/UserService.js";
import User from "../../Modules/User.model.js";
import Cart from "../../Modules/Cart.model.js";
import Transaction from "../../Modules/Transaction.model.js";
import { sendEmail } from "../../utils/emailService.js";
import transporter from "../../middlewares/SendMail.js";

// Get all admin users
export const getAdmins = async (req, res) => {
  try {
    console.log("getAdmins called by admin:", req.admin);

    // Only super admin can view admin list
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access admin list",
      });
    }

    const admins = await Admin.find()
      .select(
        "-password -failedLoginAttempts -accountLocked -accountLockedUntil"
      )
      .sort("-createdAt");
    console.log(`Found ${admins.length} admin users`);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin users retrieved successfully",
      data: admins,
    });
  } catch (error) {
    console.error("Error getting admin users:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving admin users",
    });
  }
};

// Get single admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `Getting admin with ID: ${id}, requested by: ${req.admin.email}`
    );

    // Only super admin can view admin details
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access admin details",
      });
    }

    const admin = await Admin.findById(id).select(
      "-password -failedLoginAttempts -accountLocked -accountLockedUntil"
    );

    if (!admin) {
      console.log(`Admin not found with ID: ${id}`);
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    console.log(`Admin found: ${admin.email}`);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error getting admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving admin user",
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Only super admin can create admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can create admin users",
      });
    }

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        status: 409,
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const hashedPassword = await hashPassword(password);
    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    await newAdmin.save();

    // Return admin without sensitive data
    const adminResponse = {
      _id: newAdmin._id,
      fullName: newAdmin.fullName,
      email: newAdmin.email,
      role: newAdmin.role,
      phoneNumber: newAdmin.phoneNumber,
      createdAt: newAdmin.createdAt,
    };

    res.status(201).json({
      status: 201,
      success: true,
      message: "Admin user created successfully",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while creating admin user",
    });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Only super admin can update admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can update admin users",
      });
    }

    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    // Check email uniqueness if changing
    if (email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(409).json({
          status: 409,
          success: false,
          message: "Another admin with this email already exists",
        });
      }
    }

    // Update fields
    admin.fullName = fullName;
    admin.email = email;
    admin.role = role;
    admin.phoneNumber = phoneNumber;

    // Update password if provided
    if (password) {
      admin.password = await hashPassword(password);
    }

    await admin.save();

    // Return updated admin without sensitive data
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      phoneNumber: admin.phoneNumber,
      updatedAt: admin.updatedAt,
    };

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user updated successfully",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while updating admin user",
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Only super admin can delete admin users
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can delete admin users",
      });
    }

    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin user not found",
      });
    }

    // Prevent deletion of super admin
    if (admin.role === "super_admin") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Super admin users cannot be deleted",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while deleting admin user",
    });
  }
};

// Get all regular users (not admins)
export const getAllUsers = async (req, res) => {
  try {
    console.log("getAllUsers called by admin:", req.admin);

    // Only super admin can view user list
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access user list",
      });
    }

    // Extract query parameters
    const {
      page,
      limit,
      search,
      isVerified,
      isPaid,
      hasItems,
      sortBy,
      sortOrder,
    } = req.query;

    // Parse boolean parameters
    const parsedOptions = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      sortBy: sortBy || "fullName",
      sortOrder: sortOrder || "asc",
    };

    // Only add boolean filters if they're explicitly set
    if (isVerified !== undefined) {
      parsedOptions.isVerified = isVerified === "true";
    }

    if (isPaid !== undefined) {
      parsedOptions.isPaid = isPaid === "true";
    }

    if (hasItems !== undefined) {
      parsedOptions.hasItems = hasItems === "true";
    }

    // Get users from service
    const { users, pagination } = await getUsers(parsedOptions);

    // Get cart status for each user
    const usersWithCartStatus = await Promise.all(
      users.map(async (user) => {
        const cart = await Cart.findOne({ user: user._id });
        const userObj = user.toObject();
        userObj.cartStatus = cart ? cart.status : null;
        return userObj;
      })
    );

    // Return the enhanced user objects
    res.status(200).json({
      status: 200,
      success: true,
      message: "Users retrieved successfully",
      data: usersWithCartStatus,
      pagination,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving users",
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `Getting user with ID: ${id}, requested by: ${req.admin.email}`
    );

    // Only super admin can view user details
    if (req.admin.role !== "super_admin") {
      console.log("Access denied: Not a super admin");
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can access user details",
      });
    }

    // Fetch user with populated purchasedItems
    const user = await User.findById(id)
      .select(
        "-password -failedLoginAttempts -accountLocked -accountLockedUntil -verificationCode -verificationCodeValidation -forgotPasswordCode -forgotPasswordCodeValidation"
      )
      .populate({
        path: "purchasedItems.courses",
        select: "title thumbnail price",
      });

    if (!user) {
      console.log(`User not found with ID: ${id}`);
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    console.log(`User found: ${user.email}`);

    // Log the purchasedItems to see what's being returned
    console.log("User purchasedItems:", user.purchasedItems);

    res.status(200).json({
      status: 200,
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving user",
    });
  }
};

// mark cart complete
export const markCartComplete = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify super admin permission
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can complete purchases",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    // Find the user's cart with more detailed course info
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "courses.courseId",
        select: "title price slug description videoTrailer",
        model: "Course",
      });

    if (!cart || cart.courses.length === 0) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "User has no items in cart",
      });
    }

    if (cart.status !== "pending") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Only pending carts can be marked as completed",
      });
    }

    // Create a transaction record
    const transaction = new Transaction({
      user: userId,
      courses: cart.courses.map((course) => ({
        course: course.courseId._id,
        title: course.title,
        price: course.price,
        slug: course.slug,
      })),
      total: cart.total,
      status: "completed",
      pendingDate: cart.lastStatusUpdate,
      completedDate: new Date(),
    });

    await transaction.save();

    // Update user's purchasedItems
    for (const course of cart.courses) {
      // Check if this course is already in purchased items
      const existingCourseIndex = user.purchasedItems.courses.findIndex(
        (pc) =>
          pc.courseId &&
          pc.courseId.toString() === course.courseId._id.toString()
      );

      if (existingCourseIndex === -1) {
        // Course is not already purchased, add it with full details
        user.purchasedItems.courses.push({
          courseId: course.courseId._id,
          title: course.courseId.title,
          price: course.courseId.price,
          slug: course.courseId.slug,
          description: course.courseId.description,
          videoTrailer: course.courseId.videoTrailer, // Store the full videoTrailer object
          purchasedAt: new Date(),
        });
      }
    }

    await user.save();

    // Update cart status to completed, then clear it
    cart.status = "completed";
    cart.lastStatusUpdate = new Date();
    // Clear the cart items
    cart.courses = [];
    cart.total = 0;
    // Return it to active for future purchases
    cart.status = "active";
    await cart.save();

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Payment Confirmed - Your Purchase is Complete",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">Payment Confirmed!</h1>
            <p>Dear ${user.fullName},</p>
            <p>Your payment has been confirmed, and your purchase is now complete.</p>
            <p>You now have access to all your purchased items.</p>
            <h2>Purchase Summary:</h2>
            <p><strong>Total Amount:</strong> $${transaction.total.toFixed(
              2
            )}</p>
            <p>Thank you for your purchase!</p>
          </div>
        `,
      });
      console.log("Purchase confirmation email sent to:", user.email);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with successful response even if email fails
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Purchase completed successfully",
      data: {
        transaction,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while completing the purchase",
    });
  }
};

// Add function to get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify super admin permission
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can view user transactions",
      });
    }

    // Find transactions for this user
    const transactions = await Transaction.find({ user: userId }).sort(
      "-createdAt"
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "User transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error getting user transactions:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving user transactions",
    });
  }
};

// Add this function to get a user's cart
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify super admin permission
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Only super admin can view user cart",
      });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Cart not found for this user",
        data: { books: [], courses: [], total: 0 },
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "User cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error getting user cart:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while retrieving user cart",
    });
  }
};
