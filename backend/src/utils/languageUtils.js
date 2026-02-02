/**
 * Utility functions for handling multi-language data
 */
import { DEFAULT_LANGUAGE } from "../middlewares/languageMiddleware.js";

/**
 * Transforms a MongoDB document with translations to include only the requested language
 * For client-facing APIs
 *
 * @param {Object} document - The MongoDB document with translations
 * @param {String} language - The requested language code (en, ar)
 * @returns {Object} - Document with only the requested language fields
 */
export const transformToLanguage = (document, language = DEFAULT_LANGUAGE) => {
  if (!document) return null;

  // Convert to plain object if it's a mongoose document
  const doc = document.toObject ? document.toObject() : { ...document };

  // If no translations field exists, return the document as is (legacy support)
  if (!doc.translations) return doc;

  // Get the requested language translations or fall back to default language
  const languageData =
    doc.translations[language] || doc.translations[DEFAULT_LANGUAGE] || {};

  // Create a new object with non-translatable fields and the language-specific fields
  const transformed = { ...doc };
  delete transformed.translations; // Remove the translations object

  // Merge language-specific fields into the root of the transformed object
  return { ...transformed, ...languageData };
};

/**
 * Transforms an array of documents to include only the requested language
 *
 * @param {Array} documents - Array of MongoDB documents with translations
 * @param {String} language - The requested language code
 * @returns {Array} - Documents with only the requested language fields
 */
export const transformArrayToLanguage = (
  documents,
  language = DEFAULT_LANGUAGE
) => {
  if (!documents || !Array.isArray(documents)) return [];

  return documents.map((doc) => transformToLanguage(doc, language));
};

/**
 * Creates a translations object for a new document from request body
 * Used when creating or updating documents
 *
 * @param {Object} body - Request body with fields for both languages
 * @param {Array} translatableFields - Array of field names that can be translated
 * @returns {Object} - Object with translations field structured for MongoDB
 */
export const createTranslationsObject = (body, translatableFields) => {
  // Create translations object
  const translations = {
    en: {},
    ar: {},
  };

  // Add each translatable field to the appropriate language object
  translatableFields.forEach((field) => {
    // English fields
    if (body[field]) {
      translations.en[field] = body[field];
    }

    // Arabic fields with _ar suffix
    if (body[`${field}_ar`]) {
      translations.ar[field] = body[`${field}_ar`];
    } else {
      // If Arabic translation not provided, use English as fallback
      translations.ar[field] = body[field] || "";
    }
  });

  return { translations };
};

/**
 * Extracts non-translatable fields from request body
 *
 * @param {Object} body - Request body
 * @param {Array} translatableFields - Array of field names that can be translated
 * @returns {Object} - Object with non-translatable fields
 */
export const extractNonTranslatableFields = (body, translatableFields) => {
  const nonTranslatable = { ...body };

  // Remove translatable fields and their _ar variants
  translatableFields.forEach((field) => {
    delete nonTranslatable[field];
    delete nonTranslatable[`${field}_ar`];
  });

  return nonTranslatable;
};

/**
 * Translates API response messages based on language
 *
 * @param {String} message - The message to translate
 * @param {String} language - The language code (en, ar)
 * @returns {String} - Translated message
 */
export const translateApiMessage = (message, language = DEFAULT_LANGUAGE) => {
  // Handle messages with dynamic variables
  // Check for account locked message which contains minutes variable
  if (
    message.startsWith("Account locked due to too many failed login attempts")
  ) {
    const minutesMatch = message.match(/(\d+)/);
    const minutes = minutesMatch ? minutesMatch[1] : "";

    const baseMessage =
      "Account locked due to too many failed login attempts. Please try again in X minutes.";
    const translated =
      language === "ar"
        ? `تم قفل الحساب بسبب محاولات تسجيل الدخول الفاشلة المتكررة. يرجى المحاولة مرة أخرى بعد ${minutes} دقائق.`
        : `Account locked due to too many failed login attempts. Please try again in ${minutes} minutes.`;

    return translated;
  }

  // Message translations dictionary
  const messageTranslations = {
    // General messages
    "Internal Server Error": {
      en: "Internal Server Error",
      ar: "خطأ داخلي في الخادم",
    },
    "Not Found": {
      en: "Not Found",
      ar: "غير موجود",
    },
    Success: {
      en: "Success",
      ar: "نجاح",
    },
    Failed: {
      en: "Failed",
      ar: "فشل",
    },
    Unauthorized: {
      en: "Unauthorized",
      ar: "غير مصرح",
    },
    "Bad Request": {
      en: "Bad Request",
      ar: "طلب غير صالح",
    },

    // Book Category messages
    "Documents retrieved successfully": {
      en: "Documents retrieved successfully",
      ar: "تم استرجاع المستندات بنجاح",
    },
    "Category created successfully": {
      en: "Category created successfully",
      ar: "تم إنشاء الفئة بنجاح",
    },
    "An error occurred while creating the category": {
      en: "An error occurred while creating the category",
      ar: "حدث خطأ أثناء إنشاء الفئة",
    },
    "Category not found": {
      en: "Category not found",
      ar: "الفئة غير موجودة",
    },
    "Document retrieved successfully": {
      en: "Document retrieved successfully",
      ar: "تم استرجاع المستند بنجاح",
    },
    "An error occurred while retrieving the category": {
      en: "An error occurred while retrieving the category",
      ar: "حدث خطأ أثناء استرجاع الفئة",
    },
    "Category updated successfully": {
      en: "Category updated successfully",
      ar: "تم تحديث الفئة بنجاح",
    },
    "An error occurred while updating the category": {
      en: "An error occurred while updating the category",
      ar: "حدث خطأ أثناء تحديث الفئة",
    },
    "Category and books retrieved successfully": {
      en: "Category and books retrieved successfully",
      ar: "تم استرجاع الفئة والكتب بنجاح",
    },
    "An error occurred while retrieving category and books": {
      en: "An error occurred while retrieving category and books",
      ar: "حدث خطأ أثناء استرجاع الفئة والكتب",
    },
    "Title is required": {
      en: "Title is required",
      ar: "العنوان مطلوب",
    },
    "An error occurred while retrieving categories": {
      en: "An error occurred while retrieving categories",
      ar: "حدث خطأ أثناء استرجاع الفئات",
    },

    // AboutUs messages
    "AboutUs data not found": {
      en: "AboutUs data not found",
      ar: "لم يتم العثور على بيانات من نحن",
    },
    "AboutUs data retrieved successfully": {
      en: "AboutUs data retrieved successfully",
      ar: "تم استرجاع بيانات من نحن بنجاح",
    },
    "An error occurred while retrieving AboutUs data": {
      en: "An error occurred while retrieving AboutUs data",
      ar: "حدث خطأ أثناء استرجاع بيانات من نحن",
    },
    "Banner and about images for both languages are required": {
      en: "Banner and about images for both languages are required",
      ar: "الصور الرئيسية وصور من نحن مطلوبة للغتين",
    },
    "Title and description fields are required for both languages": {
      en: "Title and description fields are required for both languages",
      ar: "حقول العنوان والوصف مطلوبة للغتين",
    },
    "AboutUs data updated successfully": {
      en: "AboutUs data updated successfully",
      ar: "تم تحديث بيانات من نحن بنجاح",
    },
    "AboutUs data created successfully": {
      en: "AboutUs data created successfully",
      ar: "تم إنشاء بيانات من نحن بنجاح",
    },
    "An error occurred while saving AboutUs data": {
      en: "An error occurred while saving AboutUs data",
      ar: "حدث خطأ أثناء حفظ بيانات من نحن",
    },
    "AboutUs data deleted successfully": {
      en: "AboutUs data deleted successfully",
      ar: "تم حذف بيانات من نحن بنجاح",
    },
    "An error occurred while deleting AboutUs data": {
      en: "An error occurred while deleting AboutUs data",
      ar: "حدث خطأ أثناء حذف بيانات من نحن",
    },

    // Auth messages
    "User registered successfully": {
      en: "User registered successfully",
      ar: "تم تسجيل المستخدم بنجاح",
    },
    "User login successful": {
      en: "User login successful",
      ar: "تم تسجيل دخول المستخدم بنجاح",
    },
    "Invalid email or password": {
      en: "Invalid email or password",
      ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    },
    "User logged out successfully": {
      en: "User logged out successfully",
      ar: "تم تسجيل خروج المستخدم بنجاح",
    },

    // Additional Auth messages
    "Your account has been created successfully": {
      en: "Your account has been created successfully",
      ar: "تم إنشاء حسابك بنجاح",
    },
    "User already exists": {
      en: "User already exists",
      ar: "المستخدم موجود بالفعل",
    },
    "User already exists!": {
      en: "User already exists!",
      ar: "المستخدم موجود بالفعل!",
    },
    "An error occurred during registration": {
      en: "An error occurred during registration",
      ar: "حدث خطأ أثناء التسجيل",
    },
    "Logged in successfully": {
      en: "Logged in successfully",
      ar: "تم تسجيل الدخول بنجاح",
    },
    "An error occurred during login": {
      en: "An error occurred during login",
      ar: "حدث خطأ أثناء تسجيل الدخول",
    },
    // Account locked message is handled separately above
    "Already logged out": {
      en: "Already logged out",
      ar: "تم تسجيل الخروج بالفعل",
    },
    "Logged out successfully": {
      en: "Logged out successfully",
      ar: "تم تسجيل الخروج بنجاح",
    },
    "An error occurred during logout": {
      en: "An error occurred during logout",
      ar: "حدث خطأ أثناء تسجيل الخروج",
    },
    "Verification code sent successfully": {
      en: "Verification code sent successfully",
      ar: "تم إرسال رمز التحقق بنجاح",
    },
    "User not found": {
      en: "User not found",
      ar: "المستخدم غير موجود",
    },
    "User already verified": {
      en: "User already verified",
      ar: "تم التحقق من المستخدم بالفعل",
    },
    "Failed to send verification code": {
      en: "Failed to send verification code",
      ar: "فشل في إرسال رمز التحقق",
    },
    "An error occurred while sending verification code": {
      en: "An error occurred while sending verification code",
      ar: "حدث خطأ أثناء إرسال رمز التحقق",
    },
    "Email verified successfully": {
      en: "Email verified successfully",
      ar: "تم التحقق من البريد الإلكتروني بنجاح",
    },
    "Invalid verification code": {
      en: "Invalid verification code",
      ar: "رمز التحقق غير صالح",
    },
    "Verification code has expired": {
      en: "Verification code has expired",
      ar: "انتهت صلاحية رمز التحقق",
    },
    "Verification code not found. Please request a new code": {
      en: "Verification code not found. Please request a new code",
      ar: "لم يتم العثور على رمز التحقق. يرجى طلب رمز جديد",
    },
    "Verification code expired. Please request a new code": {
      en: "Verification code expired. Please request a new code",
      ar: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد",
    },
    "An error occurred during email verification": {
      en: "An error occurred during email verification",
      ar: "حدث خطأ أثناء التحقق من البريد الإلكتروني",
    },
    "Authentication required": {
      en: "Authentication required",
      ar: "التحقق مطلوب",
    },
    "Email verification required to change password": {
      en: "Email verification required to change password",
      ar: "التحقق من البريد الإلكتروني مطلوب لتغيير كلمة المرور",
    },
    "Password changed successfully": {
      en: "Password changed successfully",
      ar: "تم تغيير كلمة المرور بنجاح",
    },
    "Invalid old password": {
      en: "Invalid old password",
      ar: "كلمة المرور القديمة غير صحيحة",
    },
    "New password cannot be the same as the old password": {
      en: "New password cannot be the same as the old password",
      ar: "لا يمكن أن تكون كلمة المرور الجديدة هي نفس كلمة المرور القديمة",
    },
    "Passwords do not match": {
      en: "Passwords do not match",
      ar: "كلمات المرور غير متطابقة",
    },
    "An error occurred while changing password": {
      en: "An error occurred while changing password",
      ar: "حدث خطأ أثناء تغيير كلمة المرور",
    },
    "If the email is registered, a verification code has been sent": {
      en: "If the email is registered, a verification code has been sent",
      ar: "إذا كان البريد الإلكتروني مسجلاً، فقد تم إرسال رمز التحقق",
    },
    "Verification successful. You can now set a new password.": {
      en: "Verification successful. You can now set a new password.",
      ar: "تم التحقق بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.",
    },
    "Verification code has expired. Please request a new one.": {
      en: "Verification code has expired. Please request a new one.",
      ar: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.",
    },
    "No verification code found. Please request a new one.": {
      en: "No verification code found. Please request a new one.",
      ar: "لم يتم العثور على رمز التحقق. يرجى طلب رمز جديد.",
    },
    "An error occurred during verification": {
      en: "An error occurred during verification",
      ar: "حدث خطأ أثناء التحقق",
    },
    "Password has been reset successfully": {
      en: "Password has been reset successfully",
      ar: "تم إعادة تعيين كلمة المرور بنجاح",
    },
    "Code has expired. Please request a new password reset.": {
      en: "Code has expired. Please request a new password reset.",
      ar: "انتهت صلاحية الرمز. يرجى طلب إعادة تعيين كلمة المرور مرة أخرى.",
    },
    "Invalid or expired verification code": {
      en: "Invalid or expired verification code",
      ar: "رمز التحقق غير صالح أو منتهي الصلاحية",
    },
    "An error occurred while resetting password": {
      en: "An error occurred while resetting password",
      ar: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
    },
    "Admin logged in successfully": {
      en: "Admin logged in successfully",
      ar: "تم تسجيل دخول المسؤول بنجاح",
    },
    "An error occurred during admin login": {
      en: "An error occurred during admin login",
      ar: "حدث خطأ أثناء تسجيل دخول المسؤول",
    },

    // Additional Admin messages
    "Admin logged out successfully": {
      en: "Admin logged out successfully",
      ar: "تم تسجيل خروج المسؤول بنجاح",
    },
    "An error occurred during admin logout": {
      en: "An error occurred during admin logout",
      ar: "حدث خطأ أثناء تسجيل خروج المسؤول",
    },
    "Token is valid": {
      en: "Token is valid",
      ar: "الرمز صالح",
    },
    "Invalid token": {
      en: "Invalid token",
      ar: "الرمز غير صالح",
    },

    // Course messages
    "Course created successfully": {
      en: "Course created successfully",
      ar: "تم إنشاء الدورة بنجاح",
    },
    "Course updated successfully": {
      en: "Course updated successfully",
      ar: "تم تحديث الدورة بنجاح",
    },
    "Course deleted successfully": {
      en: "Course deleted successfully",
      ar: "تم حذف الدورة بنجاح",
    },
    "Course not found": {
      en: "Course not found",
      ar: "الدورة غير موجودة",
    },

    // Book messages
    "Book created successfully": {
      en: "Book created successfully",
      ar: "تم إنشاء الكتاب بنجاح",
    },
    "Book updated successfully": {
      en: "Book updated successfully",
      ar: "تم تحديث الكتاب بنجاح",
    },
    "Book deleted successfully": {
      en: "Book deleted successfully",
      ar: "تم حذف الكتاب بنجاح",
    },
    "Book not found": {
      en: "Book not found",
      ar: "الكتاب غير موجود",
    },
    "Book retrieved successfully": {
      en: "Book retrieved successfully",
      ar: "تم استرجاع الكتاب بنجاح",
    },
    "Books retrieved successfully": {
      en: "Books retrieved successfully",
      ar: "تم استرجاع الكتب بنجاح",
    },
    "Books filtered by category retrieved successfully": {
      en: "Books filtered by category retrieved successfully",
      ar: "تم استرجاع الكتب المصنفة حسب الفئة بنجاح",
    },
    "All books and categories retrieved successfully": {
      en: "All books and categories retrieved successfully",
      ar: "تم استرجاع جميع الكتب والفئات بنجاح",
    },
    "An error occurred while creating the book": {
      en: "An error occurred while creating the book",
      ar: "حدث خطأ أثناء إنشاء الكتاب",
    },
    "An error occurred while updating the book": {
      en: "An error occurred while updating the book",
      ar: "حدث خطأ أثناء تحديث الكتاب",
    },
    "An error occurred while retrieving the book": {
      en: "An error occurred while retrieving the book",
      ar: "حدث خطأ أثناء استرجاع الكتاب",
    },
    "An error occurred while retrieving books and categories": {
      en: "An error occurred while retrieving books and categories",
      ar: "حدث خطأ أثناء استرجاع الكتب والفئات",
    },
    "An error occurred while retrieving books": {
      en: "An error occurred while retrieving books",
      ar: "حدث خطأ أثناء استرجاع الكتب",
    },
    "Duplicate entry. This value already exists.": {
      en: "Duplicate entry. This value already exists.",
      ar: "إدخال مكرر. هذه القيمة موجودة بالفعل.",
    },
    "Validation error": {
      en: "Validation error",
      ar: "خطأ في التحقق من الصحة",
    },

    // Webinar messages
    "Webinars retrieved successfully": {
      en: "Webinars retrieved successfully",
      ar: "تم استرجاع الندوات بنجاح",
    },
    "Webinar retrieved successfully": {
      en: "Webinar retrieved successfully",
      ar: "تم استرجاع الندوة بنجاح",
    },
    "Webinar not found": {
      en: "Webinar not found",
      ar: "الندوة غير موجودة",
    },
    "Webinar availability checked": {
      en: "Webinar availability checked",
      ar: "تم التحقق من توفر الندوات",
    },
    "Full name and email are required": {
      en: "Full name and email are required",
      ar: "الاسم الكامل والبريد الإلكتروني مطلوبان",
    },
    "This webinar has already ended": {
      en: "This webinar has already ended",
      ar: "هذه الندوة انتهت بالفعل",
    },
    "This webinar is fully booked": {
      en: "This webinar is fully booked",
      ar: "هذه الندوة ممتلئة بالكامل",
    },
    "You are already registered for this webinar": {
      en: "You are already registered for this webinar",
      ar: "أنت مسجل بالفعل في هذه الندوة",
    },
    "Successfully registered for the webinar": {
      en: "Successfully registered for the webinar",
      ar: "تم التسجيل في الندوة بنجاح",
    },
    "An error occurred while registering for the webinar": {
      en: "An error occurred while registering for the webinar",
      ar: "حدث خطأ أثناء التسجيل في الندوة",
    },
    "Registrations retrieved successfully": {
      en: "Registrations retrieved successfully",
      ar: "تم استرجاع التسجيلات بنجاح",
    },
    "An error occurred while retrieving registrations": {
      en: "An error occurred while retrieving registrations",
      ar: "حدث خطأ أثناء استرجاع التسجيلات",
    },
    "Name, description, date, time, and meeting URL are required": {
      en: "Name, description, date, time, and meeting URL are required",
      ar: "الاسم والوصف والتاريخ والوقت ورابط الاجتماع مطلوبة",
    },
    "Webinar created successfully": {
      en: "Webinar created successfully",
      ar: "تم إنشاء الندوة بنجاح",
    },
    "An error occurred while creating the webinar": {
      en: "An error occurred while creating the webinar",
      ar: "حدث خطأ أثناء إنشاء الندوة",
    },
    "Webinar updated successfully": {
      en: "Webinar updated successfully",
      ar: "تم تحديث الندوة بنجاح",
    },
    "An error occurred while updating the webinar": {
      en: "An error occurred while updating the webinar",
      ar: "حدث خطأ أثناء تحديث الندوة",
    },
    "Webinar deleted successfully": {
      en: "Webinar deleted successfully",
      ar: "تم حذف الندوة بنجاح",
    },
    "An error occurred while deleting the webinar": {
      en: "An error occurred while deleting the webinar",
      ar: "حدث خطأ أثناء حذف الندوة",
    },
    "An error occurred while retrieving webinars": {
      en: "An error occurred while retrieving webinars",
      ar: "حدث خطأ أثناء استرجاع الندوات",
    },
    "An error occurred while checking webinar availability": {
      en: "An error occurred while checking webinar availability",
      ar: "حدث خطأ أثناء التحقق من توفر الندوات",
    },

    // Add more message translations as needed
  };

  // If message exists in dictionary, return the translated version or default to English
  if (messageTranslations[message]) {
    return (
      messageTranslations[message][language] || messageTranslations[message].en
    );
  }

  // If message not found in dictionary, return the original message
  return message;
};

/**
 * Translates all messages in an API response object
 *
 * @param {Object} response - The API response object
 * @param {String} language - The language code (en, ar)
 * @returns {Object} - Response with translated messages
 */
export const translateApiResponse = (response, language = DEFAULT_LANGUAGE) => {
  if (!response) return response;

  const translatedResponse = { ...response };

  if (translatedResponse.message) {
    translatedResponse.message = translateApiMessage(
      translatedResponse.message,
      language
    );
  }

  return translatedResponse;
};
