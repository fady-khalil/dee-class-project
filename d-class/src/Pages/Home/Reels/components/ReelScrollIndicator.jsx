import React from "react";
import { motion } from "framer-motion";

const ReelScrollIndicator = ({ reelsData, activeIndex, onIndicatorClick }) => {
  return (
    <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-1 sm:space-y-1.5 z-30">
      {reelsData.map((_, index) => (
        <motion.div
          key={index}
          className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            index === activeIndex ? "bg-primary shadow-glow" : "bg-white/40"
          }`}
          style={{
            height: index === activeIndex ? "20px" : "6px",
            boxShadow:
              index === activeIndex
                ? "0 0 8px rgba(var(--color-primary), 0.6)"
                : "none",
          }}
          onClick={() => onIndicatorClick(index)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </div>
  );
};

export default ReelScrollIndicator;
