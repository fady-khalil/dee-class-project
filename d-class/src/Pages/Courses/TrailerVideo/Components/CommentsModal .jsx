import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import usePostData from "Hooks/usePostData";
import Spinner from "Components/RequestHandler/Spinner";
import { X, PaperPlaneTilt, ChatCircle } from "@phosphor-icons/react";

const CommentsModal = ({ isOpen, onClose, data, onCommentAdded }) => {
  const { t } = useTranslation();
  const { selectedUser, token } = useContext(LoginAuthContext);
  const { postData: postComment, isLoading: commentLoading } = usePostData();

  // Use the selected profile ID (not the user ID)
  const profileId = selectedUser?.id || selectedUser?._id;

  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [displayedComments, setDisplayedComments] = useState(10);
  const commentsPerPage = 10;

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Initialize and update local comments when modal opens or data changes
  useEffect(() => {
    if (isOpen && data?.course_engagement?.course_comments) {
      // Reverse comments to show newest first
      const reversedComments = [
        ...data.course_engagement.course_comments,
      ].reverse();
      setLocalComments(reversedComments);
      setTotalComments(
        data.course_engagement.course_comments_count ||
          data.course_engagement.course_comments.length
      );
      setDisplayedComments(10); // Reset to initial amount
    }
  }, [
    isOpen,
    data?.course_engagement?.course_comments,
    data?.course_engagement?.course_comments_count,
  ]);

  // Get visible comments
  const getVisibleComments = () => {
    return localComments.slice(0, displayedComments);
  };

  // Load more comments
  const handleLoadMore = () => {
    setDisplayedComments((prev) =>
      Math.min(prev + commentsPerPage, localComments.length)
    );
  };

  // Transform API response comments to match the expected format
  const transformComments = (comments) => {
    return comments.map((comment) => ({
      id: comment.id,
      comment: comment.comment,
      profile_id: comment.profile_id,
      comment_by: comment.comment_by,
      my_comment: comment.my_comment,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    }));
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !profileId || commentLoading) return;

    const body = {
      course_id: data?.id || data?._id,
      profile_id: profileId,
      comment: newComment.trim(),
    };

    // Clear input immediately for better UX
    setNewComment("");

    try {
      const response = await postComment("comment-course", body, token);
      console.log(response);

      if (response?.success && response?.data?.comments) {
        // Transform comments from API to match our format
        let apiComments = transformComments(response.data.comments);

        // Determine if the API is returning oldest-first or newest-first
        // We need to ensure newest comments appear at the beginning of the array
        const isNewestFirst =
          apiComments.length > 1
            ? new Date(apiComments[0].created_at) >
              new Date(apiComments[apiComments.length - 1].created_at)
            : true;

        // Only reverse if the API is returning oldest-first
        if (!isNewestFirst) {
          apiComments = apiComments.reverse();
        }

        // Update local state
        setLocalComments(apiComments);
        setTotalComments(response.data.comments.length);

        // Reset to show first 10 comments (which includes the new one at top)
        setDisplayedComments(10);

        // Notify parent component with transformed comments
        if (onCommentAdded) {
          onCommentAdded({
            success: response.success,
            comments: apiComments,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  if (!isOpen) return null;

  const hasMoreComments = displayedComments < localComments.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ChatCircle size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("courses.comments")} ({totalComments})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {getVisibleComments().length > 0 ? (
            <div className="space-y-3">
              {getVisibleComments().map((comment, index) => {
                const isMyComment = comment.my_comment === true;
                return (
                  <div
                    key={comment.id || `comment-${index}`}
                    className={`flex ${
                      isMyComment ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isMyComment
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      {/* Header with name and time */}
                      <div
                        className={`flex items-center gap-2 mb-1 text-xs ${
                          isMyComment ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">
                          {isMyComment ? t("courses.you") : comment.comment_by}
                        </span>
                        <span>•</span>
                        <span>
                          {formatTimeAgo(
                            comment.created_at || comment.updated_at
                          )}
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm leading-relaxed break-words">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMoreComments && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    className="text-xs text-gray-500 hover:text-primary transition-colors py-2 px-4 rounded-full hover:bg-gray-50"
                  >
                    {t("courses.load_older_comments")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {t("courses.no_comments")}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {t("courses.be_first_comment")}
              </p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="px-6 py-4 border-t border-gray-200">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("courses.write_comment")}
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              rows="2"
              maxLength="500"
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || commentLoading}
              className={`self-end px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                newComment.trim() && !commentLoading
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {commentLoading ? (
                <Spinner isWhite={true} isSmall={true} />
              ) : (
                <>
                  <PaperPlaneTilt size={18} weight="fill" />
                  <span className="text-sm font-medium">
                    {t("courses.send_comment")}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
