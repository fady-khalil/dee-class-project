import Stripe from "stripe";
import User from "../Modules/User.model.js";
import Plan from "../Modules/Plan.model.js";
import Course from "../Modules/Course.model.js";

// Initialize Stripe lazily to ensure env vars are loaded
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
 * Create Stripe Checkout Session for subscription or single course purchase
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
      });
    }

    const { type, user_id, id, source, success_url, cancel_url, billingCycle } = req.body;

    // Validate request
    if (!user_id || !id) {
      return res.status(400).json({
        success: false,
        message: "User ID and ID are required",
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

    // Use URLs from frontend or fallback to defaults
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3001";

    // Handle different purchase types
    if (type === "course") {
      // Single course purchase (one-time payment)
      return await createCourseCheckoutSession(
        stripe,
        user,
        customerId,
        id,
        source,
        success_url,
        cancel_url,
        baseUrl,
        res
      );
    } else {
      // Subscription plan purchase
      return await createPlanCheckoutSession(
        stripe,
        user,
        customerId,
        id,
        source,
        success_url,
        cancel_url,
        baseUrl,
        billingCycle,
        res
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

/**
 * Create checkout session for single course purchase
 */
async function createCourseCheckoutSession(
  stripe,
  user,
  customerId,
  courseId,
  source,
  success_url,
  cancel_url,
  baseUrl,
  res
) {
  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if user already purchased this course
  const alreadyPurchased = user.purchasedItems?.courses?.some(
    (c) => c.courseId?.toString() === courseId
  );
  if (alreadyPurchased) {
    return res.status(400).json({
      success: false,
      message: "You have already purchased this course",
    });
  }

  const successUrl =
    success_url ||
    `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=course&source=${source || "website"}`;
  const cancelUrl = cancel_url || `${baseUrl}/payment-cancelled`;

  // Create one-time payment checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "sar",
          product_data: {
            name: course.name,
            description: course.description?.substring(0, 500) || "Course purchase",
          },
          unit_amount: Math.round(course.price * 100), // Convert to cents/halalas
        },
        quantity: 1,
      },
    ],
    mode: "payment", // One-time payment, not subscription
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "course",
      userId: user._id.toString(),
      courseId: course._id.toString(),
      source: source || "website",
    },
    allow_promotion_codes: true,
  });

  return res.status(200).json({
    success: true,
    data: {
      checkout_url: session.url,
      session_id: session.id,
    },
  });
}

/**
 * Create checkout session for subscription plan
 */
async function createPlanCheckoutSession(
  stripe,
  user,
  customerId,
  planId,
  source,
  success_url,
  cancel_url,
  baseUrl,
  billingCycle,
  res
) {
  // Default to monthly if not specified
  const cycle = billingCycle === "yearly" ? "yearly" : "monthly";

  // Find plan
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) {
    return res.status(404).json({
      success: false,
      message: "Plan not found or inactive",
    });
  }

  // Get the correct Stripe Price ID based on billing cycle
  const stripePriceId = cycle === "yearly" ? plan.yearlyStripePriceId : plan.monthlyStripePriceId;
  if (!stripePriceId) {
    return res.status(400).json({
      success: false,
      message: `No ${cycle} pricing configured for this plan`,
    });
  }

  const successUrl =
    success_url ||
    `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=plan&source=${source || "website"}`;
  const cancelUrl = cancel_url || `${baseUrl}/payment-cancelled`;

  // Create subscription checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "plan",
      userId: user._id.toString(),
      planId: plan._id.toString(),
      billingCycle: cycle,
      source: source || "website",
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
        billingCycle: cycle,
      },
    },
    allow_promotion_codes: true,
  });

  return res.status(200).json({
    success: true,
    data: {
      checkout_url: session.url,
      session_id: session.id,
    },
  });
}

/**
 * Handle Stripe Webhooks
 */
export const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutComplete(session) {
  const stripe = getStripe();
  console.log("Checkout completed:", session.id);

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error("Missing userId or planId in session metadata");
    return;
  }

  // Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Get the plan details
  const plan = await Plan.findById(planId);
  if (!plan) {
    console.error("Plan not found:", planId);
    return;
  }

  // Update user subscription
  await User.findByIdAndUpdate(userId, {
    subscription: {
      planId: plan._id,
      status: "active",
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      profilesAllowed: plan.profilesAllowed,
      canDownload: plan.canDownload,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`User ${userId} subscribed to plan ${planId}`);
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription) {
  console.log("Subscription updated:", subscription.id);

  // Find user by subscription ID
  const user = await User.findOne({
    "subscription.stripeSubscriptionId": subscription.id,
  });

  if (!user) {
    console.error("User not found for subscription:", subscription.id);
    return;
  }

  // Map Stripe status to our status
  let status = "active";
  if (subscription.status === "canceled") {
    status = "cancelled";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  } else if (subscription.status === "unpaid") {
    status = "expired";
  }

  // Update subscription details
  await User.findByIdAndUpdate(user._id, {
    "subscription.status": status,
    "subscription.currentPeriodStart": new Date(subscription.current_period_start * 1000),
    "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
    "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
  });

  console.log(`Updated subscription for user ${user._id}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription) {
  console.log("Subscription deleted:", subscription.id);

  // Find user by subscription ID
  const user = await User.findOne({
    "subscription.stripeSubscriptionId": subscription.id,
  });

  if (!user) {
    console.error("User not found for subscription:", subscription.id);
    return;
  }

  // Mark subscription as cancelled/expired
  await User.findByIdAndUpdate(user._id, {
    "subscription.status": "expired",
    "subscription.cancelAtPeriodEnd": false,
  });

  console.log(`Subscription expired for user ${user._id}`);
}

/**
 * Handle invoice.paid (subscription renewal)
 */
async function handleInvoicePaid(invoice) {
  const stripe = getStripe();
  console.log("Invoice paid:", invoice.id);

  if (!invoice.subscription) return;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

  // Find user by subscription ID
  const user = await User.findOne({
    "subscription.stripeSubscriptionId": subscription.id,
  });

  if (!user) {
    console.error("User not found for subscription:", subscription.id);
    return;
  }

  // Update subscription period
  await User.findByIdAndUpdate(user._id, {
    "subscription.status": "active",
    "subscription.currentPeriodStart": new Date(subscription.current_period_start * 1000),
    "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
  });

  console.log(`Subscription renewed for user ${user._id}`);
}

/**
 * Handle invoice.payment_failed
 */
async function handlePaymentFailed(invoice) {
  console.log("Payment failed:", invoice.id);

  if (!invoice.subscription) return;

  // Find user by customer ID
  const user = await User.findOne({
    "subscription.stripeCustomerId": invoice.customer,
  });

  if (!user) {
    console.error("User not found for customer:", invoice.customer);
    return;
  }

  // Mark subscription as past_due
  await User.findByIdAndUpdate(user._id, {
    "subscription.status": "past_due",
  });

  console.log(`Payment failed for user ${user._id}`);

  // TODO: Send email notification to user about failed payment
}

/**
 * Verify checkout session and update user subscription (alternative to webhook)
 */
export const verifyCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const { session_id, user_id } = req.body;

    if (!session_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID and User ID are required",
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    // Verify payment was successful
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Get plan from metadata
    const planId = session.metadata?.planId;
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan information not found",
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const subscription = session.subscription;

    // Handle dates properly - Stripe returns Unix timestamps
    const periodStart = subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : new Date();
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Update user subscription
    await User.findByIdAndUpdate(user_id, {
      subscription: {
        planId: plan._id,
        status: "active",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        profilesAllowed: plan.profilesAllowed,
        canDownload: plan.canDownload,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully",
    });
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify checkout session",
      error: error.message,
    });
  }
};

/**
 * Refresh user data after payment (called from frontend)
 */
export const refreshUserData = async (req, res) => {
  try {
    const { user_id, session_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // If session_id provided, verify and update based on payment type
    if (session_id) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["subscription"],
          });

          if (session.payment_status === "paid") {
            const paymentType = session.metadata?.type;

            if (paymentType === "course") {
              // Handle course purchase
              const courseId = session.metadata?.courseId;
              if (courseId) {
                // Check if course already in purchased items
                const user = await User.findById(user_id);
                const alreadyPurchased = user?.purchasedItems?.courses?.some(
                  (c) => c.courseId?.toString() === courseId
                );

                if (!alreadyPurchased) {
                  // Add course to user's purchased items
                  await User.findByIdAndUpdate(user_id, {
                    $push: {
                      "purchasedItems.courses": {
                        courseId: courseId,
                        purchasedAt: new Date(),
                        stripeSessionId: session_id,
                      },
                    },
                  });
                  console.log("Course purchase added successfully:", courseId);
                }
              }
            } else if (session.subscription) {
              // Handle subscription plan
              const planId = session.metadata?.planId;
              const plan = planId ? await Plan.findById(planId) : null;
              const subscription = session.subscription;

              // Debug log
              console.log("Subscription object:", JSON.stringify(subscription, null, 2));

              if (plan) {
                // Handle dates properly - Stripe returns Unix timestamps
                const periodStart = subscription.current_period_start
                  ? new Date(subscription.current_period_start * 1000)
                  : new Date();
                const periodEnd = subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000)
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

                await User.findByIdAndUpdate(user_id, {
                  subscription: {
                    planId: plan._id,
                    status: "active",
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: subscription.id,
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                    profilesAllowed: plan.profilesAllowed,
                    canDownload: plan.canDownload,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
                  },
                });
                console.log("User subscription updated successfully");
              }
            }
          }
        } catch (stripeError) {
          console.error("Error verifying session:", stripeError.message);
          // Continue to return user data even if verification fails
        }
      }
    }

    const user = await User.findById(user_id).populate("subscription.planId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format user data for mobile/web
    const mobileUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      verified: user.verified,
      allowed_profiles: user.subscription?.status === "active" ? user.subscription.profilesAllowed : null,
      allowed_courses: user.purchasedItems?.courses?.map((c) => c.courseId?.toString()) || [],
      profiles: user.profiles || [],
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            planId: user.subscription.planId?._id,
            planTitle: user.subscription.planId?.title,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            canDownload: user.subscription.canDownload,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      data: {
        mobile_user: mobileUser,
      },
    });
  } catch (error) {
    console.error("Error refreshing user data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh user data",
      error: error.message,
    });
  }
};

/**
 * Get user's subscription status
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;

    const user = await User.findById(userId).populate("subscription.planId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.subscription?.status || user.subscription.status === "expired") {
      return res.status(200).json({
        success: true,
        data: {
          hasSubscription: false,
          subscription: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasSubscription: user.subscription.status === "active",
        subscription: {
          status: user.subscription.status,
          plan: user.subscription.planId
            ? {
                id: user.subscription.planId._id,
                title: user.subscription.planId.title,
                profilesAllowed: user.subscription.planId.profilesAllowed,
                canDownload: user.subscription.planId.canDownload,
              }
            : null,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        },
      },
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subscription status",
      error: error.message,
    });
  }
};

/**
 * Cancel subscription (user request)
 */
export const cancelSubscription = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    const user = await User.findById(userId);

    if (!user || !user.subscription?.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Cancel at period end (user keeps access until subscription expires)
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user record
    await User.findByIdAndUpdate(userId, {
      "subscription.cancelAtPeriodEnd": true,
    });

    res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at the end of the billing period",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

/**
 * Create customer portal session (for managing subscription)
 */
export const createPortalSession = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    const user = await User.findById(userId);

    if (!user || !user.subscription?.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    res.status(200).json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create portal session",
      error: error.message,
    });
  }
};
