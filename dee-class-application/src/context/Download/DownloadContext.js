import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Using legacy API for SDK 54 compatibility - migrate to new API in future
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { LoginAuthContext } from "../Authentication/LoginAuth";
import {
  encryptFile,
  decryptFileForPlayback,
  cleanupTempFile,
  cleanupAllTempFiles,
} from "../../utils/encryption";

const DownloadContext = createContext();

export const useDownload = () => useContext(DownloadContext);

// Keys for AsyncStorage
const DOWNLOADED_COURSES_KEY = "downloadedCourses";
const DOWNLOAD_QUEUE_KEY = "downloadQueue";

export const DownloadProvider = ({ children }) => {
  const { t } = useTranslation();
  const [downloadedCourses, setDownloadedCourses] = useState([]);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({});
  const { selectedUser, user } = useContext(LoginAuthContext);

  // Check if user can download based on subscription
  const canDownload = user?.subscription?.canDownload === true &&
    user?.subscription?.status === "active" &&
    user?.subscription?.currentPeriodEnd &&
    new Date(user.subscription.currentPeriodEnd) > new Date();

  // Load saved downloads on app start
  useEffect(() => {
    loadDownloads();
    checkExpirations();
  }, []);

  // Process download queue when it changes or current download completes
  useEffect(() => {
    processDownloadQueue();
  }, [downloadQueue, currentDownload]);

  // Check for expired downloads daily
  useEffect(() => {
    const dailyCheck = setInterval(checkExpirations, 86400000); // 24 hours
    return () => clearInterval(dailyCheck);
  }, []);

  // Load downloaded courses from storage
  const loadDownloads = async () => {
    try {
      const savedCourses = await AsyncStorage.getItem(DOWNLOADED_COURSES_KEY);
      const savedQueue = await AsyncStorage.getItem(DOWNLOAD_QUEUE_KEY);

      if (savedCourses) {
        setDownloadedCourses(JSON.parse(savedCourses));
      }

      if (savedQueue) {
        setDownloadQueue(JSON.parse(savedQueue));
      }
    } catch (error) {
      console.error("Error loading downloaded courses:", error);
    }
  };

  // Save downloads to persistent storage
  const saveDownloads = async (courses) => {
    try {
      await AsyncStorage.setItem(
        DOWNLOADED_COURSES_KEY,
        JSON.stringify(courses)
      );
      setDownloadedCourses(courses);
    } catch (error) {
      console.error("Error saving downloaded courses:", error);
    }
  };

  // Save download queue to storage
  const saveDownloadQueue = async (queue) => {
    try {
      await AsyncStorage.setItem(DOWNLOAD_QUEUE_KEY, JSON.stringify(queue));
      setDownloadQueue(queue);
    } catch (error) {
      console.error("Error saving download queue:", error);
    }
  };

  // Generate a secure hash for the file name
  const generateSecureFileName = async (str) => {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      str
    );
    return hash;
  };

  // Check device storage space
  const checkStorageSpace = async (estimatedSize = 200 * 1024 * 1024) => {
    // Default 200MB estimate
    try {
      const { freeDiskStorage } = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory
      );

      // If free space is less than estimated size + 50MB buffer
      if (freeDiskStorage < estimatedSize + 50 * 1024 * 1024) {
        Alert.alert(
          t("downloads.storage_warning_title"),
          t("downloads.storage_warning_message"),
          [{ text: t("general.ok") }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking storage space:", error);
      return false;
    }
  };

  // Start downloading a course
  const downloadCourse = async (course) => {
    // Check if user has download permission from subscription
    if (!canDownload) {
      Alert.alert(
        t("downloads.no_permission_title"),
        t("downloads.no_permission_message"),
        [{ text: t("general.ok") }]
      );
      return false;
    }

    // Check if course is already downloaded
    if (downloadedCourses.some((c) => c.id === course.id)) {
      Alert.alert(
        t("downloads.already_downloaded_title"),
        t("downloads.already_downloaded_message"),
        [{ text: t("general.ok") }]
      );
      return false;
    }

    // Check if course is already in queue - silently return (no alert needed)
    if (
      downloadQueue.some((c) => c.id === course.id) ||
      (currentDownload && currentDownload.id === course.id)
    ) {
      console.log("[Download] Course already in queue:", course.id);
      return false;
    }

    // Verify storage space
    const hasEnoughSpace = await checkStorageSpace();
    if (!hasEnoughSpace) return false;

    // Add to queue with user ID
    const newQueue = [
      ...downloadQueue,
      {
        ...course,
        downloadedByUserId: selectedUser?.id, // Store the user ID with the course
        queuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
      },
    ];

    await saveDownloadQueue(newQueue);
    return true;
  };

  // Process download queue
  const processDownloadQueue = async () => {
    // If already downloading or queue is empty, do nothing
    if (currentDownload || downloadQueue.length === 0) {
      return;
    }

    // Get next course from queue
    const nextCourse = downloadQueue[0];
    setCurrentDownload(nextCourse);

    // Update queue
    const newQueue = downloadQueue.slice(1);
    await saveDownloadQueue(newQueue);

    // Start the actual download process
    try {
      await downloadCourseFiles(nextCourse);
    } catch (error) {
      console.error("Error downloading course:", error);
      Alert.alert(t("downloads.error_title"), t("downloads.error_message"), [
        { text: t("general.ok") },
      ]);
    } finally {
      setCurrentDownload(null);
      setDownloadProgress({});
    }
  };

  // Download course files
  const downloadCourseFiles = async (course) => {
    try {
      // Create directory for course files
      const courseDir = `${FileSystem.documentDirectory}courses/${course.id}/`;
      await FileSystem.makeDirectoryAsync(courseDir, { intermediates: true });

      // Save course metadata
      const metadataFile = `${courseDir}metadata.json`;
      await FileSystem.writeAsStringAsync(metadataFile, JSON.stringify(course));

      // Download trailer video
      let downloadedFiles = [];

      if (course.trailer_with_api_video_object?.assets?.mp4) {
        const trailerUrl = course.trailer_with_api_video_object.assets.mp4;
        const trailerHash = await generateSecureFileName(trailerUrl);
        const trailerFilePath = `${courseDir}trailer_${trailerHash}.mp4`;

        await downloadFile(trailerUrl, trailerFilePath, "trailer", course.id);

        downloadedFiles.push({
          type: "trailer",
          originalUrl: trailerUrl,
          localPath: trailerFilePath,
        });
      }

      // Download course videos based on course type
      if (
        course.course_type === "single" &&
        course.api_video_object?.assets?.mp4
      ) {
        const videoUrl = course.api_video_object.assets.mp4;
        const videoHash = await generateSecureFileName(videoUrl);
        const videoFilePath = `${courseDir}video_${videoHash}.mp4`;

        await downloadFile(videoUrl, videoFilePath, "main", course.id);

        downloadedFiles.push({
          type: "main",
          originalUrl: videoUrl,
          localPath: videoFilePath,
        });
      } else if (course.course_type === "series" && course.series) {
        // Download series videos
        for (let i = 0; i < course.series.length; i++) {
          const episode = course.series[i];
          if (episode.series_video_id?.assets?.mp4) {
            const videoUrl = episode.series_video_id.assets.mp4;
            const videoHash = await generateSecureFileName(videoUrl);
            const videoFilePath = `${courseDir}series_${i}_${videoHash}.mp4`;

            await downloadFile(
              videoUrl,
              videoFilePath,
              `series_${i}`,
              course.id
            );

            downloadedFiles.push({
              type: "series",
              index: i,
              originalUrl: videoUrl,
              localPath: videoFilePath,
              title: episode.title,
            });
          }
        }
      } else if (
        course.course_type === "playlist" &&
        course.playlist_chapters
      ) {
        // Download playlist videos
        for (let i = 0; i < course.playlist_chapters.length; i++) {
          const chapter = course.playlist_chapters[i];
          if (chapter.lessons) {
            for (let j = 0; j < chapter.lessons.length; j++) {
              const lesson = chapter.lessons[j];
              if (lesson.video_id?.assets?.mp4) {
                const videoUrl = lesson.video_id.assets.mp4;
                const videoHash = await generateSecureFileName(videoUrl);
                const videoFilePath = `${courseDir}playlist_${i}_${j}_${videoHash}.mp4`;

                await downloadFile(
                  videoUrl,
                  videoFilePath,
                  `playlist_${i}_${j}`,
                  course.id
                );

                downloadedFiles.push({
                  type: "playlist",
                  chapterIndex: i,
                  lessonIndex: j,
                  originalUrl: videoUrl,
                  localPath: videoFilePath,
                  title: lesson.title,
                  chapterTitle: chapter.title,
                });
              }
            }
          }
        }
      }

      // Add to downloaded courses with user ID
      const downloadedCourse = {
        ...course,
        downloadedFiles,
        downloadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days
        downloadedByUserId: course.downloadedByUserId || selectedUser?.id, // Ensure user ID is stored
      };

      const newDownloadedCourses = [...downloadedCourses, downloadedCourse];
      await saveDownloads(newDownloadedCourses);

      return true;
    } catch (error) {
      console.error("Error in downloadCourseFiles:", error);
      throw error;
    }
  };

  // Download a single file with progress tracking
  const downloadFile = async (url, filePath, fileId, courseId) => {
    // Set initial progress
    setDownloadProgress((prev) => ({
      ...prev,
      [fileId]: {
        progress: 0,
        courseId,
      },
    }));

    // Start download
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      filePath,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;

        setDownloadProgress((prev) => ({
          ...prev,
          [fileId]: {
            progress,
            courseId,
          },
        }));
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();

      // NOTE: Encryption disabled for performance - JavaScript-based encryption
      // is too slow for large video files and blocks the UI.
      // TODO: Implement native encryption module for better performance
      // if (result && result.uri) {
      //   console.log(`Encrypting downloaded file: ${filePath}`);
      //   const encrypted = await encryptFile(filePath);
      //   if (!encrypted) {
      //     console.warn(`Failed to encrypt file: ${filePath}`);
      //   }
      // }

      return result;
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
      throw error;
    }
  };

  // Check if any downloads have expired and remove them
  const checkExpirations = async () => {
    const now = new Date();
    const expiredCourses = downloadedCourses.filter(
      (course) => new Date(course.expiresAt) < now
    );

    if (expiredCourses.length > 0) {
      await Promise.all(expiredCourses.map(deleteCourse));

      // Update downloaded courses list
      const newCourses = downloadedCourses.filter(
        (course) => new Date(course.expiresAt) >= now
      );
      await saveDownloads(newCourses);
    }
  };

  // Delete a course and its files
  const deleteCourse = async (course) => {
    try {
      const courseDir = `${FileSystem.documentDirectory}courses/${course.id}/`;
      await FileSystem.deleteAsync(courseDir, { idempotent: true });

      const newDownloadedCourses = downloadedCourses.filter(
        (c) => c.id !== course.id
      );
      await saveDownloads(newDownloadedCourses);

      return true;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  };

  // Check if a course is already downloaded
  const isCourseDownloaded = (courseId) => {
    return getUserDownloads().some((c) => c.id === courseId);
  };

  // Get download info for a specific course
  const getCourseDownloadInfo = (courseId) => {
    return getUserDownloads().find((c) => c.id === courseId);
  };

  // Get downloaded course by slug (for offline mode navigation)
  const getCourseBySlug = (slug) => {
    return getUserDownloads().find((c) => c.slug === slug);
  };

  // Filter downloads by current user
  const getUserDownloads = () => {
    if (!selectedUser) return [];

    return downloadedCourses.filter(
      (course) =>
        !course.downloadedByUserId ||
        course.downloadedByUserId === selectedUser.id
    );
  };

  // Calculate days remaining before expiration
  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <DownloadContext.Provider
      value={{
        downloadedCourses: getUserDownloads(), // Filter by current user
        downloadQueue,
        currentDownload,
        downloadProgress,
        downloadCourse,
        deleteCourse,
        isCourseDownloaded,
        getCourseDownloadInfo,
        getCourseBySlug,
        getDaysRemaining,
        // Encryption utilities for secure playback
        decryptFileForPlayback,
        cleanupTempFile,
        cleanupAllTempFiles,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};
