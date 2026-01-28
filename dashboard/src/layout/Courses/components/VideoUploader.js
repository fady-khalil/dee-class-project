import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CFormInput,
  CProgress,
  CProgressBar,
  CCard,
  CCardBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CCollapse,
} from '@coreui/react'

// Debug mode - set to true to see detailed logs
const DEBUG_MODE = true

// Chunk size for large file uploads (16MB chunks)
const CHUNK_SIZE = 16 * 1024 * 1024

const VideoUploader = ({
  onVideoUploaded,
  existingVideo = null,
  entityType = 'course',
  entityId = null,
  apiKey = 'NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw',
}) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [videoData, setVideoData] = useState(null)
  const fileInputRef = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showSaveReminder, setShowSaveReminder] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)

  // Debug state
  const [debugLogs, setDebugLogs] = useState([])
  const [showDebug, setShowDebug] = useState(DEBUG_MODE)
  const [uploadStatus, setUploadStatus] = useState('')
  const abortControllerRef = useRef(null)

  // Debug logger function
  const debugLog = (step, message, data = null) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      step,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
    }
    console.log(`[${timestamp}] [${step}]`, message, data || '')
    setDebugLogs((prev) => [...prev, logEntry])
  }

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    if (existingVideo) {
      debugLog('INIT', 'Setting existing video data', existingVideo)
      setVideoData(existingVideo)
      setShowSaveReminder(false)
      setUpdateMode(false)
    }
  }, [existingVideo])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setDebugLogs([])
      debugLog('FILE_SELECT', 'File selected', {
        name: file.name,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        chunksNeeded: Math.ceil(file.size / CHUNK_SIZE),
        chunkSize: formatBytes(CHUNK_SIZE),
      })
    }
  }

  // Upload a single chunk
  const uploadChunk = async (videoId, file, chunkIndex, totalChunks, signal) => {
    const start = chunkIndex * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('file', chunk, file.name)

    const contentRange = `bytes ${start}-${end - 1}/${file.size}`

    debugLog('CHUNK_UPLOAD', `Uploading chunk ${chunkIndex + 1}/${totalChunks}`, {
      chunkIndex,
      start: formatBytes(start),
      end: formatBytes(end),
      chunkSize: formatBytes(end - start),
      contentRange,
    })

    const response = await fetch(
      `https://ws.api.video/videos/${videoId}/source`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Range': contentRange,
        },
        body: formData,
        signal,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Chunk ${chunkIndex + 1} failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file first')
      return
    }

    const uploadStartTime = Date.now()
    abortControllerRef.current = new AbortController()

    debugLog('UPLOAD_START', 'Starting upload process', {
      fileName: selectedFile.name,
      fileSize: formatBytes(selectedFile.size),
      entityType,
      entityId,
      uploadMethod: selectedFile.size > CHUNK_SIZE ? 'CHUNKED' : 'SINGLE',
    })

    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadStatus('Preparing...')

      // If we're updating, delete the old video first
      if (updateMode && videoData && videoData.videoId) {
        debugLog('DELETE_OLD', 'Deleting old video before upload', { videoId: videoData.videoId })
        setUploadStatus('Deleting old video...')
        try {
          const deleteResponse = await fetch(
            `https://ws.api.video/videos/${videoData.videoId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            },
          )

          debugLog('DELETE_OLD_RESPONSE', `Delete response: ${deleteResponse.status}`, {
            ok: deleteResponse.ok,
            status: deleteResponse.status,
            statusText: deleteResponse.statusText,
          })

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete old video: ${deleteResponse.statusText}`)
          } else {
            debugLog('DELETE_OLD_SUCCESS', 'Successfully deleted old video')
          }
        } catch (err) {
          debugLog('DELETE_OLD_ERROR', 'Error deleting old video', { error: err.message })
        }
      }

      // STEP 1: Create video container
      setUploadStatus('Creating video container...')
      debugLog('STEP_1', 'Creating video container on api.video')
      const videoTitle = selectedFile.name
      const videoDescription =
        entityType === 'session' || entityType === 'course-session'
          ? 'Course session video'
          : 'Course trailer video'
      const isPublic = true

      const createPayload = {
        title: videoTitle,
        description: videoDescription,
        public: isPublic,
      }
      debugLog('STEP_1_REQUEST', 'Create video request payload', createPayload)

      const videoCreationResponse = await fetch('https://ws.api.video/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(createPayload),
        signal: abortControllerRef.current.signal,
      })

      debugLog('STEP_1_RESPONSE', 'Create video response', {
        ok: videoCreationResponse.ok,
        status: videoCreationResponse.status,
        statusText: videoCreationResponse.statusText,
      })

      if (!videoCreationResponse.ok) {
        const errorText = await videoCreationResponse.text()
        debugLog('STEP_1_ERROR', 'Failed to create video container', { errorText })
        throw new Error(`Failed to create video: ${videoCreationResponse.statusText} - ${errorText}`)
      }

      const video = await videoCreationResponse.json()
      debugLog('STEP_1_SUCCESS', 'Video container created', {
        videoId: video.videoId,
        title: video.title,
      })

      // STEP 2: Upload the video file (chunked for large files)
      const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE)

      debugLog('STEP_2', 'Starting file upload to api.video', {
        videoId: video.videoId,
        fileSize: formatBytes(selectedFile.size),
        totalChunks,
        chunkSize: formatBytes(CHUNK_SIZE),
        method: totalChunks > 1 ? 'CHUNKED UPLOAD' : 'SINGLE UPLOAD',
      })

      let uploadResponse

      if (totalChunks === 1) {
        // Small file - single upload
        setUploadStatus('Uploading file...')
        debugLog('STEP_2_SINGLE', 'Using single upload for small file')

        const formData = new FormData()
        formData.append('file', selectedFile)

        const response = await fetch(
          `https://ws.api.video/videos/${video.videoId}/source`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
            signal: abortControllerRef.current.signal,
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Upload failed: ${response.status} - ${errorText}`)
        }

        uploadResponse = await response.json()
        setUploadProgress(100)
      } else {
        // Large file - chunked upload
        debugLog('STEP_2_CHUNKED', `Starting chunked upload: ${totalChunks} chunks`)
        setUploadStatus(`Uploading chunk 1/${totalChunks}...`)

        for (let i = 0; i < totalChunks; i++) {
          // Check if upload was cancelled
          if (abortControllerRef.current.signal.aborted) {
            throw new Error('Upload cancelled by user')
          }

          setUploadStatus(`Uploading chunk ${i + 1}/${totalChunks}...`)

          const chunkStartTime = Date.now()
          uploadResponse = await uploadChunk(
            video.videoId,
            selectedFile,
            i,
            totalChunks,
            abortControllerRef.current.signal
          )
          const chunkDuration = ((Date.now() - chunkStartTime) / 1000).toFixed(1)

          const progress = Math.round(((i + 1) / totalChunks) * 100)
          setUploadProgress(progress)

          debugLog('CHUNK_SUCCESS', `Chunk ${i + 1}/${totalChunks} uploaded`, {
            chunkNumber: i + 1,
            totalChunks,
            progress: `${progress}%`,
            chunkDuration: `${chunkDuration}s`,
            totalElapsed: `${((Date.now() - uploadStartTime) / 1000).toFixed(1)}s`,
          })
        }
      }

      debugLog('STEP_2_SUCCESS', 'File upload completed', {
        videoId: uploadResponse.videoId,
        duration: `${((Date.now() - uploadStartTime) / 1000).toFixed(1)}s`,
      })

      // STEP 3: Disable MP4 support
      setUploadStatus('Finalizing...')
      debugLog('STEP_3', 'Disabling MP4 progressive download')
      try {
        const patchResponse = await fetch(
          `https://ws.api.video/videos/${video.videoId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ mp4Support: false }),
          },
        )
        debugLog('STEP_3_RESPONSE', 'Patch response', {
          ok: patchResponse.ok,
          status: patchResponse.status,
        })
      } catch (e) {
        debugLog('STEP_3_ERROR', 'Error disabling mp4Support', { error: e.message })
      }

      // STEP 4: Get complete video data
      debugLog('STEP_4', 'Fetching complete video data')
      const videoDataResponse = await fetch(
        `https://ws.api.video/videos/${video.videoId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )

      debugLog('STEP_4_RESPONSE', 'Get video data response', {
        ok: videoDataResponse.ok,
        status: videoDataResponse.status,
      })

      if (!videoDataResponse.ok) {
        throw new Error(`Failed to get video data: ${videoDataResponse.statusText}`)
      }

      const completeVideoData = await videoDataResponse.json()
      debugLog('STEP_4_SUCCESS', 'Got complete video data', {
        videoId: completeVideoData.videoId,
        title: completeVideoData.title,
      })

      const totalDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(1)
      debugLog('COMPLETE', `Upload process completed successfully in ${totalDuration}s`, {
        totalDuration: totalDuration + 's',
        averageSpeed: formatBytes(selectedFile.size / parseFloat(totalDuration)) + '/s',
      })

      setUploadStatus('Complete!')
      setVideoData(completeVideoData)
      onVideoUploaded(completeVideoData)
      setUploading(false)
      setUpdateMode(false)
      setShowSaveReminder(true)
    } catch (err) {
      const totalDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(1)
      debugLog('UPLOAD_FAILED', `Upload failed after ${totalDuration}s`, {
        error: err.message,
        stack: err.stack,
      })
      console.error('Error uploading video:', err)
      setError(`Error uploading video: ${err.message || 'Unknown error'}`)
      setUploading(false)
      setUploadStatus('')
    }
  }

  const confirmRemove = () => {
    setShowDeleteModal(true)
  }

  const cancelRemove = () => {
    setShowDeleteModal(false)
  }

  const handleRemove = async () => {
    if (videoData) {
      try {
        setDeleting(true)
        debugLog('DELETE', 'Deleting video', { videoId: videoData.videoId })

        if (videoData.videoId) {
          const deleteResponse = await fetch(
            `https://ws.api.video/videos/${videoData.videoId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            },
          )

          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete video: ${deleteResponse.statusText}`)
          }
          debugLog('DELETE_SUCCESS', 'Video deleted successfully')
        }

        setVideoData(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        onVideoUploaded(null)
        setShowDeleteModal(false)
        setDeleting(false)
        setShowSaveReminder(true)
      } catch (err) {
        debugLog('DELETE_ERROR', 'Error deleting video', { error: err.message })
        console.error('Error removing video:', err)
        setError(`Error removing video: ${err.message || 'Unknown error'}`)
        setDeleting(false)
        setShowDeleteModal(false)
      }
    }
  }

  const toggleUpdateMode = () => {
    setUpdateMode(!updateMode)
    setSelectedFile(null)
    setDebugLogs([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getVideoTypeLabel = () => {
    return entityType === 'session' || entityType === 'course-session'
      ? 'Course Session Video'
      : 'Course Trailer'
  }

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      debugLog('CANCEL', 'User cancelled upload')
      abortControllerRef.current.abort()
      setUploading(false)
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  const clearDebugLogs = () => {
    setDebugLogs([])
  }

  return (
    <div className="video-uploader">
      {error && <div className="text-danger mb-3">{error}</div>}

      {videoData ? (
        <CCard className="mb-3">
          <CCardBody>
            <div className="d-flex justify-content-between mb-3">
              <h6>{getVideoTypeLabel()}</h6>
              <div>
                {!updateMode && (
                  <CButton
                    color="primary"
                    size="sm"
                    variant="outline"
                    onClick={toggleUpdateMode}
                  >
                    Change Video
                  </CButton>
                )}
                <CButton
                  color="danger"
                  size="sm"
                  variant="ghost"
                  className="ms-2"
                  onClick={confirmRemove}
                  disabled={deleting}
                >
                  {deleting ? <CSpinner size="sm" /> : 'Remove'}
                </CButton>
              </div>
            </div>

            {!updateMode ? (
              <>
                <div className="video-preview mb-3">
                  {videoData.assets && videoData.assets.thumbnail && (
                    <img
                      src={videoData.assets.thumbnail}
                      alt="Video thumbnail"
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px' }}
                    />
                  )}
                </div>
                <div className="video-info">
                  <p className="mb-1">
                    <strong>Title:</strong> {videoData.title}
                  </p>
                  {videoData.duration && (
                    <p className="mb-1">
                      <strong>Duration:</strong>{' '}
                      {Math.floor(videoData.duration / 60)}:
                      {(videoData.duration % 60).toString().padStart(2, '0')} min
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>ID:</strong> {videoData.videoId}
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong>{' '}
                    <span className="text-success">Ready</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <CFormInput
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="mb-3"
                  ref={fileInputRef}
                />
                <div className="d-flex justify-content-between">
                  <CButton
                    color="secondary"
                    size="sm"
                    onClick={toggleUpdateMode}
                    disabled={uploading}
                  >
                    Cancel
                  </CButton>
                  <CButton
                    color="success"
                    size="sm"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? <CSpinner size="sm" /> : 'Upload New Video'}
                  </CButton>
                </div>
                {uploading && (
                  <>
                    <div className="mt-3">
                      <small className="text-muted">{uploadStatus}</small>
                    </div>
                    <CProgress className="mt-2">
                      <CProgressBar
                        value={uploadProgress}
                        color="info"
                        animated
                      >{`${uploadProgress}%`}</CProgressBar>
                    </CProgress>
                    <CButton
                      color="danger"
                      size="sm"
                      className="mt-2"
                      onClick={cancelUpload}
                    >
                      Cancel Upload
                    </CButton>
                  </>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      ) : (
        <div className="upload-form">
          <CFormInput
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="mb-3"
            ref={fileInputRef}
          />
          {selectedFile && (
            <div className="mb-3 p-2 bg-light rounded">
              <small>
                <strong>File:</strong> {selectedFile.name}<br />
                <strong>Size:</strong> {formatBytes(selectedFile.size)}<br />
                <strong>Type:</strong> {selectedFile.type}<br />
                {selectedFile.size > CHUNK_SIZE && (
                  <span className="text-info">
                    <strong>Upload method:</strong> Chunked ({Math.ceil(selectedFile.size / CHUNK_SIZE)} chunks of {formatBytes(CHUNK_SIZE)})
                  </span>
                )}
              </small>
            </div>
          )}
          <CButton
            color="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              `Upload ${getVideoTypeLabel()}`
            )}
          </CButton>
          {uploading && (
            <>
              <div className="mt-3">
                <small className="text-muted">{uploadStatus}</small>
              </div>
              <CProgress className="mt-2">
                <CProgressBar
                  value={uploadProgress}
                  color="info"
                  animated
                >{`${uploadProgress}%`}</CProgressBar>
              </CProgress>
              <CButton
                color="danger"
                size="sm"
                className="mt-2"
                onClick={cancelUpload}
              >
                Cancel Upload
              </CButton>
            </>
          )}
        </div>
      )}

      {showSaveReminder && (
        <div className="alert alert-info mt-3">
          <strong>Video changes detected!</strong> Don't forget to save the form
          to permanently apply these changes.
        </div>
      )}

      {/* Debug Panel */}
      {DEBUG_MODE && (
        <div className="mt-4">
          <CButton
            color="secondary"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide' : 'Show'} Debug Logs ({debugLogs.length})
          </CButton>
          {debugLogs.length > 0 && (
            <CButton
              color="link"
              size="sm"
              className="ms-2"
              onClick={clearDebugLogs}
            >
              Clear
            </CButton>
          )}
          <CCollapse visible={showDebug}>
            <div
              className="mt-2 p-3 bg-dark text-light rounded"
              style={{
                maxHeight: '400px',
                overflow: 'auto',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            >
              {debugLogs.length === 0 ? (
                <div className="text-muted">No logs yet. Select a file to start.</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-2 pb-2 border-bottom border-secondary ${
                      log.step.includes('ERROR') || log.step.includes('FAILED')
                        ? 'text-danger'
                        : log.step.includes('SUCCESS') || log.step.includes('COMPLETE')
                        ? 'text-success'
                        : ''
                    }`}
                  >
                    <div>
                      <span className="text-info">[{log.timestamp.split('T')[1].split('.')[0]}]</span>{' '}
                      <span className="text-warning">[{log.step}]</span>{' '}
                      {log.message}
                    </div>
                    {log.data && (
                      <pre className="mt-1 mb-0 text-muted" style={{ fontSize: '11px' }}>
                        {log.data}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </CCollapse>
        </div>
      )}

      {/* Delete confirmation modal */}
      <CModal visible={showDeleteModal} onClose={cancelRemove}>
        <CModalHeader onClose={cancelRemove}>
          <CModalTitle>Confirm Remove</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Are you sure you want to remove this video? This action cannot be
            undone.
          </p>
          <p className="text-danger">
            <strong>Warning:</strong> The video will be permanently deleted from
            api.video!
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelRemove}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleRemove} disabled={deleting}>
            {deleting ? <CSpinner size="sm" /> : 'Remove Video'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

VideoUploader.propTypes = {
  onVideoUploaded: PropTypes.func.isRequired,
  existingVideo: PropTypes.object,
  entityType: PropTypes.oneOf(['course', 'session']),
  entityId: PropTypes.string,
  apiKey: PropTypes.string,
}

export default VideoUploader
