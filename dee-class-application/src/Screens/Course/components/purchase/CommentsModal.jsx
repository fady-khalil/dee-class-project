import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../../../../styles/colors";
import { LoginAuthContext } from "../../../../context/Authentication/LoginAuth";
import { usePostData } from "../../../../Hooks/usePostData";

const CommentsModal = ({ isOpen, onClose, data, onCommentAdded }) => {
  const { t } = useTranslation();
  const auth = useContext(LoginAuthContext);
  const selectedUser = auth ? auth.selectedUser : null;
  const token = auth ? auth.token : null;
  const { postData: postComment, isLoading: commentLoading } = usePostData();

  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [displayedComments, setDisplayedComments] = useState(10);
  const commentsPerPage = 10;

  // Disable interaction outside modal
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
      my_comment: comment.profile_id === selectedUser?.id,
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
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedUser?.id || commentLoading) return;

    const body = {
      course_id: data?.id,
      profile_id: selectedUser.id,
      comment: newComment.trim(),
    };

    // Clear input immediately for better UX
    setNewComment("");

    try {
      const response = await postComment("comment-course", body, token);
      //   console.log(response, "response from handleSubmitComment");
      console.log(token, "   from handleSubmitComment");
      console.log(body, "response from handleSubmitComment");

      if (response?.success && response?.comments) {
        // Transform comments from API to match our format
        let apiComments = transformComments(response.comments);

        // Determine if the API is returning oldest-first or newest-first
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
        setTotalComments(apiComments.length);

        // Reset to show first 10 comments (which includes the new one at top)
        setDisplayedComments(Math.min(10, apiComments.length));

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
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Icon name="chat" size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>
                  {t("courses.comments")} ({totalComments})
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.darkWhite} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={getVisibleComments()}
              keyExtractor={(item, index) =>
                item.id?.toString() || `comment-${index}`
              }
              style={styles.commentsList}
              contentContainerStyle={
                getVisibleComments().length === 0
                  ? styles.emptyListContent
                  : styles.listContent
              }
              ListEmptyComponent={
                <View style={styles.emptyCommentsContainer}>
                  <Icon name="chat" size={48} color={COLORS.darkGrey} />
                  <Text style={styles.emptyCommentsText}>
                    {t("courses.no_comments")}
                  </Text>
                  <Text style={styles.emptyCommentsSubtext}>
                    {t("courses.be_first_comment")}
                  </Text>
                </View>
              }
              ListFooterComponent={
                hasMoreComments ? (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={handleLoadMore}
                  >
                    <Text style={styles.loadMoreText}>
                      {t("courses.load_older_comments")}
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={({ item, index }) => {
                const isMyComment = item.my_comment === true;
                return (
                  <View
                    style={[
                      styles.commentContainer,
                      isMyComment ? styles.myCommentContainer : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.commentBubble,
                        isMyComment ? styles.myCommentBubble : null,
                      ]}
                    >
                      {/* Header with name and time */}
                      <View style={styles.commentHeader}>
                        <Text
                          style={[
                            styles.commentAuthor,
                            isMyComment ? styles.myCommentAuthor : null,
                          ]}
                        >
                          {isMyComment ? t("courses.you") : item.comment_by}
                        </Text>
                        <Text
                          style={[
                            styles.commentTime,
                            isMyComment ? styles.myCommentTime : null,
                          ]}
                        >
                          {formatTimeAgo(item.created_at || item.updated_at)}
                        </Text>
                      </View>

                      {/* Comment text */}
                      <Text
                        style={[
                          styles.commentText,
                          isMyComment ? styles.myCommentText : null,
                        ]}
                      >
                        {item.comment}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />

            {/* Comment Form */}
            <View style={styles.newCommentContainer}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder={t("courses.write_comment")}
                placeholderTextColor={COLORS.darkWhite}
                style={styles.commentInput}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                style={[
                  styles.sendButton,
                  (!newComment.trim() || commentLoading) &&
                    styles.sendButtonDisabled,
                ]}
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Icon name="send" size={24} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    flexDirection: "column",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.backgroundColor,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  commentsList: {
    flexGrow: 1,
    maxHeight: "70%",
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyCommentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyCommentsText: {
    color: COLORS.darkGrey,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  emptyCommentsSubtext: {
    color: COLORS.darkWhite,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  myCommentContainer: {
    justifyContent: "flex-end",
  },
  commentBubble: {
    maxWidth: "70%",
    backgroundColor: COLORS.darkGrey,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  myCommentBubble: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.white,
    marginRight: 4,
  },
  myCommentAuthor: {
    color: "rgba(255,255,255,0.9)",
  },
  commentTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginLeft: 4,
  },
  myCommentTime: {
    color: "rgba(255,255,255,0.7)",
  },
  commentText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
  myCommentText: {
    color: COLORS.white,
  },
  loadMoreButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 8,
  },
  loadMoreText: {
    fontSize: 12,
    color: COLORS.darkWhite,
  },
  newCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    padding: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: COLORS.backgroundColor,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.darkWhite,
  },
});

export default CommentsModal;
