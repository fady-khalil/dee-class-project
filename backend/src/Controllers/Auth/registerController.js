import { createUser } from "../../Services/crud/UserService.js";
import { authenticateUser } from "../../Services/crud/AuthService.js";
import { getMessage } from "../../utils/authMessages.js";

export const register = async (req, res) => {
  const lang = req.language || "en";

  try {
    // Validation already done in middleware
    const newUser = await createUser(req.validatedData);

    // Automatically authenticate the user after registration
    const { user, token } = await authenticateUser({
      email: req.validatedData.email,
      password: req.validatedData.password,
    });

    // Create a user response without purchasedItems
    const userResponse = {
      _id: user._id,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
    };

    // Calculate cookie expiration
    const expirationTime = 12 * 60 * 60 * 1000; // 12 hours

    // Set cookie and return response
    res
      .cookie("authorization", `Bearer ${token}`, {
        httpOnly: true,
        expires: new Date(Date.now() + expirationTime),
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: expirationTime,
      })
      .status(201)
      .json({
        status: 201,
        success: true,
        message: getMessage("register_success", lang),
        data: {
          token: token,
          user: userResponse,
        },
      });
  } catch (error) {
    if (error.message === "User already exists") {
      return res.status(409).json({
        status: 409,
        success: false,
        message: getMessage("user_already_exists", lang),
        data: null,
      });
    }

    // Log error for monitoring but don't expose details
    console.error("Registration error:", error);

    res.status(500).json({
      status: 500,
      success: false,
      message: getMessage("registration_error", lang),
    });
  }
};
