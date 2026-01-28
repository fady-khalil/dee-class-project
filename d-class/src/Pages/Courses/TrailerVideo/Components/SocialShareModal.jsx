import React, { useState } from "react";
import {
  Share,
  X,
  Copy,
  FacebookLogo,
  WhatsappLogo,
  PaperPlaneTilt,
  LinkedinLogo,
  Envelope,
} from "@phosphor-icons/react";

const SocialShareModal = ({ isOpen, onClose, data, t }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const courseTitle = data?.name || "Amazing Course";
  const courseDescription = data?.short_description || data?.description || "";
  const instructorName =
    data?.instructor_profile?.name ||
    data?.instructor_profile?.first_name ||
    "";

  // Create share text
  const shareText = `🎓 Check out: "${courseTitle}" ${
    instructorName ? `by ${instructorName}` : ""
  } ${courseDescription ? `- ${courseDescription.substring(0, 100)}...` : ""}`;

  // Check if native sharing is supported
  const isNativeShareSupported = navigator.share && navigator.canShare;

  // Handle native share
  const handleNativeShare = async () => {
    const shareData = {
      title: courseTitle,
      text: shareText,
      url: shareUrl,
    };

    try {
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        onClose(); // Close modal after successful share
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        // Fallback to showing social options if native share fails
      }
    }
  };

  // If native sharing is supported, show native share button prominently
  if (isNativeShareSupported) {
    return (
      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full max-w-md mx-auto shadow-xl transform transition-all animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <Share
                  weight="bold"
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  {t("course.share_course") || "Share Course"}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {courseTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200"
            >
              <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Native Share Button - Primary */}
            <button
              onClick={handleNativeShare}
              className="w-full bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-lg p-3.5 flex items-center justify-center gap-2.5 font-medium transition-all duration-200"
            >
              <Share weight="bold" className="w-4.5 h-4.5" />
              {t("course.share_now") || "Share Now"}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                {t("course.or") || "or"}
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            {/* Copy Link Button - Secondary */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (error) {
                  console.error("Failed to copy:", error);
                }
              }}
              className={`w-full ${
                copied
                  ? "bg-neutral-600 dark:bg-neutral-600"
                  : "bg-neutral-200 dark:bg-neutral-700"
              } hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg p-3.5 flex items-center justify-center gap-2.5 font-medium transition-all duration-200`}
            >
              <Copy weight="bold" className="w-4.5 h-4.5" />
              {copied
                ? t("course.link_copied") || "Link Copied!"
                : t("course.copy_link") || "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for browsers without native sharing - show social media options
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(courseTitle);

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <FacebookLogo weight="regular" className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      icon: <X weight="regular" className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: <LinkedinLogo weight="regular" className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: <WhatsappLogo weight="regular" className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: <PaperPlaneTilt weight="regular" className="w-5 h-5" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: "Email",
      icon: <Envelope weight="regular" className="w-5 h-5" />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0D%0A%0D%0A${encodedUrl}`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full max-w-md mx-auto shadow-xl transform transition-all animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <Share
                weight="bold"
                className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {t("course.share_course") || "Share Course"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("course.share_with_friends") || "Share this content"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200"
          >
            <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Copy Link Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("course.share_link") || "Share link"}
            </label>
            <div className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-700 p-2.5 rounded-lg">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent border-none text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none"
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (error) {
                    console.error("Failed to copy:", error);
                  }
                }}
                className={`${
                  copied
                    ? "bg-neutral-600"
                    : "bg-neutral-800 dark:bg-neutral-600"
                } text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap`}
              >
                {copied ? (
                  <span className="text-xs">
                    {t("course.copied") || "Copied"}
                  </span>
                ) : (
                  <>
                    <Copy weight="bold" className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {t("course.copy") || "Copy"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media Grid */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              {t("course.share_via") || "Share via"}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => {
                    window.open(
                      platform.url,
                      "_blank",
                      "width=600,height=400,scrollbars=yes,resizable=yes"
                    );
                  }}
                  className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-lg p-3.5 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-102"
                >
                  <div className="text-neutral-600 dark:text-neutral-300">
                    {platform.icon}
                  </div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {t(
                      `course.share_platform_${platform.name.toLowerCase()}`
                    ) || platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
