import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormSwitch,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'
import { api } from '../../services/api'
import RichTextEditor from '../../components/common/RichTextEditor'

const BottomBanner = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    isActive: false,
    registered_content: '',
    registered_content_ar: '',
    guest_content: '',
    guest_content_ar: '',
    app_store_url: '',
    play_store_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/bottom-banner')
      if (response?.data) {
        const d = response.data
        setFormData({
          isActive: d.isActive || false,
          registered_content: d.registered_content || '',
          registered_content_ar: d.registered_content_ar || '',
          guest_content: d.guest_content || '',
          guest_content_ar: d.guest_content_ar || '',
          app_store_url: d.app_store_url || '',
          play_store_url: d.play_store_url || '',
        })
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/bottom-banner', formData)
      if (response?.success) {
        setSuccess('Bottom banner saved successfully!')
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save bottom banner')
      }
    } catch (err) {
      setError('Failed to save bottom banner')
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
          <div>
            <strong>Bottom Banner</strong>
            <span className={`ms-3 badge bg-${formData.isActive ? 'success' : 'secondary'}`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <CButton color="primary" size="sm" onClick={() => setIsEditing(true)}>
            <CIcon icon={cilPencil} className="me-1" />
            Edit
          </CButton>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <h6 className="mb-3 text-muted">Registered User Content</h6>
          <CRow className="mb-4">
            <CCol md={6}>
              <p className="fw-semibold mb-1">English</p>
              <div
                className="border p-3 rounded bg-light"
                style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: formData.registered_content || '<p class="text-muted">-</p>' }}
              />
            </CCol>
            <CCol md={6}>
              <p className="fw-semibold mb-1">Arabic</p>
              <div
                className="border p-3 rounded bg-light"
                style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: formData.registered_content_ar || '<p class="text-muted">-</p>' }}
              />
            </CCol>
          </CRow>

          <h6 className="mb-3 text-muted">App Store Links (for registered users)</h6>
          <CRow className="mb-4">
            <CCol md={6}>
              <p className="fw-semibold mb-1">App Store URL</p>
              <p className="text-muted">{formData.app_store_url || '-'}</p>
            </CCol>
            <CCol md={6}>
              <p className="fw-semibold mb-1">Play Store URL</p>
              <p className="text-muted">{formData.play_store_url || '-'}</p>
            </CCol>
          </CRow>

          <h6 className="mb-3 text-muted">Guest Content</h6>
          <CRow>
            <CCol md={6}>
              <p className="fw-semibold mb-1">English</p>
              <div
                className="border p-3 rounded bg-light"
                style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: formData.guest_content || '<p class="text-muted">-</p>' }}
              />
            </CCol>
            <CCol md={6}>
              <p className="fw-semibold mb-1">Arabic</p>
              <div
                className="border p-3 rounded bg-light"
                style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: formData.guest_content_ar || '<p class="text-muted">-</p>' }}
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    )
  }

  // Edit Mode
  return (
    <CCard>
      <CCardHeader>
        <strong>Edit Bottom Banner</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <div className="mb-4">
            <CFormSwitch
              id="isActive"
              name="isActive"
              label="Banner Active"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
          </div>

          <h6 className="mb-3 text-muted">Registered User Content</h6>
          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>English</strong></CFormLabel>
                <RichTextEditor
                  name="registered_content"
                  value={formData.registered_content}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>Arabic</strong></CFormLabel>
                <div dir="rtl">
                  <RichTextEditor
                    name="registered_content_ar"
                    value={formData.registered_content_ar}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CCol>
          </CRow>

          <h6 className="mb-3 text-muted">App Store Links (for registered users)</h6>
          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>App Store URL</strong></CFormLabel>
                <CFormInput
                  name="app_store_url"
                  value={formData.app_store_url}
                  onChange={handleInputChange}
                  placeholder="https://apps.apple.com/..."
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>Play Store URL</strong></CFormLabel>
                <CFormInput
                  name="play_store_url"
                  value={formData.play_store_url}
                  onChange={handleInputChange}
                  placeholder="https://play.google.com/..."
                />
              </div>
            </CCol>
          </CRow>

          <h6 className="mb-3 text-muted">Guest Content</h6>
          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>English</strong></CFormLabel>
                <RichTextEditor
                  name="guest_content"
                  value={formData.guest_content}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel><strong>Arabic</strong></CFormLabel>
                <div dir="rtl">
                  <RichTextEditor
                    name="guest_content_ar"
                    value={formData.guest_content_ar}
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

export default BottomBanner
