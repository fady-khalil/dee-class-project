import express from "express";
import {
  login,
  register,
  logout,
  sendVerificationEmail,
  verifyVerificationCode,
  ChangePassword,
  requestPasswordReset,
  verifyResetCode,
  setNewPassword,
} from "../Controllers/Auth/index.js";
import { Identifier } from "../middlewares/Identifications.js";
import { registerLimiter } from "../middlewares/registerLimiter.js";
import { validateSignup } from "../middlewares/validateSignup.js";
import { validateLogin } from "../middlewares/validateLogin.js";
import { loginLimiter } from "../middlewares/loginLimiter.js";
import { validateVerificationCode } from "../middlewares/validateVerificationCode.js";
import { verificationLimiter } from "../middlewares/verificationLimiter.js";
import { passwordResetLimiter } from "../middlewares/passwordResetLimiter.js";
import {
  validateRequestOtp,
  validateVerifyOtp,
  validateSetNewPassword,
} from "../middlewares/validatePasswordReset.js";
import { validateChangePassword } from "../middlewares/validateChangePassword.js";
import { addSecurityHeaders } from "../middlewares/securityHeadersMiddleware.js";

const router = express.Router();

router.use(addSecurityHeaders);

// Auth routes
router.post(
  "/register",
  // registerLimiter,
  validateSignup,
  register
);
router.post("/login", validateLogin, login);
// router.post("/login", loginLimiter, validateLogin, login);
router.post("/logout", logout);

// Email verification
router.post(
  "/send-verification",
  //  verificationLimiter,
  sendVerificationEmail
);
router.post(
  "/verify-email",
  // verificationLimiter,
  validateVerificationCode,
  verifyVerificationCode
);

// Password management
router.post(
  "/change-password",
  Identifier,
  validateChangePassword,
  ChangePassword
);

// Password reset flow
router.post(
  "/request-password-reset",
  // passwordResetLimiter,
  validateRequestOtp,
  requestPasswordReset
);
router.post(
  "/verify-reset-code",
  passwordResetLimiter,
  validateVerifyOtp,
  verifyResetCode
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validateSetNewPassword,
  setNewPassword
);

export default router;
