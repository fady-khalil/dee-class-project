import User from "../../Modules/User.model.js";
import { hmacProcess } from "../../utils/hashing.js";
import transporter from "../../middlewares/SendMail.js";

export const generateAndSendVerificationCode = async (email) => {
  try {
    // Find the user
    const user = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      throw new Error("user_not_found");
    }

    // Check if already verified
    if (user.verified) {
      throw new Error("already_verified");
    }

    // Generate a 6-digit code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Hash the code for security
    const hashedCode = hmacProcess(verificationCode, process.env.HMAC_SECRET);

    // Save to user record
    user.verificationCode = hashedCode;
    user.verificationCodeExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email with verification code
    const mailResult = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${verificationCode}\nThis code will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thanks for registering! Please use the following code to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in 30 minutes.</p>
        </div>
      `,
    });

    if (!mailResult) {
      throw new Error("email_send_failed");
    }

    return true;
  } catch (error) {
    // Rethrow so controller can handle specific errors
    throw error;
  }
};

export const verifyEmailCode = async (email, code) => {
  try {
    // Find the user
    const user = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      throw new Error("user_not_found");
    }

    // Check if already verified
    if (user.verified) {
      throw new Error("already_verified");
    }

    // Check if verification code exists
    if (!user.verificationCode) {
      throw new Error("code_not_found");
    }

    // Check if code is expired
    if (Date.now() > user.verificationCodeExpires) {
      throw new Error("code_expired");
    }

    // Verify the code
    const hashedProvidedCode = hmacProcess(code, process.env.HMAC_SECRET);
    if (hashedProvidedCode !== user.verificationCode) {
      throw new Error("invalid_code");
    }

    // Code is valid, mark email as verified
    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return true;
  } catch (error) {
    // Rethrow for controller
    throw error;
  }
};
