import React, { useState } from "react";
import { X, Upload, CheckCircle, Spinner } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

const BecomeExpertModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError(t("expert.pdf_only"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(t("expert.file_size_error"));
        return;
      }
      setResume(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      setError(t("expert.fill_required"));
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("expert.invalid_email"));
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("location", formData.location);
      if (resume) {
        submitData.append("resume", resume);
      }

      const response = await fetch(`${BASE_URL}/expert-application/submit`, {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", location: "" });
        setResume(null);
      } else {
        setError(data.message || t("expert.submit_error"));
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(t("expert.submit_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", location: "" });
    setResume(null);
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-darkGrey rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          {success ? (
            // Success message
            <div className="text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {t("expert.application_submitted")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t("expert.application_success_message")}
              </p>
              <button
                onClick={handleClose}
                className="bg-primary hover:bg-darkPrimary text-white px-6 py-2 rounded-xl transition-colors"
              >
                {t("general.close")}
              </button>
            </div>
          ) : (
            // Form
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("expert.become_expert")}
              </h2>
              <p className="text-gray-400 mb-6">
                {t("expert.form_description")}
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    {t("expert.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("expert.enter_name")}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    {t("expert.email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("expert.enter_email")}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    {t("expert.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("expert.enter_phone")}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    {t("expert.location")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("expert.enter_location")}
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    {t("expert.resume")} (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center justify-center gap-2 w-full bg-gray-800 border border-dashed border-gray-600 rounded-xl px-4 py-6 text-gray-400 hover:border-primary hover:text-primary cursor-pointer transition-colors"
                    >
                      <Upload size={24} />
                      <span>
                        {resume ? resume.name : t("expert.upload_resume")}
                      </span>
                    </label>
                  </div>
                  {resume && (
                    <p className="text-sm text-gray-500 mt-1">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-darkPrimary disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner size={20} className="animate-spin" />
                      {t("general.submitting")}
                    </>
                  ) : (
                    t("general.submit")
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeExpertModal;
