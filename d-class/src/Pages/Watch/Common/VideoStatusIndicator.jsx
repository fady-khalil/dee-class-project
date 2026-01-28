import React from "react";
import { CheckCircle, Play, CircleNotch } from "@phosphor-icons/react";

const VideoStatusIndicator = ({ isDone, isSelected, isLoading }) => {
  if (isLoading) {
    return (
      <CircleNotch
        size={24}
        weight="fill"
        className="text-primary animate-spin"
      />
    );
  }

  if (isDone) {
    return (
      <CheckCircle
        size={24}
        weight="fill"
        className={isSelected ? "text-primary" : "text-green-500"}
      />
    );
  }

  if (isSelected) {
    return <CheckCircle size={24} weight="fill" className="text-primary" />;
  }

  return <Play size={24} weight="fill" className="text-white" />;
};

export default VideoStatusIndicator;
