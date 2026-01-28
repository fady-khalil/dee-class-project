// Auth messages in English and Arabic
const authMessages = {
  // Register messages
  register_success: {
    en: "Your account has been created successfully",
    ar: "تم إنشاء حسابك بنجاح"
  },
  user_already_exists: {
    en: "User already exists",
    ar: "المستخدم موجود بالفعل"
  },
  registration_error: {
    en: "An error occurred during registration",
    ar: "حدث خطأ أثناء التسجيل"
  },

  // Login messages
  login_success: {
    en: "Logged in successfully",
    ar: "تم تسجيل الدخول بنجاح"
  },
  invalid_credentials: {
    en: "Invalid email or password",
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  },
  account_locked: {
    en: "Account locked due to too many failed login attempts. Please try again in {minutes} minutes",
    ar: "تم قفل الحساب بسبب محاولات تسجيل دخول فاشلة متعددة. يرجى المحاولة مرة أخرى بعد {minutes} دقيقة"
  },
  login_error: {
    en: "An error occurred during login",
    ar: "حدث خطأ أثناء تسجيل الدخول"
  },

  // Verification messages
  verification_code_sent: {
    en: "Verification code sent successfully",
    ar: "تم إرسال رمز التحقق بنجاح"
  },
  email_verified: {
    en: "Email verified successfully",
    ar: "تم التحقق من البريد الإلكتروني بنجاح"
  },
  user_not_found: {
    en: "User not found",
    ar: "المستخدم غير موجود"
  },
  already_verified: {
    en: "User already verified",
    ar: "المستخدم تم التحقق منه بالفعل"
  },
  email_send_failed: {
    en: "Failed to send verification code",
    ar: "فشل في إرسال رمز التحقق"
  },
  verification_error: {
    en: "An error occurred while sending verification code",
    ar: "حدث خطأ أثناء إرسال رمز التحقق"
  },
  code_not_found: {
    en: "Verification code not found. Please request a new code",
    ar: "رمز التحقق غير موجود. يرجى طلب رمز جديد"
  },
  code_expired: {
    en: "Verification code expired. Please request a new code",
    ar: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد"
  },
  invalid_code: {
    en: "Invalid verification code",
    ar: "رمز التحقق غير صالح"
  },
  verification_check_error: {
    en: "An error occurred during verification",
    ar: "حدث خطأ أثناء التحقق"
  },

  // Password messages
  password_changed: {
    en: "Password changed successfully",
    ar: "تم تغيير كلمة المرور بنجاح"
  },
  password_reset_code_sent: {
    en: "Password reset code sent to your email",
    ar: "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
  },
  password_reset_success: {
    en: "Password reset successfully",
    ar: "تم إعادة تعيين كلمة المرور بنجاح"
  },
  invalid_old_password: {
    en: "Invalid old password",
    ar: "كلمة المرور القديمة غير صحيحة"
  },
  password_same_as_old: {
    en: "New password cannot be the same as old password",
    ar: "كلمة المرور الجديدة لا يمكن أن تكون نفس كلمة المرور القديمة"
  },
  password_change_error: {
    en: "An error occurred while changing password",
    ar: "حدث خطأ أثناء تغيير كلمة المرور"
  },
  password_reset_error: {
    en: "An error occurred during password reset",
    ar: "حدث خطأ أثناء إعادة تعيين كلمة المرور"
  },
  user_not_verified: {
    en: "Please verify your email first",
    ar: "يرجى التحقق من بريدك الإلكتروني أولاً"
  },
  passwords_do_not_match: {
    en: "Passwords do not match",
    ar: "كلمات المرور غير متطابقة"
  },
  authentication_required: {
    en: "Authentication required",
    ar: "يجب تسجيل الدخول"
  },
  verification_required_password: {
    en: "Email verification required to change password",
    ar: "يجب التحقق من البريد الإلكتروني لتغيير كلمة المرور"
  },
  password_reset_code_sent_generic: {
    en: "If the email is registered, a verification code has been sent",
    ar: "إذا كان البريد الإلكتروني مسجلاً، فقد تم إرسال رمز التحقق"
  },
  verification_successful_set_password: {
    en: "Verification successful. You can now set a new password.",
    ar: "تم التحقق بنجاح. يمكنك الآن تعيين كلمة مرور جديدة."
  },
  no_code_found: {
    en: "No verification code found. Please request a new one.",
    ar: "لم يتم العثور على رمز التحقق. يرجى طلب رمز جديد."
  },

  // Logout
  logout_success: {
    en: "Logged out successfully",
    ar: "تم تسجيل الخروج بنجاح"
  },
  already_logged_out: {
    en: "Already logged out",
    ar: "تم تسجيل الخروج بالفعل"
  },
  logout_error: {
    en: "An error occurred during logout",
    ar: "حدث خطأ أثناء تسجيل الخروج"
  },

  // General
  server_error: {
    en: "Internal server error",
    ar: "خطأ في الخادم"
  }
};

/**
 * Get message by key and language
 * @param {string} key - Message key
 * @param {string} language - Language code (en/ar)
 * @param {object} params - Optional parameters to replace in message
 * @returns {string} - Translated message
 */
export const getMessage = (key, language = "en", params = {}) => {
  const lang = language === "ar" ? "ar" : "en";
  let message = authMessages[key]?.[lang] || authMessages[key]?.en || key;

  // Replace parameters in message (e.g., {minutes})
  Object.keys(params).forEach((param) => {
    message = message.replace(`{${param}}`, params[param]);
  });

  return message;
};

export default authMessages;
