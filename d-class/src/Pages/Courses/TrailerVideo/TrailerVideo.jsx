import React, { useState, useRef, useEffect, useContext } from "react";
import ApiVideoPlayer from "@api.video/react-player";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import useAuthFetchNoLang from "Hooks/useAuthFetchNoLang";
import PurchaseModal from "./PurchaseModal";
import TrailerContent from "./Components/TrailerContent";
import ActionButtons from "./Components/ActionButtons";
import CommentsModal from "./Components/CommentsModal ";

const TrailerVideo = ({ videoId, data, isAuthenticated, isPurchased }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  // Check if user has access (either has active plan OR purchased this course)
  const hasAccess = isAuthenticated || isPurchased;

  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isCourseInMyList, setIsCourseInMyList] = useState(false);
  const [isLiked, setIsLiked] = useState(
    data?.course_engagement?.is_like || false
  );
  const [likesCount, setLikesCount] = useState(
    data?.course_engagement?.like_count || 0
  );
  const [engagementData, setEngagementData] = useState(
    data?.course_engagement || {}
  );
  const [commentsCount, setCommentsCount] = useState(
    data?.course_engagement?.course_comments_count || 0
  );

  // Context and hooks
  const { token, selectedUser, user } = useContext(LoginAuthContext);
  const { postData, isError, isLoading } = usePostData();
  const { isLoading: likeLoading, postData: postLikeData } = usePostData();

  // My List hooks (use NoLang since profile routes don't have language prefix)
  const { fetchData: fetchMyListCheck, isLoading: myListCheckLoading } = useAuthFetchNoLang();
  const { postData: postMyListAdd, isLoading: myListAddLoading } = usePostDataNoLang();
  const { postData: postMyListRemove, isLoading: myListRemoveLoading } = usePostDataNoLang();

  const myListLoading = myListCheckLoading || myListAddLoading || myListRemoveLoading;

  // Video player handlers
  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Share functionality
  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = `${t("courses.check_out")}: ${data?.name}`;

    if (navigator.share) {
      navigator
        .share({
          title: data?.name,
          text: shareText,
          url: shareUrl,
        })
        .catch((error) => console.warn("Error sharing:", error));
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert(t("course.link_copied") || "Link copied to clipboard!");
        })
        .catch(() => {
          alert(t("course.link_copy_failed") || "Failed to copy the link.");
        });
    } else {
      alert(
        t("course.share_not_supported") ||
          "Sharing is not supported on this browser."
      );
    }
  };

  // My List management (only for users with active plan)
  const checkMyList = async () => {
    // Only users with active plan can have a list
    if (!isAuthenticated || !selectedUser?.id || !data?._id) return;

    try {
      const response = await fetchMyListCheck(
        `my-list/check?profile_id=${selectedUser.id}&course_id=${data._id}`,
        token
      );

      if (response?.success) {
        setIsCourseInMyList(response.data?.isInList || false);
      }
    } catch (error) {
      console.log("Error checking my list:", error);
    }
  };

  const handleAddToPlaylist = async () => {
    // Only users with active plan can add to list
    if (!isAuthenticated) {
      setShowPurchaseModal(true);
      return;
    }

    if (isCourseInMyList) {
      navigate("/my-progress");
      return;
    }

    if (!selectedUser?.id || !data?._id) return;

    const body = {
      profile_id: selectedUser.id,
      course_id: data._id,
    };

    const response = await postMyListAdd("my-list/add", body, token);
    if (response?.success) {
      setIsCourseInMyList(true);
    }
  };

  const handleRemoveFromPlaylist = async () => {
    if (!selectedUser?.id || !data?._id) return;

    const body = {
      profile_id: selectedUser.id,
      course_id: data._id,
    };

    const response = await postMyListRemove("my-list/remove", body, token);
    if (response?.success) {
      setIsCourseInMyList(false);
    }
  };

  // Get the correct watch URL based on course type
  const getWatchUrl = () => {
    const courseType = data?.course_type || "single";
    switch (courseType) {
      case "series":
        return `/course/watch-series/${data?.slug}`;
      case "playlist":
        return `/course/watch-playlist/${data?.slug}`;
      case "single":
      default:
        return `/course/watch-single/${data?.slug}`;
    }
  };

  // Course access handler - check if user has access (active plan OR purchased)
  const handleOpenCourseClick = () => {
    if (hasAccess) {
      navigate(getWatchUrl());
    } else {
      setShowPurchaseModal(true);
    }
  };

  // Like functionality - requires access (active plan OR purchased)
  const handleLike = async () => {
    if (!hasAccess) {
      setShowPurchaseModal(true);
      return;
    }

    // Use the selected profile ID (not the user ID)
    const profileId = selectedUser?.id || selectedUser?._id;
    if (!profileId || likeLoading) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    const body = {
      course_id: data?._id,
      profile_id: profileId,
    };

    // Use like or unlike endpoint based on current state
    const endpoint = isLiked ? "unlike-course" : "like-course";
    const response = await postLikeData(endpoint, body, token);
    if (!response?.success) {
      // Revert the state if API call failed
      setIsLiked(!newLikedState);
      setLikesCount((prev) => (!newLikedState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Comments handler - requires access (active plan OR purchased)
  const handleComments = () => {
    if (!hasAccess) {
      setShowPurchaseModal(true);
      return;
    }

    setShowCommentsModal(true);
  };

  // Handle comment added callback
  const handleCommentAdded = (response) => {
    // Update local engagement data with new comments
    if (response?.success && response?.comments) {
      const updatedEngagement = {
        ...engagementData,
        course_comments: response.comments,
        course_comments_count: response.comments.length,
      };

      setEngagementData(updatedEngagement);
      setCommentsCount(response.comments.length);
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated && selectedUser?.id && data?._id) {
      checkMyList();
    }
  }, [isAuthenticated, selectedUser?.id, data?._id]);

  // Initialize engagement data when component mounts or data changes
  useEffect(() => {
    if (data?.course_engagement) {
      setEngagementData(data.course_engagement);
      setIsLiked(data.course_engagement.is_like || false);
      setLikesCount(data.course_engagement.like_count || 0);
      setCommentsCount(data.course_engagement.course_comments_count || 0);
    }
  }, [data?.course_engagement]);

  // Get thumbnail URL with fallbacks for different course types
  const getThumbnailUrl = () => {
    // 1. Try trailer thumbnail
    if (data?.trailer?.assets?.thumbnail) return data.trailer.assets.thumbnail;

    // 2. Try course direct thumbnail
    if (data?.thumbnail) return data.thumbnail;

    // 3. For playlist courses, use first lesson's video thumbnail
    if (data?.course_type === 'playlist' && data?.chapters?.length > 0) {
      const firstLesson = data.chapters[0]?.lessons?.[0];
      if (firstLesson?.video_id?.assets?.thumbnail) {
        return firstLesson.video_id.assets.thumbnail;
      }
    }

    // 4. For series courses, use first episode's video thumbnail
    if (data?.course_type === 'series' && data?.series?.length > 0) {
      const firstEpisode = data.series[0];
      if (firstEpisode?.series_video_id?.assets?.thumbnail) {
        return firstEpisode.series_video_id.assets.thumbnail;
      }
    }

    // 5. For single courses, use main video thumbnail
    if (data?.course_type === 'single' && data?.api_video_object?.assets?.thumbnail) {
      return data.api_video_object.assets.thumbnail;
    }

    // 6. Fall back to course image
    return data?.image || data?.mobileImage || null;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="w-full relative">
      {/* Video thumbnail fallback */}
      {!isReady && thumbnailUrl && (
        <div className="lg:min-h-[80vh]">
          <img
            src={thumbnailUrl}
            alt="Course Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Video player */}
      {videoId && (
        <ApiVideoPlayer
          onReady={() => setIsReady(true)}
          ref={playerRef}
          video={{ id: videoId }}
          hideTitle
          responsive
          autoplay={false}
          style={{ width: "100%", height: "100%" }}
        />
      )}

      {/* Overlay content */}
      <TrailerContent isPlaying={isPlaying} data={data} />

      {/* Action buttons */}
      <ActionButtons
        isPlaying={isPlaying}
        handleOpenCourseClick={handleOpenCourseClick}
        handleAddToPlaylist={handleAddToPlaylist}
        handlePlay={handlePlay}
        handleShare={handleShare}
        handleLike={handleLike}
        handleComments={handleComments}
        isCourseInMyList={isCourseInMyList}
        isLiked={isLiked}
        likesCount={likesCount}
        isLoading={isLoading}
        myListLoading={myListLoading}
        likeLoading={likeLoading}
        hasAccess={hasAccess}
        isAuthenticated={isAuthenticated}
        engagement={{
          ...engagementData,
          course_comments_count: commentsCount,
        }}
      />

      {/* Purchase modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        data={data}
      />

      {/* Comments modal */}
      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        data={{
          id: data?._id,
          course_engagement: {
            course_comments: data?.course_engagement?.course_comments || [],
            course_comments_count:
              data?.course_engagement?.course_comments_count || 0,
          },
        }}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default TrailerVideo;
