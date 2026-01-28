import { login } from "./LoginController.js";
import { register } from "./registerController.js";
import { logout } from "./logout.js";
import {
  sendVerificationEmail,
  verifyVerificationCode,
} from "./VerficationsControllers.js";

import {
  ChangePassword,
  requestPasswordReset,
  verifyResetCode,
  setNewPassword,
} from "./passwordControllers.js";

export {
  login,
  register,
  logout,
  sendVerificationEmail,
  verifyVerificationCode,
  ChangePassword,
  requestPasswordReset,
  verifyResetCode,
  setNewPassword,
};
