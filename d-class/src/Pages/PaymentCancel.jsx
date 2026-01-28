import React from "react";
import { motion } from "framer-motion";
import { XCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <XCircle
            className="mx-auto text-red-500"
            size={120}
            weight="fill"
          />
          <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t("payment.cancelled_title") || "Payment Cancelled"}
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t("payment.cancelled_message") || "Your payment was cancelled. No charges were made to your account."}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-x-4"
        >
          <button
            onClick={() => navigate("/plans")}
            className="px-6 py-3 bg-primary hover:bg-darkPrimary text-white font-semibold rounded-lg transition duration-200"
          >
            {t("buttons.try_again") || "Try Again"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200"
          >
            {t("buttons.go_home") || "Go Home"}
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <div className="text-sm text-gray-500">
            <p>{t("general.need_help") || "Need help?"}</p>
            <a href="/contact" className="text-blue-500 hover:text-blue-600">
              {t("general.contact_support") || "Contact our support team"}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCancel;
