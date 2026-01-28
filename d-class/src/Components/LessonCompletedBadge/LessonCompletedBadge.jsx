import React from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const LessonCompletedBadge = ({
  variant = "icon",
  size = "medium",
  className = "",
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    small: {
      icon: 20,
      padding: "p-1",
      text: "text-xs px-2 py-0.5",
    },
    medium: {
      icon: 24,
      padding: "p-1",
      text: "text-sm px-3 py-1",
    },
    large: {
      icon: 32,
      padding: "p-2",
      text: "text-base px-4 py-1.5",
    },
  };

  const currentSize = sizeClasses[size];

  if (variant === "icon") {
    return (
      <div
        className={`bg-black/50 ${currentSize.padding} rounded-full ${className}`}
      >
        <CheckCircle
          size={currentSize.icon}
          weight="fill"
          className="text-primary"
        />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span
        className={`${currentSize.text} text-primary font-medium rounded-full bg-primary/10 ${className}`}
      >
        {t("courses.completed")}
      </span>
    );
  }

  if (variant === "icon-text") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle
          size={currentSize.icon}
          weight="fill"
          className="text-primary"
        />
        <span className={`${currentSize.text} text-primary font-medium`}>
          {t("courses.completed")}
        </span>
      </div>
    );
  }

  return null;
};

export default LessonCompletedBadge;
