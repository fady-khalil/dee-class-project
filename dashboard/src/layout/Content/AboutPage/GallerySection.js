import React, { useState } from 'react'
import {
  CButton,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../../services/api'
import { BASE_URL } from '../../../config'

const GallerySection = ({ gallery, onReload }) => {
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [size, setSize] = useState('medium')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('size', size)
      const res = await api.postWithFile('/admin/content/about/gallery', fd)
      if (res?.success) {
        setShowModal(false)
        setFile(null)
        setSize('medium')
        onReload()
      } else {
        setError(res?.message || 'Failed to add gallery item')
      }
    } catch (err) {
      setError('Failed to add gallery item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this gallery image?')) return
    try {
      await api.delete(`/admin/content/about/gallery/${itemId}`)
      onReload()
    } catch (err) {
      setError('Failed to delete gallery item')
    }
  }

  return (
    <>
      <CButton color="primary" size="sm" className="mb-3" onClick={() => setShowModal(true)}>
        <CIcon icon={cilPlus} className="me-1" /> Add Image
      </CButton>

      {error && <CAlert color="danger" className="mt-2">{error}</CAlert>}

      {gallery.length === 0 ? (
        <p className="text-muted">No gallery images yet.</p>
      ) : (
        <CRow>
          {gallery.map((item) => (
            <CCol key={item._id} xs={6} md={3} className="mb-3">
              <div className="border rounded overflow-hidden">
                <img
                  src={`${BASE_URL}/${item.image}`}
                  alt=""
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                />
                <div className="p-2 d-flex justify-content-between align-items-center">
                  <small className="text-muted">{item.size}</small>
                  <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(item._id)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </div>
            </CCol>
          ))}
        </CRow>
      )}

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Gallery Image</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleAdd}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Image *</CFormLabel>
              <CFormInput type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
            </div>
            <div className="mb-3">
              <CFormLabel>Size</CFormLabel>
              <CFormSelect value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={saving}>
              {saving && <CSpinner size="sm" className="me-1" />} Add
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default GallerySection
