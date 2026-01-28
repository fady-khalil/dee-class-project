import Cart from "../Modules/Cart.model.js";
import Course from "../Modules/Course.model.js";
import User from "../Modules/User.model.js";
import { transformToLanguage } from "../utils/languageUtils.js";

// Helper function to check if user is verified
const checkUserVerified = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found",
      };
    }

    if (!user.verified) {
      return {
        success: false,
        status: 403,
        message:
          "Account not verified. Please verify your account before proceeding.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking user verification:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to check user verification status",
    };
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    // Debug user information
    console.log("Auth user object in getCart:", req.user);

    // Extract user ID based on your JWT structure
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      console.log("User object structure:", req.user);
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication data",
      });
    }

    // Check if user is verified
    const verificationCheck = await checkUserVerified(userId);
    if (!verificationCheck.success) {
      return res.status(verificationCheck.status).json({
        success: false,
        message: verificationCheck.message,
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      try {
        cart = new Cart({
          user: userId,
          courses: [],
          total: 0,
        });
        await cart.save();
        console.log("Created new cart for user:", userId);
      } catch (saveError) {
        console.error("Error saving new cart:", saveError);
        return res.status(500).json({
          success: false,
          message: "Failed to create new cart",
          error: saveError.message,
        });
      }
    }

    // Populate more details if needed
    let populatedCart = await Cart.findOne({ user: userId })
      .populate({
        path: "courses.courseId",
        select: "name slug price image category translations",
      });

    // Get language from request (default to 'en')
    const language = req.language || "en";

    // Format the response to have flattened structure
    if (populatedCart) {
      const formattedCart = populatedCart.toObject();

      // Process courses to extract image and transform to language
      formattedCart.courses = await Promise.all(
        formattedCart.courses.map(async (course) => {
          let courseCopy = { ...course };
          if (course.courseId) {
            // Transform course to selected language
            courseCopy = {
              ...courseCopy,
              ...transformToLanguage(course.courseId, language),
            };
            // Extract image
            if (course.courseId.image) {
              courseCopy.image =
                course.courseId.image.data ||
                course.courseId.image.filename ||
                "";
            }
          }
          delete courseCopy.courseId;
          return courseCopy;
        })
      );

      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        data: formattedCart,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve cart",
      error: error.message,
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    // Debug the req.user object
    console.log("Auth user object:", JSON.stringify(req.user));

    // Check what properties exist on the user object
    if (req.user) {
      console.log("User object keys:", Object.keys(req.user));
    }

    // Determine which ID field to use - try multiple possibilities
    let userId;
    if (req.user?.id) {
      userId = req.user.id;
      console.log("Using req.user.id:", userId);
    } else if (req.user?._id) {
      userId = req.user._id;
      console.log("Using req.user._id:", userId);
    } else if (req.user?.userId) {
      userId = req.user.userId;
      console.log("Using req.user.userId:", userId);
    } else if (typeof req.user === "object") {
      // If user is directly the ID or has another property structure
      console.log("User object is:", req.user);
      // Try the first key as a last resort
      const firstKey = Object.keys(req.user)[0];
      userId = req.user[firstKey];
      console.log(`Using req.user.${firstKey}:`, userId);
    } else if (req.user) {
      // If user itself is the ID (string/primitive)
      userId = req.user;
      console.log("Using req.user directly:", userId);
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed - could not determine user ID",
      });
    }

    // Check if user is verified
    const verificationCheck = await checkUserVerified(userId);
    if (!verificationCheck.success) {
      return res.status(verificationCheck.status).json({
        success: false,
        message: verificationCheck.message,
      });
    }

    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = new Cart({
        user: userId,
        courses: [],
        total: 0,
      });
    }

    // Check if course already in cart
    const isCourseInCart = cart.courses.some(
      (course) => course.slug === slug
    );
    if (isCourseInCart) {
      return res.status(400).json({
        success: false,
        message: "This course is already in your cart",
      });
    }

    // Find course
    const item = await Course.findOne({ slug });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Extract image data for cleaner structure
    const imageData = item.image
      ? item.image.data || item.image.filename || ""
      : "";

    // Add course to cart
    cart.courses.push({
      courseId: item._id,
      title: item.name,
      price: item.price,
      slug: item.slug,
      image: imageData,
    });

    // Save cart (total will be calculated in pre-save hook)
    await cart.save();

    // Retrieve the updated cart with populated fields
    let updatedCart = await Cart.findOne({ user: userId })
      .populate({
        path: "courses.courseId",
        select: "name slug price image",
      });

    // Format the response to have flattened structure with all necessary data
    const formattedCart = updatedCart.toObject();

    // Process courses to extract image
    formattedCart.courses = await Promise.all(
      formattedCart.courses.map(async (course) => {
        const courseCopy = { ...course };

        // Extract image from courseId if available
        if (course.courseId) {
          if (course.courseId.image) {
            courseCopy.image =
              course.courseId.image.data ||
              course.courseId.image.filename ||
              "";
          }
        }

        // Remove the nested courseId object to flatten structure
        delete courseCopy.courseId;

        return courseCopy;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Course added to cart successfully",
      data: formattedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    // Extract user ID based on your JWT structure
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication data",
      });
    }

    // Check if user is verified
    const verificationCheck = await checkUserVerified(userId);
    if (!verificationCheck.success) {
      return res.status(verificationCheck.status).json({
        success: false,
        message: verificationCheck.message,
      });
    }

    // Log the parameters to help debug
    console.log("Remove params:", req.params);
    console.log("User ID:", userId);

    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });
    console.log("Found cart:", cart ? "Yes" : "No");

    if (!cart) {
      // If no cart, create a new empty one
      const newCart = new Cart({
        user: userId,
        courses: [],
        total: 0,
      });
      await newCart.save();

      return res.status(200).json({
        success: true,
        message: "Created new cart, no items to remove",
        data: newCart,
      });
    }

    // Log the current items
    console.log("Current courses in cart:", cart.courses);

    // Find the item to remove
    const itemIndex = cart.courses.findIndex((item) => item.slug === slug);
    console.log("Item index:", itemIndex);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Course with slug "${slug}" not found in cart`,
      });
    }

    // Remove the item
    cart.courses.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    // Fetch the updated cart with populated fields to return consistent response
    let updatedCart = await Cart.findOne({ user: userId })
      .populate({
        path: "courses.courseId",
        select: "name slug price image",
      });

    // Format the response to have flattened structure with all necessary data
    const formattedCart = updatedCart.toObject();

    // Process courses to extract image
    formattedCart.courses = await Promise.all(
      formattedCart.courses.map(async (course) => {
        const courseCopy = { ...course };

        // Extract image from courseId if available
        if (course.courseId) {
          if (course.courseId.image) {
            courseCopy.image =
              course.courseId.image.data ||
              course.courseId.image.filename ||
              "";
          }
        }

        // Remove the nested courseId object to flatten structure
        delete courseCopy.courseId;

        return courseCopy;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Course removed from cart successfully",
      data: formattedCart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    // Extract user ID based on your JWT structure
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      console.log("User object:", req.user);
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication data",
      });
    }

    // Check if user is verified
    const verificationCheck = await checkUserVerified(userId);
    if (!verificationCheck.success) {
      return res.status(verificationCheck.status).json({
        success: false,
        message: verificationCheck.message,
      });
    }

    console.log("Clearing cart for user:", userId);

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create a new empty one
    if (!cart) {
      cart = new Cart({
        user: userId,
        courses: [],
        total: 0,
      });

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Created new empty cart",
        data: cart,
      });
    }

    // Clear the cart items
    cart.courses = [];
    cart.total = 0;

    // Save the cleared cart
    await cart.save();

    // Return the formatted empty cart
    const formattedCart = cart.toObject();
    formattedCart.courses = [];

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: formattedCart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
