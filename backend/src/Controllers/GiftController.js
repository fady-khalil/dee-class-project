import Stripe from "stripe";
import GiftCode from "../Modules/GiftCode.model.js";
import Plan from "../Modules/Plan.model.js";
import User from "../Modules/User.model.js";

// Initialize Stripe lazily
let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("WARNING: STRIPE_SECRET_KEY not set. Stripe features will not work.");
      return null;
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

/**
 * Create Stripe Checkout Session for purchasing a gift code
 * POST /gift/purchase
 */
export const purchaseGiftCode = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const { user_id, plan_id, billing_cycle, success_url, cancel_url } = req.body;

    // Validate request
    if (!user_id || !plan_id || !billing_cycle) {
      return res.status(400).json({
        success: false,
        message: "User ID, Plan ID, and billing cycle are required",
      });
    }

    // Find user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active subscription (required to gift)
    if (!user.subscription || user.subscription.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "You need an active subscription to gift a plan",
      });
    }

    // Find plan
    const plan = await Plan.findById(plan_id);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    // Determine price and duration based on billing cycle
    const cycle = billing_cycle === "yearly" ? "yearly" : "monthly";
    const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const durationDays = cycle === "yearly" ? 365 : 30;

    // Check if user already has a Stripe customer ID
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;

      // Save customer ID to user
      await User.findByIdAndUpdate(user_id, {
        "subscription.stripeCustomerId": customerId,
      });
    }

    // Generate unique gift code
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = GiftCode.generateSecureCode();
      const existing = await GiftCode.findOne({ code });
      if (!existing) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique gift code",
      });
    }

    // URLs
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const successUrl = success_url || `${baseUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = cancel_url || `${baseUrl}/gift/cancelled`;

    // Create one-time payment checkout session (not subscription)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency?.toLowerCase() || "sar",
            product_data: {
              name: `Gift: ${plan.title} (${cycle === "yearly" ? "1 Year" : "1 Month"})`,
              description: `Gift a ${plan.title} subscription to someone special`,
            },
            unit_amount: Math.round(price * 100), // Convert to smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment, not subscription
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "gift",
        userId: user._id.toString(),
        planId: plan._id.toString(),
        billingCycle: cycle,
        giftCode: code,
        durationDays: durationDays.toString(),
      },
      allow_promotion_codes: true,
    });

    // Create gift code record (pending until payment completes)
    const giftCode = new GiftCode({
      code,
      planId: plan._id,
      billingCycle: cycle,
      durationDays,
      purchasedBy: user._id,
      status: "pending",
      stripeSessionId: session.id,
      amountPaid: Math.round(price * 100),
      currency: plan.currency || "SAR",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year to redeem
    });

    await giftCode.save();

    return res.status(200).json({
      success: true,
      data: {
        checkout_url: session.url,
        session_id: session.id,
        gift_code: code, // Will only be valid after payment
      },
    });
  } catch (error) {
    console.error("Error creating gift checkout:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create gift checkout",
      error: error.message,
    });
  }
};

/**
 * Validate a gift code
 * POST /gift/validate
 */
export const validateGiftCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Gift code is required",
      });
    }

    // Find gift code
    const giftCode = await GiftCode.findOne({
      code: code.toUpperCase().trim(),
    }).populate("planId");

    if (!giftCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift code",
      });
    }

    // Check if already redeemed
    if (giftCode.status === "redeemed") {
      return res.status(400).json({
        success: false,
        message: "This gift code has already been redeemed",
      });
    }

    // Check if expired
    if (giftCode.status === "expired" || new Date() > giftCode.expiresAt) {
      // Update status if not already expired
      if (giftCode.status !== "expired") {
        giftCode.status = "expired";
        await giftCode.save();
      }
      return res.status(400).json({
        success: false,
        message: "This gift code has expired",
      });
    }

    // Check if payment was completed (status should be 'pending' for valid, paid codes)
    // Actually, we need to verify the Stripe payment was successful
    if (giftCode.stripeSessionId) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(giftCode.stripeSessionId);
          if (session.payment_status !== "paid") {
            return res.status(400).json({
              success: false,
              message: "This gift code payment was not completed",
            });
          }
        } catch (stripeError) {
          console.error("Error verifying gift payment:", stripeError);
          // Continue if Stripe verification fails
        }
      }
    }

    // Return gift code details
    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        plan: {
          id: giftCode.planId._id,
          title: giftCode.planId.title,
          title_ar: giftCode.planId.title_ar,
          description: giftCode.planId.description,
          description_ar: giftCode.planId.description_ar,
          features: giftCode.planId.features,
          features_ar: giftCode.planId.features_ar,
          profilesAllowed: giftCode.planId.profilesAllowed,
          canDownload: giftCode.planId.canDownload,
        },
        billingCycle: giftCode.billingCycle,
        durationDays: giftCode.durationDays,
        expiresAt: giftCode.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error validating gift code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate gift code",
      error: error.message,
    });
  }
};

/**
 * Redeem a gift code (activate plan on user's account)
 * POST /gift/redeem
 */
export const redeemGiftCode = async (req, res) => {
  try {
    const { code, user_id } = req.body;

    if (!code || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Gift code and user ID are required",
      });
    }

    // Find user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find gift code
    const giftCode = await GiftCode.findOne({
      code: code.toUpperCase().trim(),
    }).populate("planId");

    if (!giftCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift code",
      });
    }

    // Check if already redeemed
    if (giftCode.status === "redeemed") {
      return res.status(400).json({
        success: false,
        message: "This gift code has already been redeemed",
      });
    }

    // Check if expired
    if (giftCode.status === "expired" || new Date() > giftCode.expiresAt) {
      if (giftCode.status !== "expired") {
        giftCode.status = "expired";
        await giftCode.save();
      }
      return res.status(400).json({
        success: false,
        message: "This gift code has expired",
      });
    }

    // Verify payment was completed
    if (giftCode.stripeSessionId) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(giftCode.stripeSessionId);
          if (session.payment_status !== "paid") {
            return res.status(400).json({
              success: false,
              message: "This gift code payment was not completed",
            });
          }
        } catch (stripeError) {
          console.error("Error verifying gift payment:", stripeError);
        }
      }
    }

    const plan = giftCode.planId;

    // Calculate new subscription period
    let newPeriodStart, newPeriodEnd;

    if (
      user.subscription?.status === "active" &&
      user.subscription?.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date()
    ) {
      // User has active plan - EXTEND it
      newPeriodStart = user.subscription.currentPeriodStart || new Date();
      newPeriodEnd = new Date(user.subscription.currentPeriodEnd);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + giftCode.durationDays);
      console.log(`Extending subscription for user ${user_id}: +${giftCode.durationDays} days`);
    } else {
      // User has no active plan - START new subscription
      newPeriodStart = new Date();
      newPeriodEnd = new Date();
      newPeriodEnd.setDate(newPeriodEnd.getDate() + giftCode.durationDays);
      console.log(`Starting new subscription for user ${user_id}: ${giftCode.durationDays} days`);
    }

    // Update user subscription
    await User.findByIdAndUpdate(user_id, {
      subscription: {
        planId: plan._id,
        status: "active",
        stripeCustomerId: user.subscription?.stripeCustomerId || null,
        stripeSubscriptionId: null, // Gift subscriptions don't have Stripe subscription
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        profilesAllowed: plan.profilesAllowed,
        canDownload: plan.canDownload,
        cancelAtPeriodEnd: false,
        isGift: true, // Mark as gifted subscription
        giftCodeUsed: giftCode.code,
      },
    });

    // Mark gift code as redeemed
    giftCode.status = "redeemed";
    giftCode.redeemedBy = user._id;
    giftCode.redeemedAt = new Date();
    await giftCode.save();

    // Get updated user data
    const updatedUser = await User.findById(user_id).populate("subscription.planId");

    return res.status(200).json({
      success: true,
      message: "Gift code redeemed successfully",
      data: {
        subscription: {
          status: "active",
          planId: plan._id,
          planTitle: plan.title,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          profilesAllowed: plan.profilesAllowed,
          canDownload: plan.canDownload,
        },
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          verified: updatedUser.verified,
          profiles: updatedUser.profiles,
          allowed_profiles: plan.profilesAllowed,
        },
      },
    });
  } catch (error) {
    console.error("Error redeeming gift code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to redeem gift code",
      error: error.message,
    });
  }
};

/**
 * Get user's purchased gift codes
 * GET /gift/my-gifts
 */
export const getMyGiftCodes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;

    const giftCodes = await GiftCode.find({ purchasedBy: userId })
      .populate("planId", "title title_ar")
      .populate("redeemedBy", "email fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: giftCodes.map((gc) => ({
        code: gc.code,
        plan: {
          id: gc.planId._id,
          title: gc.planId.title,
          title_ar: gc.planId.title_ar,
        },
        billingCycle: gc.billingCycle,
        durationDays: gc.durationDays,
        status: gc.status,
        purchasedAt: gc.createdAt,
        expiresAt: gc.expiresAt,
        redeemedBy: gc.redeemedBy
          ? {
              email: gc.redeemedBy.email,
              fullName: gc.redeemedBy.fullName,
            }
          : null,
        redeemedAt: gc.redeemedAt,
      })),
    });
  } catch (error) {
    console.error("Error getting gift codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get gift codes",
      error: error.message,
    });
  }
};

/**
 * Verify gift purchase after Stripe checkout
 * POST /gift/verify-purchase
 */
export const verifyGiftPurchase = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Find the gift code by session ID
    const giftCode = await GiftCode.findOne({ stripeSessionId: session_id }).populate("planId");

    if (!giftCode) {
      return res.status(404).json({
        success: false,
        message: "Gift code not found",
      });
    }

    // Update payment intent ID if available
    if (session.payment_intent && !giftCode.stripePaymentIntentId) {
      giftCode.stripePaymentIntentId = session.payment_intent;
      await giftCode.save();
    }

    return res.status(200).json({
      success: true,
      message: "Gift purchase verified",
      data: {
        code: giftCode.code,
        plan: {
          id: giftCode.planId._id,
          title: giftCode.planId.title,
          title_ar: giftCode.planId.title_ar,
        },
        billingCycle: giftCode.billingCycle,
        durationDays: giftCode.durationDays,
        expiresAt: giftCode.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error verifying gift purchase:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify gift purchase",
      error: error.message,
    });
  }
};
