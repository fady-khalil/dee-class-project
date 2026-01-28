import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Container from "Components/Container/Container";
import {
  Video,
  ShareFat,
  LockKey,
  Heart,
  ChatCircle,
  BookmarkSimple,
} from "@phosphor-icons/react";
import Spinner from "Components/RequestHandler/Spinner";

const ActionButtons = ({
  isPlaying,
  handleOpenCourseClick,
  handleAddToPlaylist,
  handlePlay,
  handleShare,
  handleLike,
  handleComments,
  isCourseInMyList,
  isLiked,
  likesCount,
  isLoading,
  myListLoading,
  likeLoading,
  engagement,
  hasAccess,
  isAuthenticated, // User has active plan (for My List feature)
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Primary action button (Open Course/Add to Playlist)
  const renderPrimaryButton = () => {
    // If user doesn't have access, show lock button
    if (!hasAccess) {
      return (
        <button
          className="bg-primary text-white rounded-md px-3 py-2 sm:px-4 md:py-2.5 lg:px-4 lg:py-3 flex items-center gap-x-2 hover:bg-primary/90 transition-colors min-w-[120px] sm:min-w-[140px] justify-center"
          onClick={handleOpenCourseClick}
        >
          <LockKey size={isMobile ? 20 : 24} />
          <span className="text-sm sm:text-base">
            {t("courses.open_courses")}
          </span>
        </button>
      );
    }

    // User has access - show watch course button and bookmark button
    return (
      <div className="flex items-center gap-2">
        <button
          className="bg-primary text-white rounded-md px-3 py-2 sm:px-4 md:py-2.5 lg:px-4 lg:py-3 flex items-center gap-x-2 hover:bg-primary/90 transition-colors min-w-[120px] sm:min-w-[140px] justify-center"
          onClick={handleOpenCourseClick}
        >
          <Video size={isMobile ? 20 : 24} />
          <span className="text-sm sm:text-base">
            {t("courses.watch_course")}
          </span>
        </button>
        {/* Bookmark button - shown for users with active plan */}
        <button
          onClick={handleAddToPlaylist}
          className="bg-lightGrey text-white rounded-md px-3 py-2 sm:px-4 md:py-2.5 lg:px-4 lg:py-3 flex items-center gap-x-2 capitalize hover:bg-lightGrey/90 transition-colors justify-center min-w-[50px]"
          title={isCourseInMyList ? t("courses.in_my_list") : t("courses.add_to_list")}
        >
          {isLoading || myListLoading ? (
            <Spinner isWhite={true} isSmall={true} />
          ) : (
            <BookmarkSimple
              size={isMobile ? 24 : 28}
              weight={isCourseInMyList ? "fill" : "regular"}
            />
          )}
        </button>
      </div>
    );
  };

  // Secondary action buttons
  const renderSecondaryButtons = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Play Trailer Button */}
      <button
        className="bg-lightGrey text-white rounded-md px-3 py-2 sm:px-4 md:py-2.5 lg:px-6 lg:py-3 flex items-center gap-x-1 sm:gap-x-2 hover:bg-lightGrey/90 transition-colors"
        onClick={handlePlay}
      >
        <Video size={isMobile ? 20 : 28} />
        <span className="text-sm sm:text-base">
          {isMobile ? "" : t("courses.watch_trailer")}
        </span>
      </button>

      {/* Like Button */}
      <button
        className={`bg-lightGrey text-white rounded-md p-2 sm:p-2.5 lg:p-3 hover:bg-lightGrey/90 transition-colors flex items-center gap-x-1 sm:gap-x-2 ${
          isLiked ? "text-red-500 cursor-not-allowed opacity-75" : ""
        }`}
        onClick={handleLike}
        disabled={isLiked || likeLoading}
        title={isLiked ? t("courses.liked") : t("courses.like")}
      >
        {likeLoading ? (
          <Spinner isWhite={true} isSmall={true} />
        ) : (
          <Heart
            size={isMobile ? 20 : 28}
            weight={isLiked ? "fill" : "regular"}
          />
        )}
        <span className="text-xs sm:text-sm">{likesCount}</span>
      </button>

      {/* Comments Button */}
      <button
        className="bg-lightGrey text-white rounded-md p-2 sm:p-2.5 lg:p-3 hover:bg-lightGrey/90 transition-colors flex items-center gap-x-1 sm:gap-x-2"
        onClick={handleComments}
        title={t("courses.comments")}
      >
        <ChatCircle size={isMobile ? 20 : 28} />
        <span className="text-xs sm:text-sm">
          {engagement?.course_comments_count || 0}
        </span>
      </button>

      {/* Share Button */}
      <button
        className="bg-lightGrey text-white rounded-md p-2 sm:p-2.5 lg:p-3 hover:bg-lightGrey/90 transition-colors"
        onClick={handleShare}
        title={t("courses.share")}
      >
        <ShareFat size={isMobile ? 20 : 28} />
      </button>
    </div>
  );

  // Layout for all screen sizes
  const renderResponsiveLayout = () => {
    if (isPlaying) {
      // Simpler layout when video is playing
      return (
        <Container>
          <div className="flex flex-wrap items-center justify-center mt-4 sm:mt-6 gap-2 sm:gap-3">
            {renderPrimaryButton()}
            {renderSecondaryButtons()}
          </div>
        </Container>
      );
    }

    // More elaborate layout when video is not playing
    return (
      <div className="flex items-end w-full mt-6 sm:mt-8 lg:mt-0 lg:absolute lg:bottom-0 lg:right-0 z-10 lg:h-full">
        <Container>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 lg:gap-x-6 lg:px-12 lg:py-10 relative rounded-tl-xl lg:w-max rounded-tr-xl">
            {/* Background overlay for desktop */}
            <div className="hidden lg:block absolute inset-0 bg-black/90 rounded-tl-xl w-full h-full rounded-tr-xl z-[1]"></div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 lg:gap-x-16 relative z-[10]">
              <div className="w-full sm:w-auto flex justify-center sm:justify-start order-2 sm:order-1 mt-3 sm:mt-0">
                {renderSecondaryButtons()}
              </div>
              <div className="w-full sm:w-auto flex justify-center order-1 sm:order-2">
                {renderPrimaryButton()}
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  };

  return renderResponsiveLayout();
};

export default ActionButtons;
