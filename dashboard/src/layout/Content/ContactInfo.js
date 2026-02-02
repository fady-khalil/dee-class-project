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
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../services/api'

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const ContactInfo = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasData, setHasData] = useState(false)

  const [formData, setFormData] = useState({
    pageTitle: '',
    pageTitle_ar: '',
    pageSubtitle: '',
    pageSubtitle_ar: '',
    email: '',
    phone: '',
    address: '',
    address_ar: '',
    workingHours: '',
    workingHours_ar: '',
    socialMedia: [],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/contact-info')
      if (response?.data) {
        const data = response.data
        setFormData({
          pageTitle: data.pageTitle || '',
          pageTitle_ar: data.pageTitle_ar || '',
          pageSubtitle: data.pageSubtitle || '',
          pageSubtitle_ar: data.pageSubtitle_ar || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          address_ar: data.address_ar || '',
          workingHours: data.workingHours || '',
          workingHours_ar: data.workingHours_ar || '',
          socialMedia: data.socialMedia || [],
        })
        setHasData(
          data.pageTitle ||
            data.pageTitle_ar ||
            data.email ||
            data.phone ||
            data.address ||
            data.workingHours ||
            data.socialMedia?.length > 0
        )
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

  const handleAddSocialMedia = () => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: 'facebook', url: '' }],
    }))
  }

  const handleSocialMediaChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.socialMedia]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, socialMedia: updated }
    })
  }

  const handleRemoveSocialMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/contact-info', formData)
      if (response?.success) {
        setSuccess('Contact info saved successfully!')
        setHasData(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save contact info')
      }
    } catch (err) {
      setError('Failed to save contact info')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the contact info?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.put('/admin/content/contact-info', {
        pageTitle: '',
        pageTitle_ar: '',
        pageSubtitle: '',
        pageSubtitle_ar: '',
        email: '',
        phone: '',
        address: '',
        address_ar: '',
        workingHours: '',
        workingHours_ar: '',
        socialMedia: [],
      })

      if (response?.success) {
        setFormData({
          pageTitle: '',
          pageTitle_ar: '',
          pageSubtitle: '',
          pageSubtitle_ar: '',
          email: '',
          phone: '',
          address: '',
          address_ar: '',
          workingHours: '',
          workingHours_ar: '',
          socialMedia: [],
        })
        setHasData(false)
        setSuccess('Contact info deleted successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete contact info')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadData()
  }

  const getPlatformLabel = (platform) => {
    return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label || platform
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
          <strong>Contact Info</strong>
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
              Add Contact Info
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
                  <CTableHeaderCell style={{ width: '200px' }}>Page Title (EN)</CTableHeaderCell>
                  <CTableDataCell>{formData.pageTitle || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Page Title (AR)</CTableHeaderCell>
                  <CTableDataCell dir="rtl">{formData.pageTitle_ar || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Subtitle (EN)</CTableHeaderCell>
                  <CTableDataCell>{formData.pageSubtitle || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Subtitle (AR)</CTableHeaderCell>
                  <CTableDataCell dir="rtl">{formData.pageSubtitle_ar || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableDataCell>{formData.email || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableDataCell>{formData.phone || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Address (EN)</CTableHeaderCell>
                  <CTableDataCell>{formData.address || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Address (AR)</CTableHeaderCell>
                  <CTableDataCell dir="rtl">{formData.address_ar || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Working Hours (EN)</CTableHeaderCell>
                  <CTableDataCell>{formData.workingHours || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Working Hours (AR)</CTableHeaderCell>
                  <CTableDataCell dir="rtl">{formData.workingHours_ar || '-'}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Social Media</CTableHeaderCell>
                  <CTableDataCell>
                    {formData.socialMedia.length > 0 ? (
                      <ul className="mb-0">
                        {formData.socialMedia.map((social, index) => (
                          <li key={index}>
                            <strong>{getPlatformLabel(social.platform)}:</strong> {social.url}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          ) : (
            <CAlert color="info">
              No contact info configured yet. Click "Add Contact Info" to create one.
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
        <strong>{hasData ? 'Edit Contact Info' : 'Add Contact Info'}</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-4">
            <CCol md={6}>
              <h5>English Content</h5>
              <div className="mb-3">
                <CFormLabel>Page Title (EN)</CFormLabel>
                <CFormInput
                  name="pageTitle"
                  value={formData.pageTitle}
                  onChange={handleInputChange}
                  placeholder="Enter English page title"
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Subtitle (EN)</CFormLabel>
                <CFormTextarea
                  name="pageSubtitle"
                  value={formData.pageSubtitle}
                  onChange={handleInputChange}
                  placeholder="Enter English subtitle"
                  rows={3}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <h5>Arabic Content</h5>
              <div className="mb-3">
                <CFormLabel>Page Title (AR)</CFormLabel>
                <CFormInput
                  name="pageTitle_ar"
                  value={formData.pageTitle_ar}
                  onChange={handleInputChange}
                  placeholder="Enter Arabic page title"
                  dir="rtl"
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Subtitle (AR)</CFormLabel>
                <CFormTextarea
                  name="pageSubtitle_ar"
                  value={formData.pageSubtitle_ar}
                  onChange={handleInputChange}
                  placeholder="Enter Arabic subtitle"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </CCol>
          </CRow>

          <hr />

          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Phone</CFormLabel>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Address (EN)</CFormLabel>
                <CFormTextarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address in English"
                  rows={2}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Address (AR)</CFormLabel>
                <CFormTextarea
                  name="address_ar"
                  value={formData.address_ar}
                  onChange={handleInputChange}
                  placeholder="Enter address in Arabic"
                  rows={2}
                  dir="rtl"
                />
              </div>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Working Hours (EN)</CFormLabel>
                <CFormInput
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  placeholder="e.g., Sun - Thu: 9AM - 5PM"
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Working Hours (AR)</CFormLabel>
                <CFormInput
                  name="workingHours_ar"
                  value={formData.workingHours_ar}
                  onChange={handleInputChange}
                  placeholder="e.g., الأحد - الخميس: 9 صباحاً - 5 مساءً"
                  dir="rtl"
                />
              </div>
            </CCol>
          </CRow>

          <hr />

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Social Media Links</h5>
              <CButton color="primary" size="sm" type="button" onClick={handleAddSocialMedia}>
                <CIcon icon={cilPlus} className="me-1" />
                Add Link
              </CButton>
            </div>

            {formData.socialMedia.length === 0 ? (
              <CAlert color="info">No social media links added yet.</CAlert>
            ) : (
              formData.socialMedia.map((social, index) => (
                <CInputGroup className="mb-2" key={index}>
                  <CFormSelect
                    value={social.platform}
                    onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                    style={{ maxWidth: '150px' }}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormInput
                    value={social.url}
                    onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                    placeholder="Enter URL"
                  />
                  <CButton
                    color="danger"
                    variant="outline"
                    type="button"
                    onClick={() => handleRemoveSocialMedia(index)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CInputGroup>
              ))
            )}
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

export default ContactInfo
