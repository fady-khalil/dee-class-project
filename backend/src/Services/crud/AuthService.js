import User from "../../Modules/User.model.js";
import { comparePasswords } from "../../utils/hashing.js";
import jwt from "jsonwebtoken";

export const authenticateUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user with necessary fields
  const user = await User.findOne({ email }).select(
    "+password +accountLocked +accountLockedUntil +failedLoginAttempts"
  );

  if (!user) {
    throw new Error("invalid_credentials");
  }

  // Check account lock status
  if (user.accountLocked) {
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.accountLockedUntil - new Date()) / (60 * 1000)
      );
      throw new Error(`account_locked:${remainingTime}`);
    } else {
      // Reset lock if expired
      user.accountLocked = false;
      user.failedLoginAttempts = 0;
      await user.save();
    }
  }

  // Verify password
  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    // Handle failed login
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.accountLocked = true;
      user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      throw new Error("account_locked:30");
    }

    await user.save();
    throw new Error("invalid_credentials");
  }

  // Reset failed attempts on success
  user.failedLoginAttempts = 0;
  await user.save();

  // Populate purchased items and subscription plan
  const populatedUser = await User.findById(user._id)
    .populate("purchasedItems.courses", "title thumbnail price")
    .populate("subscription.planId", "title title_ar profilesAllowed canDownload");

  // Check if subscription is active
  const hasActiveSubscription =
    populatedUser.subscription?.status === "active" &&
    populatedUser.subscription?.currentPeriodEnd &&
    new Date(populatedUser.subscription.currentPeriodEnd) > new Date();

  // Generate token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      verified: user.verified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  // Return user and token with subscription and profiles
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
      purchasedItems: populatedUser.purchasedItems,
      // Subscription data
      hasActiveSubscription,
      subscription: populatedUser.subscription
        ? {
            status: populatedUser.subscription.status,
            planId: populatedUser.subscription.planId?._id,
            planTitle: populatedUser.subscription.planId?.title,
            profilesAllowed: populatedUser.subscription.profilesAllowed,
            canDownload: populatedUser.subscription.canDownload,
            currentPeriodEnd: populatedUser.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: populatedUser.subscription.cancelAtPeriodEnd,
          }
        : null,
      // Profiles data
      profiles: populatedUser.profiles || [],
      allowedProfiles: hasActiveSubscription ? populatedUser.subscription?.profilesAllowed : 0,
    },
    token,
  };
};
