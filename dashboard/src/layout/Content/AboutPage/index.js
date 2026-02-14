import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'
import { api } from '../../../services/api'
import { BASE_URL } from '../../../config'
import ManifestoSection from './ManifestoSection'
import GallerySection from './GallerySection'

const Field = ({ label, name, value, onChange, dir, disabled }) => (
  <div className="mb-3">
    <CFormLabel>{label}</CFormLabel>
    <CFormInput name={name} value={value} onChange={onChange} dir={dir} disabled={disabled} />
  </div>
)

const AboutPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    opening_line1: '', opening_line1_ar: '',
    opening_line2: '', opening_line2_ar: '',
    story_text: '', story_text_ar: '', story_image: '',
    finale_eyebrow: '', finale_eyebrow_ar: '',
    finale_subtitle: '', finale_subtitle_ar: '',
    finale_button_text: '', finale_button_text_ar: '',
    finale_button_link: '',
  })
  const [manifesto, setManifesto] = useState([])
  const [gallery, setGallery] = useState([])
  const [storyImageFile, setStoryImageFile] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin/content/about')
      if (res?.data) {
        const d = res.data
        setFormData({
          opening_line1: d.opening_line1 || '', opening_line1_ar: d.opening_line1_ar || '',
          opening_line2: d.opening_line2 || '', opening_line2_ar: d.opening_line2_ar || '',
          story_text: d.story_text || '', story_text_ar: d.story_text_ar || '',
          story_image: d.story_image || '',
          finale_eyebrow: d.finale_eyebrow || '', finale_eyebrow_ar: d.finale_eyebrow_ar || '',
          finale_subtitle: d.finale_subtitle || '', finale_subtitle_ar: d.finale_subtitle_ar || '',
          finale_button_text: d.finale_button_text || '', finale_button_text_ar: d.finale_button_text_ar || '',
          finale_button_link: d.finale_button_link || '',
        })
        setManifesto(d.manifesto || [])
        setGallery(d.gallery || [])
      }
    } catch (err) {
      setError('Failed to load about page data')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = { ...formData, manifesto }
      delete payload.story_image
      const res = await api.put('/admin/content/about', payload)
      if (storyImageFile) {
        const fd = new FormData()
        fd.append('image', storyImageFile)
        await api.putWithFile('/admin/content/about/story-image', fd)
      }
      if (res?.success) {
        setSuccess('About page saved successfully!')
        setIsEditing(false)
        setStoryImageFile(null)
        loadData()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(res?.message || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save about page')
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

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>About Page Content</strong>
        {!isEditing ? (
          <CButton color="primary" size="sm" onClick={() => setIsEditing(true)}>
            <CIcon icon={cilPencil} className="me-1" /> Edit
          </CButton>
        ) : (
          <div className="d-flex gap-2">
            <CButton color="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving && <CSpinner size="sm" className="me-1" />} Save All
            </CButton>
            <CButton color="secondary" size="sm" onClick={() => { setIsEditing(false); loadData() }}>
              Cancel
            </CButton>
          </div>
        )}
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CAccordion alwaysOpen>
          <CAccordionItem itemKey={1}>
            <CAccordionHeader>Scene 1 — Opening</CAccordionHeader>
            <CAccordionBody>
              <CRow>
                <CCol md={6}>
                  <Field label="Line 1 (EN)" name="opening_line1" value={formData.opening_line1} onChange={onChange} disabled={!isEditing} />
                  <Field label="Line 2 (EN)" name="opening_line2" value={formData.opening_line2} onChange={onChange} disabled={!isEditing} />
                </CCol>
                <CCol md={6}>
                  <Field label="Line 1 (AR)" name="opening_line1_ar" value={formData.opening_line1_ar} onChange={onChange} dir="rtl" disabled={!isEditing} />
                  <Field label="Line 2 (AR)" name="opening_line2_ar" value={formData.opening_line2_ar} onChange={onChange} dir="rtl" disabled={!isEditing} />
                </CCol>
              </CRow>
            </CAccordionBody>
          </CAccordionItem>

          <CAccordionItem itemKey={2}>
            <CAccordionHeader>Scene 2 — Story</CAccordionHeader>
            <CAccordionBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Text (EN)</CFormLabel>
                  <CFormTextarea name="story_text" rows={3} value={formData.story_text} onChange={onChange} disabled={!isEditing} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Text (AR)</CFormLabel>
                  <CFormTextarea name="story_text_ar" rows={3} value={formData.story_text_ar} onChange={onChange} disabled={!isEditing} dir="rtl" />
                </CCol>
              </CRow>
              <CFormLabel>Story Image</CFormLabel>
              {formData.story_image && (
                <div className="mb-2">
                  <img src={`${BASE_URL}/${formData.story_image}`} alt="Story" style={{ maxHeight: 150, borderRadius: 8 }} />
                </div>
              )}
              {isEditing && <CFormInput type="file" accept="image/*" onChange={(e) => setStoryImageFile(e.target.files[0])} />}
            </CAccordionBody>
          </CAccordionItem>

          <CAccordionItem itemKey={3}>
            <CAccordionHeader>Scene 3 — Manifesto ({manifesto.length} statements)</CAccordionHeader>
            <CAccordionBody>
              <ManifestoSection items={manifesto} setItems={setManifesto} isEditing={isEditing} />
            </CAccordionBody>
          </CAccordionItem>

          <CAccordionItem itemKey={4}>
            <CAccordionHeader>Scene 4 — Gallery ({gallery.length} images)</CAccordionHeader>
            <CAccordionBody>
              <GallerySection gallery={gallery} onReload={loadData} />
            </CAccordionBody>
          </CAccordionItem>

          <CAccordionItem itemKey={5}>
            <CAccordionHeader>Scene 5 — Finale</CAccordionHeader>
            <CAccordionBody>
              <CRow>
                <CCol md={6}>
                  <Field label="Eyebrow Text (EN)" name="finale_eyebrow" value={formData.finale_eyebrow} onChange={onChange} disabled={!isEditing} />
                  <Field label="Subtitle (EN)" name="finale_subtitle" value={formData.finale_subtitle} onChange={onChange} disabled={!isEditing} />
                  <Field label="Button Text (EN)" name="finale_button_text" value={formData.finale_button_text} onChange={onChange} disabled={!isEditing} />
                </CCol>
                <CCol md={6}>
                  <Field label="Eyebrow Text (AR)" name="finale_eyebrow_ar" value={formData.finale_eyebrow_ar} onChange={onChange} dir="rtl" disabled={!isEditing} />
                  <Field label="Subtitle (AR)" name="finale_subtitle_ar" value={formData.finale_subtitle_ar} onChange={onChange} dir="rtl" disabled={!isEditing} />
                  <Field label="Button Text (AR)" name="finale_button_text_ar" value={formData.finale_button_text_ar} onChange={onChange} dir="rtl" disabled={!isEditing} />
                </CCol>
              </CRow>
              <Field label="Button Link" name="finale_button_link" value={formData.finale_button_link} onChange={onChange} disabled={!isEditing} />
            </CAccordionBody>
          </CAccordionItem>
        </CAccordion>
      </CCardBody>
    </CCard>
  )
}

export default AboutPage
