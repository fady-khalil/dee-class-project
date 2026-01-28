// Messages for different status types
const messages = {
  // Authentication related messages
  auth: {
    login: {
      success: "auth.login.success",
      error: "auth.login.error",
      required: "auth.login.required",
    },
    register: {
      success: "auth.register.success",
      error: "auth.register.error",
      emailExists: "auth.register.emailExists",
    },
    logout: {
      success: "auth.logout.success",
    },
    resetPassword: {
      success: "auth.resetPassword.success",
      error: "auth.resetPassword.error",
    },
  },

  // Form related messages
  form: {
    submit: {
      success: "form.submit.success",
      error: "form.submit.error",
    },
    validation: {
      error: "form.validation.error",
    },
  },

  // API related messages
  api: {
    fetch: {
      error: "api.fetch.error",
      networkError: "api.fetch.networkError",
      timeout: "api.fetch.timeout",
    },
  },

  // User profile related messages
  profile: {
    update: {
      success: "profile.update.success",
      error: "profile.update.error",
    },
  },

  // Course related messages
  course: {
    enroll: {
      success: "course.enroll.success",
      error: "course.enroll.error",
    },
    complete: {
      success: "course.complete.success",
    },
  },

  // Payment related messages
  payment: {
    success: "payment.success",
    error: "payment.error",
    pending: "payment.pending",
  },
};

export default messages;
