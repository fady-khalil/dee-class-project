import Plan from "../Modules/Plan.model.js";
import FAQ from "../Modules/FAQ.model.js";

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all active plans (public)
 * Used by frontend to display available plans
 */
export const getActivePlans = async (req, res) => {
  try {
    const language = req.language || "en";

    const plans = await Plan.find({ isActive: true }).sort({ order: 1 });

    // Format response based on language (matching frontend expected format)
    const formattedPlans = plans.map((plan) => ({
      id: plan._id,
      name: language === "ar" ? plan.title_ar : plan.title,
      title: language === "ar" ? plan.title_ar : plan.title,
      description: language === "ar" ? plan.description_ar : plan.description,
      // Monthly pricing
      monthlyPrice: plan.monthlyPrice,
      monthlyPriceFormatted: `${plan.monthlyPrice} ${plan.currency}`,
      monthlyStripePriceId: plan.monthlyStripePriceId,
      // Yearly pricing
      yearlyPrice: plan.yearlyPrice,
      yearlyPriceFormatted: `${plan.yearlyPrice} ${plan.currency}`,
      yearlyStripePriceId: plan.yearlyStripePriceId,
      // Common fields
      currency: plan.currency,
      features: language === "ar" ? plan.features_ar : plan.features,
      profilesAllowed: plan.profilesAllowed,
      canDownload: plan.canDownload,
      isPopular: plan.isPopular,
    }));

    // Get FAQ items
    let faqItems = [];
    const faqDoc = await FAQ.findOne({ singleton: "faq" }).lean();
    if (faqDoc?.items) {
      faqItems = faqDoc.items
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          _id: item._id,
          question: language === "ar" ? item.question_ar || item.question : item.question,
          answer: language === "ar" ? item.answer_ar || item.answer : item.answer,
        }));
    }

    res.status(200).json({
      success: true,
      data: {
        packages: formattedPlans,
        faq: faqItems,
      },
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all plans (admin)
 */
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

/**
 * Get single plan (admin)
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
};

/**
 * Create new plan (admin)
 */
export const createPlan = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      description,
      description_ar,
      monthlyPrice,
      monthlyStripePriceId,
      yearlyPrice,
      yearlyStripePriceId,
      currency,
      features,
      features_ar,
      profilesAllowed,
      canDownload,
      isActive,
      order,
      isPopular,
    } = req.body;

    // Validate required fields
    if (!title || !title_ar || !monthlyPrice || !monthlyStripePriceId || !yearlyPrice || !yearlyStripePriceId) {
      return res.status(400).json({
        success: false,
        message: "Title, Arabic title, monthly price, monthly Stripe Price ID, yearly price, and yearly Stripe Price ID are required",
      });
    }

    // Check if any stripePriceId already exists
    const existingPlan = await Plan.findOne({
      $or: [
        { monthlyStripePriceId },
        { yearlyStripePriceId },
      ],
    });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "A plan with one of these Stripe Price IDs already exists",
      });
    }

    const plan = new Plan({
      title,
      title_ar,
      description: description || "",
      description_ar: description_ar || "",
      monthlyPrice,
      monthlyStripePriceId,
      yearlyPrice,
      yearlyStripePriceId,
      currency: currency || "SAR",
      features: features || [],
      features_ar: features_ar || [],
      profilesAllowed: profilesAllowed || 1,
      canDownload: canDownload || false,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      isPopular: isPopular || false,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message,
    });
  }
};

/**
 * Update plan (admin)
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove _id from update data if present
    delete updateData._id;

    // If stripePriceId is being updated, check for duplicates
    if (updateData.monthlyStripePriceId || updateData.yearlyStripePriceId) {
      const orConditions = [];
      if (updateData.monthlyStripePriceId) {
        orConditions.push({ monthlyStripePriceId: updateData.monthlyStripePriceId });
      }
      if (updateData.yearlyStripePriceId) {
        orConditions.push({ yearlyStripePriceId: updateData.yearlyStripePriceId });
      }

      const existingPlan = await Plan.findOne({
        $or: orConditions,
        _id: { $ne: id },
      });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: "A plan with one of these Stripe Price IDs already exists",
        });
      }
    }

    const plan = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message,
    });
  }
};

/**
 * Delete plan (admin)
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
};

/**
 * Toggle plan active status (admin)
 */
export const togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"} successfully`,
      data: plan,
    });
  } catch (error) {
    console.error("Error toggling plan status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle plan status",
      error: error.message,
    });
  }
};

/**
 * Reorder plans (admin)
 */
export const reorderPlans = async (req, res) => {
  try {
    const { planOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(planOrders)) {
      return res.status(400).json({
        success: false,
        message: "planOrders must be an array",
      });
    }

    // Update each plan's order
    const updatePromises = planOrders.map(({ id, order }) =>
      Plan.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Plans reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder plans",
      error: error.message,
    });
  }
};
