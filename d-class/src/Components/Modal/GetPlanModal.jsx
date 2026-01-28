import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { X } from "@phosphor-icons/react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

const GetPlanModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isVerified } = useContext(LoginAuthContext);

  if (!isOpen) return null;

  const handleGetPlan = () => {
    onClose();
    // Check if user is verified before allowing to get a plan
    if (isVerified) {
      navigate("/plans");
    } else {
      // Not verified - redirect to verification page
      navigate("/verify-email");
    }
  };

  const handleGoHome = () => {
    onClose();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={t("general.close")}
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="text-center pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {t("get_plan_modal.title")}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("get_plan_modal.description")}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGetPlan}
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-darkPrimary text-white font-semibold rounded-lg transition duration-200"
            >
              {t("get_plan_modal.get_plan_button")}
            </button>
            <button
              onClick={handleGoHome}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200"
            >
              {t("get_plan_modal.home_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetPlanModal;
