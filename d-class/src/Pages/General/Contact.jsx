import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "Hooks/useApiQuery";
import usePostData from "Hooks/usePostData";
import { Spinner } from "Components/RequestHandler";
import useInput from "Components/form/Hooks/user-input";
import {
  EnvelopeSimple,
  Phone,
  User,
  MapPin,
  ChatText,
  PaperPlaneTilt,
  FacebookLogo,
  InstagramLogo,
  TwitterLogo,
  LinkedinLogo,
  YoutubeLogo,
  TiktokLogo,
  WhatsappLogo,
  Clock,
} from "@phosphor-icons/react";

const SOCIAL_ICONS = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  twitter: TwitterLogo,
  linkedin: LinkedinLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  whatsapp: WhatsappLogo,
};

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useApiQuery("home/contact-info");
  const { postData, isLoading: isSending } = usePostData();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form validation
  const emailValidation = (value) => value.includes("@") && value.trim() !== "";
  const phoneValidation = (value) => value.trim() === "" || value.trim().length >= 8;
  const defaultValidation = (value) => value.trim() !== "";
  const optionalValidation = () => true;

  const {
    value: nameInput,
    isValid: nameIsValid,
    HasError: nameHasError,
    inputChangeHandler: nameChangeHandler,
    inputBlurHandler: nameBlurHandler,
    reset: resetName,
  } = useInput(defaultValidation);

  const {
    value: emailInput,
    isValid: emailIsValid,
    HasError: emailHasError,
    inputChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    reset: resetEmail,
  } = useInput(emailValidation);

  const {
    value: phoneInput,
    isValid: phoneIsValid,
    HasError: phoneHasError,
    inputChangeHandler: phoneChangeHandler,
    inputBlurHandler: phoneBlurHandler,
    reset: resetPhone,
  } = useInput(optionalValidation);

  const {
    value: subjectInput,
    isValid: subjectIsValid,
    HasError: subjectHasError,
    inputChangeHandler: subjectChangeHandler,
    inputBlurHandler: subjectBlurHandler,
    reset: resetSubject,
  } = useInput(defaultValidation);

  const {
    value: messageInput,
    isValid: messageIsValid,
    HasError: messageHasError,
    inputChangeHandler: messageChangeHandler,
    inputBlurHandler: messageBlurHandler,
    reset: resetMessage,
  } = useInput(defaultValidation);

  const formIsValid = nameIsValid && emailIsValid && subjectIsValid && messageIsValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setSubmitError(null);

    if (!formIsValid) return;

    try {
      const response = await postData("home/contact", {
        name: nameInput,
        email: emailInput,
        phone: phoneInput,
        subject: subjectInput,
        message: messageInput,
      });

      if (response?.success) {
        setSubmitSuccess(true);
        resetName();
        resetEmail();
        resetPhone();
        resetSubject();
        resetMessage();
        setIsSubmitted(false);

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(response?.message || t("contact.submitError"));
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitError(t("contact.submitError"));
    }
  };

  const contactInfo = data?.data;

  const renderSocialIcon = (platform) => {
    const IconComponent = SOCIAL_ICONS[platform];
    return IconComponent ? <IconComponent size={22} weight="fill" /> : null;
  };

  const isRTL = i18n.language === "ar";

  const iconPositionClass = isRTL ? 'right-4' : 'left-4';
  const inputPaddingClass = isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4';

  const inputBaseClass = `w-full bg-transparent border border-gray-600 text-white py-3.5 ${inputPaddingClass}
    rounded-xl placeholder:text-gray-500 placeholder:text-sm
    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
    transition-all duration-300`;

  const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/50";

  return (
    <div className="min-h-screen bg-bg py-pageTop lg:py-primary">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t("contact.tagline", "We'd love to hear from you")}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {contactInfo?.pageTitle || t("contact.title", "Contact Us")}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {contactInfo?.pageSubtitle || t("contact.subtitle", "Have questions or feedback? We're here to help. Send us a message and we'll respond as soon as possible.")}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12"
            style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
          >
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3 bg-gradient-to-br from-grey to-grey/50 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-800">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <PaperPlaneTilt size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  {t("contact.sendMessage", "Send us a Message")}
                </h2>
              </div>

              {submitSuccess && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>{t("contact.submitSuccess", "Your message has been sent successfully! We'll get back to you soon.")}</p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div className="relative">
                    <div className={`absolute ${iconPositionClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder={t("contact.namePlaceholder")}
                      value={nameInput}
                      onChange={(e) => {
                        nameChangeHandler(e);
                        setSubmitError(null);
                      }}
                      onBlur={nameBlurHandler}
                      className={`${inputBaseClass} ${(isSubmitted && !nameIsValid) || nameHasError ? inputErrorClass : ""}`}
                    />
                    {((isSubmitted && !nameIsValid) || nameHasError) && (
                      <p className="text-xs text-red-400 mt-1.5">{t("contact.nameError")}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className={`absolute ${iconPositionClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <EnvelopeSimple size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder={t("contact.emailPlaceholder")}
                      value={emailInput}
                      onChange={(e) => {
                        emailChangeHandler(e);
                        setSubmitError(null);
                      }}
                      onBlur={emailBlurHandler}
                      className={`${inputBaseClass} ${(isSubmitted && !emailIsValid) || emailHasError ? inputErrorClass : ""}`}
                    />
                    {((isSubmitted && !emailIsValid) || emailHasError) && (
                      <p className="text-xs text-red-400 mt-1.5">{t("contact.emailError")}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone Input */}
                  <div className="relative">
                    <div className={`absolute ${iconPositionClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      placeholder={t("contact.phonePlaceholder")}
                      value={phoneInput}
                      onChange={phoneChangeHandler}
                      onBlur={phoneBlurHandler}
                      className={inputBaseClass}
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="relative">
                    <div className={`absolute ${iconPositionClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
                      <ChatText size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder={t("contact.subjectPlaceholder")}
                      value={subjectInput}
                      onChange={(e) => {
                        subjectChangeHandler(e);
                        setSubmitError(null);
                      }}
                      onBlur={subjectBlurHandler}
                      className={`${inputBaseClass} ${(isSubmitted && !subjectIsValid) || subjectHasError ? inputErrorClass : ""}`}
                    />
                    {((isSubmitted && !subjectIsValid) || subjectHasError) && (
                      <p className="text-xs text-red-400 mt-1.5">{t("contact.subjectError")}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    className={`w-full bg-transparent border border-gray-600 text-white px-4 py-4
                      rounded-xl placeholder:text-gray-500 placeholder:text-sm
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50
                      transition-all duration-300 resize-none
                      ${(isSubmitted && !messageIsValid) || messageHasError ? inputErrorClass : ""}`}
                    placeholder={t("contact.messagePlaceholder", "Write your message here...")}
                    value={messageInput}
                    onChange={messageChangeHandler}
                    onBlur={messageBlurHandler}
                    rows={6}
                  />
                  {((isSubmitted && !messageIsValid) || messageHasError) && (
                    <p className="text-xs text-red-400 mt-1.5">
                      {t("contact.messageError", "Please enter your message")}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-semibold
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 group"
                >
                  {isSending ? (
                    <>
                      <Spinner isSmall isWhite />
                      <span>{t("contact.sending", "Sending...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("contact.submit", "Send Message")}</span>
                      <PaperPlaneTilt
                        size={20}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                      />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Details Card */}
              <div className="bg-gradient-to-br from-grey to-grey/50 rounded-2xl shadow-xl p-8 border border-gray-800">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  {t("contact.getInTouch", "Get in Touch")}
                </h2>

                <div className="space-y-5">
                  {/* Email */}
                  {contactInfo?.email && (
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                        <EnvelopeSimple size={24} className="text-primary" weight="fill" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          {t("contact.email", "Email")}
                        </p>
                        <p className="text-white group-hover:text-primary transition-colors">
                          {contactInfo.email}
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Phone */}
                  {contactInfo?.phone && (
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Phone size={24} className="text-primary" weight="fill" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          {t("contact.phone", "Phone")}
                        </p>
                        <p className="text-white group-hover:text-primary transition-colors">
                          {contactInfo.phone}
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Address */}
                  {contactInfo?.address && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin size={24} className="text-primary" weight="fill" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          {t("contact.address", "Address")}
                        </p>
                        <p className="text-white">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  {contactInfo?.workingHours && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock size={24} className="text-primary" weight="fill" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          {t("contact.workingHours", "Working Hours")}
                        </p>
                        <p className="text-white">
                          {contactInfo.workingHours}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* No contact info message */}
                  {!contactInfo?.email && !contactInfo?.phone && !contactInfo?.address && (
                    <p className="text-gray-400 text-center py-4">
                      {t("contact.noInfo", "Contact information is not available yet.")}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media Card */}
              {contactInfo?.socialMedia && contactInfo.socialMedia.length > 0 && (
                <div className="bg-gradient-to-br from-grey to-grey/50 rounded-2xl shadow-xl p-8 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-5">
                    {t("contact.followUs", "Follow Us")}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {contactInfo.socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gray-800/50 hover:bg-primary rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                        title={social.platform}
                      >
                        {renderSocialIcon(social.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Response Note */}
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">
                      {t("contact.quickResponse", "Quick Response")}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {t("contact.quickResponseText", "We typically respond within 24 hours during business days.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
