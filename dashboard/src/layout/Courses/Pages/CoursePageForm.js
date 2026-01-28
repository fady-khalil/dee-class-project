import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../services/api'
import {
  CCard,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilCheckCircle, cilWarning } from '@coreui/icons'
import { BASE_URL } from '../../../config'

const CoursePageForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditing = !!slug

  const [categories, setCategories] = useState([])
  const [instructors, setInstructors] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    category: '',
    instructor: '',
    price: '',
    course_type: 'single',
  })

  // Video data states (pre-fetched from api.video)
  const [trailerVideoId, setTrailerVideoId] = useState('')
  const [trailerData, setTrailerData] = useState(null)
  const [trailerLoading, setTrailerLoading] = useState(false)

  const [mainVideoId, setMainVideoId] = useState('')
  const [mainVideoData, setMainVideoData] = useState(null)
  const [mainVideoLoading, setMainVideoLoading] = useState(false)

  // Series lessons state
  const [seriesLessons, setSeriesLessons] = useState([])

  // Chapters state (for playlist)
  const [chapters, setChapters] = useState([])

  // Image states
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageArFile, setImageArFile] = useState(null)
  const [imageArPreview, setImageArPreview] = useState('')
  const [mobileImageFile, setMobileImageFile] = useState(null)
  const [mobileImagePreview, setMobileImagePreview] = useState('')
  const [mobileImageArFile, setMobileImageArFile] = useState(null)
  const [mobileImageArPreview, setMobileImageArPreview] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [activeTab, setActiveTab] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchInstructors()
    if (isEditing) {
      fetchCourseData()
    }
  }, [isEditing, slug])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/course-categories')
      const data = response?.data?.data || response?.data || []
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors')
      const data = response?.data || []
      setInstructors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch instructors:', error)
    }
  }

  const fetchCourseData = async () => {
    try {
      const response = await api.get(`/courses/admin/translations/${slug}`)
      const data = response.data.data || response.data

      setFormData({
        name: data.name || '',
        name_ar: data.name_ar || '',
        description: data.description || '',
        description_ar: data.description_ar || '',
        category: data.category?._id || data.category || '',
        instructor: data.instructor?._id || data.instructor || '',
        price: data.price || '',
        course_type: data.course_type || 'single',
      })

      // Set image previews
      if (data.image?.data) setImagePreview(`${BASE_URL}/${data.image.data}`)
      if (data.image_ar?.data) setImageArPreview(`${BASE_URL}/${data.image_ar.data}`)
      if (data.mobileImage?.data) setMobileImagePreview(`${BASE_URL}/${data.mobileImage.data}`)
      if (data.mobileImage_ar?.data) setMobileImageArPreview(`${BASE_URL}/${data.mobileImage_ar.data}`)

      // Set trailer data
      if (data.trailer?.videoId) {
        setTrailerVideoId(data.trailer.videoId)
        setTrailerData(data.trailer)
      }

      // Set main video data (for single course)
      if (data.video?.videoId) {
        setMainVideoId(data.video.videoId)
        setMainVideoData(data.video)
      }

      // Set series lessons
      if (data.series && data.series.length > 0) {
        setSeriesLessons(data.series.map((lesson) => ({
          title: lesson.title || '',
          title_ar: lesson.title_ar || '',
          description: lesson.description || '',
          description_ar: lesson.description_ar || '',
          videoId: lesson.video?.videoId || '',
          video: lesson.video || null,
          videoLoading: false,
        })))
      }

      // Set chapters
      if (data.chapters && data.chapters.length > 0) {
        setChapters(data.chapters.map((chapter) => ({
          title: chapter.title || '',
          title_ar: chapter.title_ar || '',
          lessons: (chapter.lessons || []).map((lesson) => ({
            title: lesson.title || '',
            title_ar: lesson.title_ar || '',
            videoId: lesson.video?.videoId || '',
            video: lesson.video || null,
            videoLoading: false,
          })),
        })))
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
      setErrorMessage('Failed to load course data')
    }
  }

  // Fetch video details from api.video
  const fetchVideoDetails = async (videoId) => {
    try {
      const response = await api.get(`/courses/video/${videoId}`)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch video details')
    } catch (error) {
      console.error('Error fetching video:', error)
      throw new Error(error.message || 'Failed to fetch video details')
    }
  }

  // Handle trailer video save
  const handleSaveTrailer = async () => {
    if (!trailerVideoId.trim()) return
    setTrailerLoading(true)
    try {
      const videoData = await fetchVideoDetails(trailerVideoId.trim())
      setTrailerData(videoData)
    } catch (error) {
      setErrorMessage(`Failed to fetch trailer: ${error.message}`)
    } finally {
      setTrailerLoading(false)
    }
  }

  // Handle main video save (for single course)
  const handleSaveMainVideo = async () => {
    if (!mainVideoId.trim()) return
    setMainVideoLoading(true)
    try {
      const videoData = await fetchVideoDetails(mainVideoId.trim())
      setMainVideoData(videoData)
    } catch (error) {
      setErrorMessage(`Failed to fetch video: ${error.message}`)
    } finally {
      setMainVideoLoading(false)
    }
  }

  // Handle series lesson video save
  const handleSaveSeriesVideo = async (index) => {
    const lesson = seriesLessons[index]
    if (!lesson.videoId.trim()) return

    setSeriesLessons((prev) => prev.map((l, i) =>
      i === index ? { ...l, videoLoading: true } : l
    ))

    try {
      const videoData = await fetchVideoDetails(lesson.videoId.trim())
      setSeriesLessons((prev) => prev.map((l, i) =>
        i === index ? { ...l, video: videoData, videoLoading: false } : l
      ))
    } catch (error) {
      setErrorMessage(`Failed to fetch video for lesson ${index + 1}: ${error.message}`)
      setSeriesLessons((prev) => prev.map((l, i) =>
        i === index ? { ...l, videoLoading: false } : l
      ))
    }
  }

  // Handle chapter lesson video save
  const handleSaveChapterVideo = async (chapterIndex, lessonIndex) => {
    const lesson = chapters[chapterIndex].lessons[lessonIndex]
    if (!lesson.videoId.trim()) return

    setChapters((prev) => prev.map((c, ci) =>
      ci === chapterIndex ? {
        ...c,
        lessons: c.lessons.map((l, li) =>
          li === lessonIndex ? { ...l, videoLoading: true } : l
        )
      } : c
    ))

    try {
      const videoData = await fetchVideoDetails(lesson.videoId.trim())
      setChapters((prev) => prev.map((c, ci) =>
        ci === chapterIndex ? {
          ...c,
          lessons: c.lessons.map((l, li) =>
            li === lessonIndex ? { ...l, video: videoData, videoLoading: false } : l
          )
        } : c
      ))
    } catch (error) {
      setErrorMessage(`Failed to fetch video: ${error.message}`)
      setChapters((prev) => prev.map((c, ci) =>
        ci === chapterIndex ? {
          ...c,
          lessons: c.lessons.map((l, li) =>
            li === lessonIndex ? { ...l, videoLoading: false } : l
          )
        } : c
      ))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrorMessage('')
    setValidationErrors({})
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      switch (type) {
        case 'image':
          setImageFile(file)
          setImagePreview(previewUrl)
          break
        case 'image_ar':
          setImageArFile(file)
          setImageArPreview(previewUrl)
          break
        case 'mobileImage':
          setMobileImageFile(file)
          setMobileImagePreview(previewUrl)
          break
        case 'mobileImage_ar':
          setMobileImageArFile(file)
          setMobileImageArPreview(previewUrl)
          break
      }
    }
  }

  // Series lesson handlers
  const addSeriesLesson = () => {
    setSeriesLessons((prev) => [...prev, {
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      videoId: '',
      video: null,
      videoLoading: false,
    }])
  }

  const removeSeriesLesson = (index) => {
    setSeriesLessons((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSeriesLesson = (index, field, value) => {
    setSeriesLessons((prev) => prev.map((lesson, i) =>
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  // Chapter handlers
  const addChapter = () => {
    setChapters((prev) => [...prev, {
      title: '',
      title_ar: '',
      lessons: [],
    }])
  }

  const removeChapter = (index) => {
    setChapters((prev) => prev.filter((_, i) => i !== index))
  }

  const updateChapter = (index, field, value) => {
    setChapters((prev) => prev.map((chapter, i) =>
      i === index ? { ...chapter, [field]: value } : chapter
    ))
  }

  const addChapterLesson = (chapterIndex) => {
    setChapters((prev) => prev.map((chapter, i) =>
      i === chapterIndex ? {
        ...chapter,
        lessons: [...chapter.lessons, {
          title: '',
          title_ar: '',
          videoId: '',
          video: null,
          videoLoading: false,
        }]
      } : chapter
    ))
  }

  const removeChapterLesson = (chapterIndex, lessonIndex) => {
    setChapters((prev) => prev.map((chapter, i) =>
      i === chapterIndex ? {
        ...chapter,
        lessons: chapter.lessons.filter((_, li) => li !== lessonIndex)
      } : chapter
    ))
  }

  const updateChapterLesson = (chapterIndex, lessonIndex, field, value) => {
    setChapters((prev) => prev.map((chapter, ci) =>
      ci === chapterIndex ? {
        ...chapter,
        lessons: chapter.lessons.map((lesson, li) =>
          li === lessonIndex ? { ...lesson, [field]: value } : lesson
        )
      } : chapter
    ))
  }

  // Validation
  const validateForm = () => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Name is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required'
    if (!isEditing && !imageFile) errors.image = 'Image is required'

    // Validate videos based on course type
    if (formData.course_type === 'single') {
      if (!mainVideoData) errors.mainVideo = 'Main video is required. Click "Save" to fetch video details.'
    } else if (formData.course_type === 'series') {
      if (seriesLessons.length === 0) {
        errors.series = 'At least one lesson is required'
      } else {
        const missingVideos = seriesLessons.filter((l) => !l.video)
        if (missingVideos.length > 0) {
          errors.series = `${missingVideos.length} lesson(s) missing video data. Click "Save" to fetch video details.`
        }
      }
    } else if (formData.course_type === 'playlist') {
      if (chapters.length === 0) {
        errors.chapters = 'At least one chapter is required'
      } else {
        let missingCount = 0
        chapters.forEach((chapter) => {
          chapter.lessons.forEach((lesson) => {
            if (!lesson.video) missingCount++
          })
        })
        if (missingCount > 0) {
          errors.chapters = `${missingCount} lesson(s) missing video data. Click "Save" to fetch video details.`
        }
      }
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setValidationErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSubmitting(true)

    const submitData = new FormData()

    // Add text fields
    submitData.append('name', formData.name.trim())
    submitData.append('name_ar', formData.name_ar?.trim() || formData.name.trim())
    submitData.append('description', formData.description || '')
    submitData.append('description_ar', formData.description_ar || '')
    submitData.append('category', formData.category)
    submitData.append('instructor', formData.instructor || '')
    submitData.append('price', formData.price)
    submitData.append('course_type', formData.course_type)

    // Add trailer data (pre-fetched)
    if (trailerData) {
      submitData.append('trailer', JSON.stringify(trailerData))
    }

    // Add type-specific data
    if (formData.course_type === 'single' && mainVideoData) {
      submitData.append('video', JSON.stringify(mainVideoData))
    } else if (formData.course_type === 'series') {
      submitData.append('series', JSON.stringify(seriesLessons.map((l) => ({
        title: l.title,
        title_ar: l.title_ar,
        description: l.description,
        description_ar: l.description_ar,
        video: l.video,
      }))))
    } else if (formData.course_type === 'playlist') {
      submitData.append('chapters', JSON.stringify(chapters.map((c) => ({
        title: c.title,
        title_ar: c.title_ar,
        lessons: c.lessons.map((l) => ({
          title: l.title,
          title_ar: l.title_ar,
          video: l.video,
        })),
      }))))
    }

    // Add image files
    if (imageFile) submitData.append('image', imageFile)
    if (imageArFile) submitData.append('image_ar', imageArFile)
    if (mobileImageFile) submitData.append('mobileImage', mobileImageFile)
    if (mobileImageArFile) submitData.append('mobileImage_ar', mobileImageArFile)

    try {
      if (isEditing) {
        await api.putWithFile(`/courses/${slug}`, submitData)
      } else {
        await api.postWithFile('/courses', submitData)
      }
      navigate('/courses')
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage(error.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/courses')
  }

  // Video preview component
  const VideoPreview = ({ data, onRemove }) => (
    <div className="card mt-2">
      <div className="card-body p-2 d-flex align-items-center gap-3">
        {data.assets?.thumbnail && (
          <img
            src={data.assets.thumbnail}
            alt="Video thumbnail"
            style={{ width: '80px', height: '45px', objectFit: 'cover' }}
            className="rounded"
          />
        )}
        <div className="flex-grow-1">
          <p className="mb-0 small fw-semibold">{data.title || 'Untitled'}</p>
          <p className="mb-0 small text-muted">
            {data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')}` : 'N/A'}
          </p>
        </div>
        <CIcon icon={cilCheckCircle} className="text-success" size="lg" />
        {onRemove && (
          <CButton color="danger" size="sm" variant="ghost" onClick={onRemove}>
            <CIcon icon={cilTrash} />
          </CButton>
        )}
      </div>
    </div>
  )

  // Video input component with save button
  const VideoInput = ({ videoId, setVideoId, onSave, loading, videoData, label, required }) => (
    <div className="mb-3">
      <label className="form-label">{label} {required && '*'}</label>
      <div className="input-group">
        <CFormInput
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="Enter api.video Video ID"
          disabled={loading}
        />
        <CButton
          color="primary"
          onClick={onSave}
          disabled={loading || !videoId.trim()}
        >
          {loading ? <CSpinner size="sm" /> : 'Save'}
        </CButton>
      </div>
      {videoData && <VideoPreview data={videoData} onRemove={() => { setVideoId(''); }} />}
      {!videoData && videoId && !loading && (
        <small className="text-warning d-flex align-items-center gap-1 mt-1">
          <CIcon icon={cilWarning} size="sm" />
          Click "Save" to fetch video details
        </small>
      )}
    </div>
  )

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>{isEditing ? 'Edit Course' : 'Add New Course'}</h4>
        </div>

        {errorMessage && (
          <div className="alert alert-danger mb-3">{errorMessage}</div>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Language Tabs for Course Info - First */}
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)} role="tab">
                English
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)} role="tab">
                Arabic
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="p-3 border border-top-0 rounded-bottom mb-4">
            <CTabPane visible={activeTab === 1} role="tabpanel">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Name (English) *</label>
                  <CFormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    invalid={!!validationErrors.name}
                    required
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback d-block">{validationErrors.name}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Description (English)</label>
                  <CFormTextarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Image (English) {!isEditing && '*'}</label>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileChange(e, 'image')}
                    accept="image/*"
                    invalid={!!validationErrors.image}
                  />
                  {validationErrors.image && (
                    <div className="invalid-feedback d-block">{validationErrors.image}</div>
                  )}
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px' }} className="img-thumbnail" />
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile Image (English)</label>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileChange(e, 'mobileImage')}
                    accept="image/*"
                  />
                  {mobileImagePreview && (
                    <div className="mt-2">
                      <img src={mobileImagePreview} alt="Preview" style={{ maxWidth: '150px', maxHeight: '150px' }} className="img-thumbnail" />
                    </div>
                  )}
                </div>
              </div>
            </CTabPane>

            <CTabPane visible={activeTab === 2} role="tabpanel">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Name (Arabic)</label>
                  <CFormInput
                    type="text"
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleInputChange}
                    dir="rtl"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description (Arabic)</label>
                  <CFormTextarea
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleInputChange}
                    rows={4}
                    dir="rtl"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Image (Arabic)</label>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileChange(e, 'image_ar')}
                    accept="image/*"
                  />
                  {imageArPreview && (
                    <div className="mt-2">
                      <img src={imageArPreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px' }} className="img-thumbnail" />
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile Image (Arabic)</label>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileChange(e, 'mobileImage_ar')}
                    accept="image/*"
                  />
                  {mobileImageArPreview && (
                    <div className="mt-2">
                      <img src={mobileImageArPreview} alt="Preview" style={{ maxWidth: '150px', maxHeight: '150px' }} className="img-thumbnail" />
                    </div>
                  )}
                </div>
              </div>
            </CTabPane>
          </CTabContent>

          {/* Settings Row - Category, Instructor, Price, Course Type */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label">Category *</label>
              <CFormSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                invalid={!!validationErrors.category}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.translations?.en?.title || cat.title || 'Unnamed'}
                  </option>
                ))}
              </CFormSelect>
              {validationErrors.category && (
                <div className="invalid-feedback d-block">{validationErrors.category}</div>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">Instructor</label>
              <CFormSelect
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
              >
                <option value="">Select instructor</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>{inst.name}</option>
                ))}
              </CFormSelect>
            </div>

            <div className="col-md-2">
              <label className="form-label">Price *</label>
              <CFormInput
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                invalid={!!validationErrors.price}
                required
                min="0"
                step="0.01"
              />
              {validationErrors.price && (
                <div className="invalid-feedback d-block">{validationErrors.price}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Course Type *</label>
              <div className="d-flex gap-3 mt-2">
                {[
                  { value: 'single', label: 'Single Video' },
                  { value: 'series', label: 'Series' },
                  { value: 'playlist', label: 'Playlist' },
                ].map((type) => (
                  <CFormCheck
                    key={type.value}
                    type="radio"
                    name="course_type"
                    id={`course_type_${type.value}`}
                    label={type.label}
                    value={type.value}
                    checked={formData.course_type === type.value}
                    onChange={handleInputChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trailer Section */}
          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">Trailer Video (Optional)</div>
            <div className="card-body">
              <VideoInput
                videoId={trailerVideoId}
                setVideoId={setTrailerVideoId}
                onSave={handleSaveTrailer}
                loading={trailerLoading}
                videoData={trailerData}
                label="Trailer Video ID"
                required={false}
              />
            </div>
          </div>

          {/* Single Course - Main Video */}
          {formData.course_type === 'single' && (
            <div className="card mb-4">
              <div className="card-header">Main Course Video</div>
              <div className="card-body">
                <VideoInput
                  videoId={mainVideoId}
                  setVideoId={setMainVideoId}
                  onSave={handleSaveMainVideo}
                  loading={mainVideoLoading}
                  videoData={mainVideoData}
                  label="Main Video ID"
                  required={true}
                />
                {validationErrors.mainVideo && (
                  <div className="text-danger small">{validationErrors.mainVideo}</div>
                )}
              </div>
            </div>
          )}

          {/* Series Course - Lessons */}
          {formData.course_type === 'series' && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Series Lessons</span>
                <CButton color="light" size="sm" onClick={addSeriesLesson}>
                  <CIcon icon={cilPlus} className="me-1" /> Add Lesson
                </CButton>
              </div>
              <div className="card-body">
                {validationErrors.series && (
                  <div className="alert alert-danger">{validationErrors.series}</div>
                )}
                {seriesLessons.length === 0 ? (
                  <p className="text-muted text-center py-4">No lessons added. Click "Add Lesson" to start.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>Title (EN / AR)</th>
                          <th>Description (EN / AR)</th>
                          <th style={{ width: '280px' }}>Video</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {seriesLessons.map((lesson, index) => (
                          <tr key={index}>
                            <td className="text-center fw-semibold">{index + 1}</td>
                            <td>
                              <CFormInput
                                size="sm"
                                value={lesson.title}
                                onChange={(e) => updateSeriesLesson(index, 'title', e.target.value)}
                                placeholder="English title"
                                className="mb-1"
                              />
                              <CFormInput
                                size="sm"
                                value={lesson.title_ar}
                                onChange={(e) => updateSeriesLesson(index, 'title_ar', e.target.value)}
                                placeholder="العنوان بالعربية"
                                dir="rtl"
                              />
                            </td>
                            <td>
                              <CFormTextarea
                                size="sm"
                                value={lesson.description}
                                onChange={(e) => updateSeriesLesson(index, 'description', e.target.value)}
                                placeholder="English description"
                                rows={1}
                                className="mb-1"
                              />
                              <CFormTextarea
                                size="sm"
                                value={lesson.description_ar}
                                onChange={(e) => updateSeriesLesson(index, 'description_ar', e.target.value)}
                                placeholder="الوصف بالعربية"
                                rows={1}
                                dir="rtl"
                              />
                            </td>
                            <td>
                              <div className="input-group input-group-sm mb-1">
                                <CFormInput
                                  value={lesson.videoId}
                                  onChange={(e) => updateSeriesLesson(index, 'videoId', e.target.value)}
                                  placeholder="Video ID"
                                  disabled={lesson.videoLoading}
                                />
                                <CButton
                                  color="primary"
                                  onClick={() => handleSaveSeriesVideo(index)}
                                  disabled={lesson.videoLoading || !lesson.videoId.trim()}
                                >
                                  {lesson.videoLoading ? <CSpinner size="sm" /> : 'Fetch'}
                                </CButton>
                              </div>
                              {lesson.video ? (
                                <div className="d-flex align-items-center gap-1">
                                  <CIcon icon={cilCheckCircle} className="text-success" size="sm" />
                                  <small className="text-success">{lesson.video.title || 'Video loaded'}</small>
                                </div>
                              ) : lesson.videoId && !lesson.videoLoading ? (
                                <small className="text-warning">
                                  <CIcon icon={cilWarning} size="sm" /> Click Fetch
                                </small>
                              ) : null}
                            </td>
                            <td className="text-center">
                              <CButton color="danger" size="sm" variant="ghost" onClick={() => removeSeriesLesson(index)}>
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Playlist Course - Chapters */}
          {formData.course_type === 'playlist' && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Chapters</span>
                <CButton color="light" size="sm" onClick={addChapter}>
                  <CIcon icon={cilPlus} className="me-1" /> Add Chapter
                </CButton>
              </div>
              <div className="card-body">
                {validationErrors.chapters && (
                  <div className="alert alert-danger">{validationErrors.chapters}</div>
                )}
                {chapters.length === 0 ? (
                  <p className="text-muted text-center py-4">No chapters added. Click "Add Chapter" to start.</p>
                ) : (
                  chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="card mb-3 border-primary">
                      <div className="card-header d-flex justify-content-between align-items-center py-2 bg-light border-primary">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <span className="fw-bold text-primary">Chapter {chapterIndex + 1}</span>
                          <CFormInput
                            size="sm"
                            value={chapter.title}
                            onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                            placeholder="Title (English)"
                            className="w-auto"
                            style={{ minWidth: '150px' }}
                          />
                          <CFormInput
                            size="sm"
                            value={chapter.title_ar}
                            onChange={(e) => updateChapter(chapterIndex, 'title_ar', e.target.value)}
                            placeholder="العنوان بالعربية"
                            dir="rtl"
                            className="w-auto"
                            style={{ minWidth: '150px' }}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <CButton color="success" size="sm" variant="outline" onClick={() => addChapterLesson(chapterIndex)}>
                            <CIcon icon={cilPlus} size="sm" /> Lesson
                          </CButton>
                          <CButton color="danger" size="sm" variant="ghost" onClick={() => removeChapter(chapterIndex)}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                      <div className="card-body p-2">
                        {chapter.lessons.length === 0 ? (
                          <p className="text-muted small text-center py-2 mb-0">No lessons. Click "+ Lesson" to add.</p>
                        ) : (
                          <table className="table table-sm table-bordered align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: '30px' }}>#</th>
                                <th>Title (EN)</th>
                                <th>Title (AR)</th>
                                <th style={{ width: '250px' }}>Video</th>
                                <th style={{ width: '40px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {chapter.lessons.map((lesson, lessonIndex) => (
                                <tr key={lessonIndex}>
                                  <td className="text-center small">{lessonIndex + 1}</td>
                                  <td>
                                    <CFormInput
                                      size="sm"
                                      value={lesson.title}
                                      onChange={(e) => updateChapterLesson(chapterIndex, lessonIndex, 'title', e.target.value)}
                                      placeholder="English title"
                                    />
                                  </td>
                                  <td>
                                    <CFormInput
                                      size="sm"
                                      value={lesson.title_ar}
                                      onChange={(e) => updateChapterLesson(chapterIndex, lessonIndex, 'title_ar', e.target.value)}
                                      placeholder="العنوان بالعربية"
                                      dir="rtl"
                                    />
                                  </td>
                                  <td>
                                    <div className="input-group input-group-sm">
                                      <CFormInput
                                        value={lesson.videoId}
                                        onChange={(e) => updateChapterLesson(chapterIndex, lessonIndex, 'videoId', e.target.value)}
                                        placeholder="Video ID"
                                        disabled={lesson.videoLoading}
                                      />
                                      <CButton
                                        color="primary"
                                        onClick={() => handleSaveChapterVideo(chapterIndex, lessonIndex)}
                                        disabled={lesson.videoLoading || !lesson.videoId.trim()}
                                      >
                                        {lesson.videoLoading ? <CSpinner size="sm" /> : 'Fetch'}
                                      </CButton>
                                    </div>
                                    {lesson.video && (
                                      <small className="text-success d-flex align-items-center gap-1 mt-1">
                                        <CIcon icon={cilCheckCircle} size="sm" /> {lesson.video.title || 'Loaded'}
                                      </small>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <CButton color="danger" size="sm" variant="ghost" onClick={() => removeChapterLesson(chapterIndex, lessonIndex)}>
                                      <CIcon icon={cilTrash} size="sm" />
                                    </CButton>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <CButton color="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CoursePageForm
