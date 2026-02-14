import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilSearch, cilVideo } from '@coreui/icons'
import { api } from '../../services/api'

const TrendingCourse = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    text: '',
    text_ar: '',
  })

  // Reels data
  const [reels, setReels] = useState([])

  // Video ID input
  const [videoId, setVideoId] = useState('')
  const [fetchingVideo, setFetchingVideo] = useState(false)
  const [fetchedVideo, setFetchedVideo] = useState(null)

  // Courses for linking
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // Load data on mount
  useEffect(() => {
    loadData()
    loadCourses()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/trending')

      if (response?.data) {
        const data = response.data
        setFormData({
          title: data.title || '',
          title_ar: data.title_ar || '',
          text: data.text || '',
          text_ar: data.text_ar || '',
        })
        setReels(data.reels || [])
        // Check if there's actual content
        setHasData(data.title || data.title_ar || data.text || data.text_ar || data.reels?.length > 0)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await api.get('/admin/content/courses-list')
      if (response?.data) {
        setCourses(response.data)
      }
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/trending', formData)

      if (response?.success) {
        setSuccess('Trending Course section saved successfully!')
        setHasData(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save Trending Course section')
      }
    } catch (err) {
      setError('Failed to save Trending Course section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the Trending Course section content?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.put('/admin/content/trending', {
        title: '',
        title_ar: '',
        text: '',
        text_ar: '',
      })

      if (response?.success) {
        setFormData({
          title: '',
          title_ar: '',
          text: '',
          text_ar: '',
        })
        setHasData(reels.length > 0)
        setSuccess('Trending Course section deleted successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete Trending Course section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadData() // Reload original data
  }

  // Fetch video data from api.video
  const handleFetchVideo = async () => {
    if (!videoId.trim()) {
      setError('Please enter a video ID')
      return
    }

    setFetchingVideo(true)
    setError(null)
    setFetchedVideo(null)

    try {
      const response = await api.get(`/admin/content/video/${videoId.trim()}`)

      if (response?.success && response?.data) {
        setFetchedVideo(response.data)
      } else {
        setError(response?.message || 'Failed to fetch video data')
      }
    } catch (err) {
      setError('Failed to fetch video data. Please check the video ID.')
      console.error(err)
    } finally {
      setFetchingVideo(false)
    }
  }

  // Add reel to the list
  const handleAddReel = async () => {
    if (!fetchedVideo) {
      setError('Please fetch a video first')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        videoId: fetchedVideo.videoId,
        title: fetchedVideo.title,
        description: fetchedVideo.description,
        assets: fetchedVideo.assets,
      }
      if (selectedCourseId) payload.courseId = selectedCourseId

      const response = await api.post('/admin/content/trending/reels', payload)

      if (response?.success) {
        setReels(response.data.reels || [])
        setFetchedVideo(null)
        setVideoId('')
        setSelectedCourseId('')
        setHasData(true)
        setSuccess('Reel added successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to add reel')
      }
    } catch (err) {
      setError('Failed to add reel')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Remove reel from the list
  const handleRemoveReel = async (reelVideoId) => {
    if (!window.confirm('Are you sure you want to remove this reel?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.delete(`/admin/content/trending/reels/${reelVideoId}`)

      if (response?.success) {
        setReels(response.data.reels || [])
        setSuccess('Reel removed successfully!')
        setTimeout(() => setSuccess(null), 3000)
        // Update hasData
        const data = response.data
        setHasData(data.title || data.title_ar || data.text || data.text_ar || data.reels?.length > 0)
      } else {
        setError(response?.message || 'Failed to remove reel')
      }
    } catch (err) {
      setError('Failed to remove reel')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // View Mode
  if (!isEditing) {
    return (
      <>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Trending Course Section</strong>
            {hasData ? (
              <div>
                <CButton color="primary" size="sm" className="me-2" onClick={() => setIsEditing(true)}>
                  <CIcon icon={cilPencil} className="me-1" />
                  Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={handleDelete} disabled={saving}>
                  <CIcon icon={cilTrash} className="me-1" />
                  Delete
                </CButton>
              </div>
            ) : (
              <CButton color="primary" size="sm" onClick={() => setIsEditing(true)}>
                <CIcon icon={cilPlus} className="me-1" />
                Add Trending Course Section
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}

            {hasData || formData.title || formData.text ? (
              <CTable bordered>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '200px' }}>Title (EN)</CTableHeaderCell>
                    <CTableDataCell>{formData.title || '-'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Title (AR)</CTableHeaderCell>
                    <CTableDataCell dir="rtl">{formData.title_ar || '-'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Text (EN)</CTableHeaderCell>
                    <CTableDataCell style={{ whiteSpace: 'pre-wrap' }}>{formData.text || '-'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Text (AR)</CTableHeaderCell>
                    <CTableDataCell dir="rtl" style={{ whiteSpace: 'pre-wrap' }}>{formData.text_ar || '-'}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            ) : (
              <CAlert color="info">
                No Trending Course section content configured yet. Click "Add Trending Course Section" to create one.
              </CAlert>
            )}
          </CCardBody>
        </CCard>

        {/* Reels Management Card */}
        <CCard>
          <CCardHeader>
            <strong>Reels Videos</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}

            {/* Add Reel Section */}
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="mb-3">Add New Reel</h6>
              <CRow className="align-items-end">
                <CCol md={6}>
                  <CFormLabel>Video ID</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Enter api.video Video ID (e.g., vi1KC3kffIRBF8PWgtSeMubL)"
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      disabled={fetchingVideo}
                    />
                    <CButton
                      color="primary"
                      onClick={handleFetchVideo}
                      disabled={fetchingVideo || !videoId.trim()}
                    >
                      {fetchingVideo ? <CSpinner size="sm" /> : <CIcon icon={cilSearch} />}
                      <span className="ms-1">Fetch</span>
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Link to Course</CFormLabel>
                  <CFormSelect
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    <option value="">-- No Course --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.name_ar ? `- ${c.name_ar}` : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Fetched Video Preview */}
              {fetchedVideo && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <CRow>
                    <CCol md={3}>
                      {fetchedVideo.assets?.thumbnail && (
                        <img
                          src={fetchedVideo.assets.thumbnail}
                          alt={fetchedVideo.title}
                          className="img-fluid rounded"
                          style={{ maxHeight: '120px' }}
                        />
                      )}
                    </CCol>
                    <CCol md={7}>
                      <h6>{fetchedVideo.title}</h6>
                      <p className="text-muted mb-1">
                        <small>Video ID: {fetchedVideo.videoId}</small>
                      </p>
                      {fetchedVideo.description && (
                        <p className="text-muted mb-0">
                          <small>{fetchedVideo.description}</small>
                        </p>
                      )}
                    </CCol>
                    <CCol md={2} className="d-flex align-items-center justify-content-end">
                      <CButton color="success" onClick={handleAddReel} disabled={saving}>
                        {saving ? <CSpinner size="sm" /> : <CIcon icon={cilPlus} />}
                        <span className="ms-1">Add</span>
                      </CButton>
                    </CCol>
                  </CRow>
                </div>
              )}
            </div>

            {/* Reels List */}
            <h6 className="mb-3">Current Reels ({reels.length})</h6>
            {reels.length === 0 ? (
              <CAlert color="info">
                No reels added yet. Use the form above to add reels by entering the Video ID.
              </CAlert>
            ) : (
              <div className="reels-list">
                {reels.map((reel, index) => (
                  <div key={reel.videoId} className="d-flex align-items-center p-3 border rounded mb-2">
                    <div className="me-3">
                      {reel.assets?.thumbnail ? (
                        <img
                          src={reel.assets.thumbnail}
                          alt={reel.title}
                          className="rounded"
                          style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-secondary d-flex align-items-center justify-content-center rounded"
                          style={{ width: '80px', height: '60px' }}
                        >
                          <CIcon icon={cilVideo} size="lg" className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{reel.title || 'Untitled'}</h6>
                      <small className="text-muted">ID: {reel.videoId}</small>
                      {reel.course && (
                        <div>
                          <small className="text-primary">
                            Course: {courses.find((c) => c._id === reel.course)?.name || reel.course}
                          </small>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="badge bg-secondary me-2">#{index + 1}</span>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveReel(reel.videoId)}
                        disabled={saving}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>
      </>
    )
  }

  // Edit Mode
  return (
    <CCard>
      <CCardHeader>
        <strong>{hasData ? 'Edit Trending Course Section' : 'Add Trending Course Section'}</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-4">
            <CCol md={6}>
              <h5>English Content</h5>
              <div className="mb-3">
                <CFormLabel>Title (EN)</CFormLabel>
                <CFormInput
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter English title"
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Text (EN)</CFormLabel>
                <CFormTextarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter English text"
                  rows={6}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <h5>Arabic Content</h5>
              <div className="mb-3">
                <CFormLabel>Title (AR)</CFormLabel>
                <CFormInput
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleInputChange}
                  placeholder="Enter Arabic title"
                  dir="rtl"
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Text (AR)</CFormLabel>
                <CFormTextarea
                  name="text_ar"
                  value={formData.text_ar}
                  onChange={handleInputChange}
                  placeholder="Enter Arabic text"
                  rows={6}
                  dir="rtl"
                />
              </div>
            </CCol>
          </CRow>

          <div className="d-flex gap-2">
            <CButton type="submit" color="primary" disabled={saving}>
              {saving ? <CSpinner size="sm" className="me-2" /> : null}
              Save
            </CButton>
            <CButton type="button" color="secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default TrendingCourse
