import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../services/api'
import RichTextEditor from '../../components/common/RichTextEditor'

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasData, setHasData] = useState(false)

  const [formData, setFormData] = useState({
    content: '',
    content_ar: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/privacy-policy')
      if (response?.data) {
        const data = response.data
        setFormData({
          content: data.content || '',
          content_ar: data.content_ar || '',
        })
        setHasData(data.content || data.content_ar)
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
      const response = await api.put('/admin/content/privacy-policy', formData)
      if (response?.success) {
        setSuccess('Privacy policy saved successfully!')
        setHasData(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save privacy policy')
      }
    } catch (err) {
      setError('Failed to save privacy policy')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the privacy policy?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.put('/admin/content/privacy-policy', {
        content: '',
        content_ar: '',
      })

      if (response?.success) {
        setFormData({
          content: '',
          content_ar: '',
        })
        setHasData(false)
        setSuccess('Privacy policy deleted successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete privacy policy')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadData()
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
          <strong>Privacy Policy</strong>
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
              Add Privacy Policy
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          {hasData ? (
            <CRow>
              <CCol md={6}>
                <h6>English Content</h6>
                <div
                  className="border p-3 rounded bg-light"
                  style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>-</p>' }}
                />
              </CCol>
              <CCol md={6}>
                <h6>Arabic Content</h6>
                <div
                  className="border p-3 rounded bg-light"
                  style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: formData.content_ar || '<p>-</p>' }}
                />
              </CCol>
            </CRow>
          ) : (
            <CAlert color="info">
              No privacy policy configured yet. Click "Add Privacy Policy" to create one.
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
        <strong>{hasData ? 'Edit Privacy Policy' : 'Add Privacy Policy'}</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>
                  <strong>English Content</strong>
                </CFormLabel>
                <RichTextEditor
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>
                  <strong>Arabic Content</strong>
                </CFormLabel>
                <div dir="rtl">
                  <RichTextEditor
                    name="content_ar"
                    value={formData.content_ar}
                    onChange={handleInputChange}
                  />
                </div>
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

export default PrivacyPolicy
