import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormLabel,
  CProgress,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { api } from '../services/api'

const VideoUploader = ({ entityId, entityType, existingVideoId }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [videoId, setVideoId] = useState(existingVideoId || null)
  const [uploadToken, setUploadToken] = useState(null)

  // Update videoId when existingVideoId prop changes
  useEffect(() => {
    if (existingVideoId) {
      setVideoId(existingVideoId)
    }
  }, [existingVideoId])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)

    try {
      // Step 1: Get a delegated upload token
      const endpoint =
        entityType === 'course'
          ? `/videos/courses/${entityId}/upload-token`
          : `/videos/course-sessions/${entityId}/upload-token`

      const tokenResponse = await api.get(endpoint)

      // Check for different response formats and ensure we get the token
      let token
      if (tokenResponse?.data?.data?.uploadToken) {
        token = tokenResponse.data.data.uploadToken
      } else if (tokenResponse?.data?.uploadToken) {
        token = tokenResponse.data.uploadToken
      } else {
        throw new Error('Failed to get upload token - invalid response format')
      }

      setUploadToken(token)

      // Step 2: Initialize the api.video uploader
      // Load the uploader library dynamically if it's not already loaded
      if (!window.VideoUploader) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/@api.video/video-uploader'
        script.async = true
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      // Step 3: Upload the file directly to api.video
      const uploader = new window.VideoUploader({
        file: selectedFile,
        uploadToken: token,
        chunkSize: 1024 * 1024 * 10, // 10MB chunks
        retries: 5,
      })

      // Track upload progress
      uploader.onProgress((event) => {
        const totalPercentComplete = Math.round(
          (event.uploadedBytes / event.totalBytes) * 100,
        )
        setUploadProgress(totalPercentComplete)
      })

      // Start the upload
      const video = await uploader.upload()

      // Step 4: Save the video information in our backend
      const saveEndpoint =
        entityType === 'course'
          ? `/videos/courses/${entityId}/save-video`
          : `/videos/course-sessions/${entityId}/save-video`

      const saveResponse = await api.post(saveEndpoint, {
        videoId: video.videoId,
      })

      setSuccess('Video uploaded successfully!')
      setVideoId(video.videoId)
    } catch (err) {
      setError(`Upload failed: ${err.response?.data?.message || err.message}`)
      console.error('Error uploading video:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        {entityType === 'course'
          ? 'Course Trailer Video'
          : 'Course Session Video'}
      </CCardHeader>
      <CCardBody>
        {videoId && !selectedFile && (
          <CAlert color="success" className="mb-3">
            Video already uploaded with ID: {videoId}
          </CAlert>
        )}

        <div className="mb-3">
          <CFormLabel>Select Video File</CFormLabel>
          <CFormInput
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <CButton
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Uploading...
            </>
          ) : videoId ? (
            'Change Video'
          ) : (
            'Upload Video'
          )}
        </CButton>

        {isUploading && (
          <CProgress className="mt-3" value={uploadProgress}>
            {uploadProgress}%
          </CProgress>
        )}

        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" className="mt-3">
            {success}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default VideoUploader
