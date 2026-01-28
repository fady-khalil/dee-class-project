import Joi from "joi";

export const signupSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(254)
    .required()
    .trim()
    .lowercase()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.max": "Email must be less than 254 characters",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(254)
    .required()
    .trim()
    .lowercase()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.max": "Email must be less than 254 characters",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});

export const acceptedCodeSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(254)
    .required()
    .trim()
    .lowercase()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.max": "Email must be less than 254 characters",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  code: Joi.string().required().messages({
    "string.empty": "Verification code is required",
    "any.required": "Verification code is required",
  }),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),
  newPassword: Joi.string()
    .required()
    .disallow(Joi.ref("oldPassword"))
    .messages({
      "any.required": "New password is required",
      "any.invalid": "New password cannot be the same as old password",
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "any.only": "Passwords must match",
      "any.required": "Password confirmation is required",
    }),
});
