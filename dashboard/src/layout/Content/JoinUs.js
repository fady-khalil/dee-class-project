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
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../services/api'

const JoinUs = () => {
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

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/join-us')

      if (response?.data) {
        const data = response.data
        setFormData({
          title: data.title || '',
          title_ar: data.title_ar || '',
          text: data.text || '',
          text_ar: data.text_ar || '',
        })
        // Check if there's actual content
        setHasData(data.title || data.title_ar || data.text || data.text_ar)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/join-us', formData)

      if (response?.success) {
        setSuccess('Join Us section saved successfully!')
        setHasData(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save Join Us section')
      }
    } catch (err) {
      setError('Failed to save Join Us section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the Join Us section content?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.put('/admin/content/join-us', {
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
        setHasData(false)
        setSuccess('Join Us section deleted successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete Join Us section')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadData() // Reload original data
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
          <strong>Join Us Section</strong>
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
              Add Join Us Section
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
              No Join Us section content configured yet. Click "Add Join Us Section" to create one.
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
        <strong>{hasData ? 'Edit Join Us Section' : 'Add Join Us Section'}</strong>
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

export default JoinUs
