import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormCheck,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../services/api'

const HeroSection = () => {
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
    featured_courses: [],
  })

  // All courses for selection
  const [courses, setCourses] = useState([])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [heroResponse, coursesResponse] = await Promise.all([
        api.get('/admin/content/hero'),
        api.get('/admin/content/courses-list'),
      ])

      if (heroResponse?.data) {
        const data = heroResponse.data
        setFormData({
          title: data.title || '',
          title_ar: data.title_ar || '',
          text: data.text || '',
          text_ar: data.text_ar || '',
          featured_courses: data.featured_courses || [],
        })
        // Check if there's actual content
        setHasData(data.title || data.title_ar || data.text || data.text_ar || data.featured_courses?.length > 0)
      }

      if (coursesResponse?.data) {
        setCourses(coursesResponse.data)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => {
      const isSelected = prev.featured_courses.includes(courseId)
      return {
        ...prev,
        featured_courses: isSelected
          ? prev.featured_courses.filter((id) => id !== courseId)
          : [...prev.featured_courses, courseId],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/hero', formData)

      if (response?.success) {
        setSuccess('Hero section saved successfully!')
        setHasData(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save hero section')
      }
    } catch (err) {
      setError('Failed to save hero section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the hero section content?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.put('/admin/content/hero', {
        title: '',
        title_ar: '',
        text: '',
        text_ar: '',
        featured_courses: [],
      })

      if (response?.success) {
        setFormData({
          title: '',
          title_ar: '',
          text: '',
          text_ar: '',
          featured_courses: [],
        })
        setHasData(false)
        setSuccess('Hero section deleted successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete hero section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadData() // Reload original data
  }

  // Get selected course names for display
  const getSelectedCourseNames = () => {
    return courses
      .filter((c) => formData.featured_courses.includes(c._id))
      .map((c) => c.name)
      .join(', ')
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
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Hero Section</strong>
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
              Add Hero Section
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          {hasData ? (
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
                  <CTableDataCell>{formData.text || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Text (AR)</CTableHeaderCell>
                  <CTableDataCell dir="rtl">{formData.text_ar || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Featured Courses</CTableHeaderCell>
                  <CTableDataCell>
                    {formData.featured_courses.length > 0
                      ? `${formData.featured_courses.length} course(s) selected: ${getSelectedCourseNames()}`
                      : 'No courses selected'}
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          ) : (
            <CAlert color="info">
              No hero section content configured yet. Click "Add Hero Section" to create one.
            </CAlert>
          )}
        </CCardBody>
      </CCard>
    )
  }

  // Edit Mode
  return (
    <CCard>
      <CCardHeader>
        <strong>{hasData ? 'Edit Hero Section' : 'Add Hero Section'}</strong>
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
                  rows={4}
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
                  rows={4}
                  dir="rtl"
                />
              </div>
            </CCol>
          </CRow>

          <hr />

          <div className="mb-4">
            <h5>Featured Courses</h5>
            <p className="text-muted">Select courses to display in the hero section slider</p>

            {courses.length === 0 ? (
              <CAlert color="info">No courses available. Create some courses first.</CAlert>
            ) : (
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              >
                {courses.map((course) => (
                  <CFormCheck
                    key={course._id}
                    id={`course-${course._id}`}
                    label={`${course.name} ${course.name_ar ? `(${course.name_ar})` : ''}`}
                    checked={formData.featured_courses.includes(course._id)}
                    onChange={() => handleCourseToggle(course._id)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}

            <p className="mt-2 text-muted">
              Selected: {formData.featured_courses.length} course(s)
            </p>
          </div>

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

export default HeroSection
