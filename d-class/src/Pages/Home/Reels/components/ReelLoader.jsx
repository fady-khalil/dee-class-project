import React from "react";
import { motion } from "framer-motion";

const ReelLoader = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-10 h-10 bg-primary/20 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReelLoader;
