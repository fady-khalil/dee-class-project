import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { House } from "@phosphor-icons/react";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";

const NotFound = () => {
  const { isAuthenticated } = useContext(LoginAuthContext);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-16 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track!
          </p>

          <Link
            state={{
              isAuthenticated: isAuthenticated,
            }}
            to={isAuthenticated ? "/categories" : "/"}
            className="inline-flex items-center px-6 gap-x-2 py-3 bg-primary text-white rounded-lg hover:scale-[0.99] transition-colors duration-300"
          >
            <House className="mr-2" weight="fill" size={20} />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12"
        >
          <div className="text-sm text-gray-500">
            <p>Need help? Contact our support team</p>
            <a href="/contact" className="text-blue-500 hover:text-blue-600">
              Get in touch
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
