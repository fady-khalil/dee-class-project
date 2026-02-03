import User from "../Modules/User.model.js";
import Plan from "../Modules/Plan.model.js";

/**
 * Get account info for the authenticated user
 * GET /api/:language/account/me
 */
export const getAccountInfo = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const language = req.params.language || "en";

    const user = await User.findById(userId).select(
      "fullName email phoneNumber verified subscription allowed_courses allowed_profiles"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: language === "ar" ? "المستخدم غير موجود" : "User not found",
      });
    }

    // Build response based on user state
    const accountInfo = {
      fullName: user.fullName || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      verified: user.verified || false,
      hasActivePlan: user.allowed_profiles > 0,
      hasPurchasedCourses: user.allowed_courses?.length > 0,
      allowedProfiles: user.allowed_profiles || 0,
      allowedCourses: user.allowed_courses || [],
    };

    // Add subscription info if user has active plan
    if (user.subscription && user.subscription.status === "active") {
      accountInfo.subscription = {
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd || false,
      };
    }

    return res.status(200).json({
      success: true,
      data: accountInfo,
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    const language = req.params.language || "en";
    return res.status(500).json({
      success: false,
      message:
        language === "ar"
          ? "حدث خطأ أثناء جلب معلومات الحساب"
          : "Error fetching account information",
    });
  }
};

/**
 * Update user profile (fullName, phoneNumber)
 * PUT /api/:language/account/me
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const language = req.params.language || "en";
    const { fullName, phoneNumber } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: language === "ar" ? "المستخدم غير موجود" : "User not found",
      });
    }

    // Check if user is verified before allowing profile updates
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message:
          language === "ar"
            ? "يرجى التحقق من بريدك الإلكتروني أولاً"
            : "Please verify your email first",
      });
    }

    // Validate fullName
    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message:
            language === "ar"
              ? "يجب أن يكون الاسم حرفين على الأقل"
              : "Name must be at least 2 characters",
        });
      }
      if (fullName.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message:
            language === "ar"
              ? "الاسم طويل جداً"
              : "Name is too long (max 100 characters)",
        });
      }
      user.fullName = fullName.trim();
    }

    // Validate phoneNumber (optional)
    if (phoneNumber !== undefined) {
      if (phoneNumber && typeof phoneNumber === "string") {
        // Basic phone validation - allow digits, spaces, +, -, ()
        const phoneRegex = /^[\d\s\+\-\(\)]{6,20}$/;
        if (!phoneRegex.test(phoneNumber.trim())) {
          return res.status(400).json({
            success: false,
            message:
              language === "ar"
                ? "رقم الهاتف غير صالح"
                : "Invalid phone number format",
          });
        }
        user.phoneNumber = phoneNumber.trim();
      } else if (phoneNumber === "" || phoneNumber === null) {
        user.phoneNumber = "";
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        language === "ar"
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully",
      data: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    const language = req.params.language || "en";
    return res.status(500).json({
      success: false,
      message:
        language === "ar"
          ? "حدث خطأ أثناء تحديث الملف الشخصي"
          : "Error updating profile",
    });
  }
};

/**
 * Get detailed subscription information
 * GET /api/:language/account/subscription
 */
export const getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const language = req.params.language || "en";

    const user = await User.findById(userId).select("subscription verified");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: language === "ar" ? "المستخدم غير موجود" : "User not found",
      });
    }

    // Check if user has an active subscription
    if (!user.subscription || user.subscription.status !== "active") {
      return res.status(200).json({
        success: true,
        data: {
          hasSubscription: false,
          message:
            language === "ar"
              ? "ليس لديك اشتراك نشط"
              : "You don't have an active subscription",
        },
      });
    }

    const subscription = user.subscription;

    // Fetch plan details if planId exists
    let planDetails = null;
    if (subscription.planId) {
      const plan = await Plan.findById(subscription.planId).select(
        "name nameAr description descriptionAr price features featuresAr interval"
      );
      if (plan) {
        planDetails = {
          name: language === "ar" ? plan.nameAr || plan.name : plan.name,
          description:
            language === "ar"
              ? plan.descriptionAr || plan.description
              : plan.description,
          price: plan.price,
          interval: plan.interval,
          features:
            language === "ar"
              ? plan.featuresAr || plan.features
              : plan.features,
        };
      }
    }

    // Calculate days remaining
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysRemaining = Math.max(
      0,
      Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))
    );

    const subscriptionData = {
      hasSubscription: true,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      daysRemaining,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      profilesAllowed: subscription.profilesAllowed || 1,
      canDownload: subscription.canDownload || false,
      plan: planDetails,
    };

    return res.status(200).json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    const language = req.params.language || "en";
    return res.status(500).json({
      success: false,
      message:
        language === "ar"
          ? "حدث خطأ أثناء جلب تفاصيل الاشتراك"
          : "Error fetching subscription details",
    });
  }
};
