import React, { useRef, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, X } from "@phosphor-icons/react";
import Spinner from "Components/RequestHandler/Spinner";
import { useNavigate } from "react-router-dom";
import usePayment from "Hooks/usePayment.js";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
const PurchaseModal = ({ isOpen, onClose, data, isLoading }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(LoginAuthContext);
  const { postData, isLoading: paymentLoading } = usePayment();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        isOpen
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handlePayement = async (course_id) => {
    if (isLoggedIn) {
      const response = await postData("create-checkout-session", {
        type: "course",
        user_id: user?._id || user?.id,
        id: course_id,
        source: "website",
      });

      if (response?.status === 200) {
        window.location.href = response?.data?.checkout_url;
      }
    } else {
      navigate("/register", {
        state: { course_id: course_id, is_register: true },
      });
    }
  };

  const handleViewPlans = () => {
    navigate("/plans");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-white rounded-xl shadow-xl max-w-md w-full mx-auto my-4 p-4 sm:p-8`}
        ref={modalRef}
      >
        {/*header  */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {t("courses.access_course")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* body */}
        <div className="mb-4 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            {data?.name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
            {t("courses.choose_access_option")}
          </p>

          <div className="space-y-3 sm:space-y-4">
            {/* single course */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-primary transition">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">
                    {t("courses.single_purchase")}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {t("courses.one_time_payment")}
                  </p>
                </div>
                <div className="font-bold text-base sm:text-lg">
                  {data?.price} {t("courses.currency")}
                </div>
              </div>
              <button
                onClick={() => handlePayement(data?._id || data?.id)}
                className="mt-4 sm:mt-8 w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition flex items-center justify-center text-sm sm:text-base"
                disabled={isLoading || paymentLoading}
              >
                {paymentLoading ? (
                  <Spinner isWhite={true} isSmall={true} />
                ) : (
                  t("buttons.buy_now")
                )}
              </button>
            </div>

            {/* plans */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-primary transition bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">
                    {t("courses.subscription")}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {t("courses.unlimited_access")}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 mb-4 sm:mb-8">
                <ul className="space-y-1 sm:space-y-2">
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle
                      size={16}
                      className="text-primary flex-shrink-0"
                      weight="fill"
                    />
                    <span>{t("general.plans_feature_1")}</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle
                      size={16}
                      className="text-primary flex-shrink-0"
                      weight="fill"
                    />
                    <span>{t("general.plans_feature_2")}</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle
                      size={16}
                      className="text-primary flex-shrink-0"
                      weight="fill"
                    />
                    <span>{t("general.plans_feature_3")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleViewPlans}
                className="w-full py-2 px-4 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition flex items-center justify-center text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner isSmall={true} />
                ) : (
                  t("buttons.plans_button")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
