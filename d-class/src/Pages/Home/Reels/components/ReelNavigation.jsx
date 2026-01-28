import React from "react";
import { motion } from "framer-motion";

const ReelNavigation = ({ activeIndex, totalReels, onPrev, onNext }) => {
  return (
    <div className="absolute top-1/2 -right-16 flex flex-col gap-4">
      {/* Previous button */}
      <motion.button
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 ${
          activeIndex === 0 ? "opacity-50 cursor-not-allowed" : "opacity-100"
        }`}
        onClick={onPrev}
        disabled={activeIndex === 0}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </motion.button>

      {/* Next button */}
      <motion.button
        whileHover={{ scale: 1.1, y: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 ${
          activeIndex === totalReels - 1
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100"
        }`}
        onClick={onNext}
        disabled={activeIndex === totalReels - 1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default ReelNavigation;
