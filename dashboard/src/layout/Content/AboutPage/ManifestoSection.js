import React, { useState } from 'react'
import {
  CButton,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

const ManifestoSection = ({ items, setItems, isEditing }) => {
  const [showModal, setShowModal] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [form, setForm] = useState({ label: '', label_ar: '', text: '', text_ar: '' })

  const handleOpen = (index = null) => {
    if (index !== null) {
      const item = items[index]
      setForm({
        label: item.label || '',
        label_ar: item.label_ar || '',
        text: item.text || '',
        text_ar: item.text_ar || '',
      })
      setEditIndex(index)
    } else {
      setForm({ label: '', label_ar: '', text: '', text_ar: '' })
      setEditIndex(null)
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updated = [...items]
    if (editIndex !== null) {
      updated[editIndex] = { ...updated[editIndex], ...form }
    } else {
      updated.push({ ...form, order: items.length })
    }
    setItems(updated)
    setShowModal(false)
  }

  const handleDelete = (index) => {
    if (!window.confirm('Delete this manifesto statement?')) return
    setItems(items.filter((_, i) => i !== index))
  }

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  return (
    <>
      {isEditing && (
        <CButton color="primary" size="sm" className="mb-3" onClick={() => handleOpen()}>
          <CIcon icon={cilPlus} className="me-1" /> Add Statement
        </CButton>
      )}

      {items.length === 0 ? (
        <p className="text-muted">No manifesto statements yet.</p>
      ) : (
        items.map((item, i) => (
          <div key={item._id || i} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <CBadge color="secondary" className="me-2">{i + 1}</CBadge>
                <strong>{item.label || 'Untitled'}</strong>
                <p className="mb-0 mt-1 text-muted">{item.text}</p>
                {item.label_ar && (
                  <p className="mb-0 mt-1 text-muted" dir="rtl">
                    {item.label_ar}: {item.text_ar}
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="d-flex gap-1">
                  <CButton color="primary" size="sm" variant="ghost" onClick={() => handleOpen(i)}>
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(i)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editIndex !== null ? 'Edit Statement' : 'Add Statement'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Label (EN) *</CFormLabel>
                <CFormInput name="label" value={form.label} onChange={onChange} required />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Label (AR)</CFormLabel>
                <CFormInput name="label_ar" value={form.label_ar} onChange={onChange} dir="rtl" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Text (EN) *</CFormLabel>
                <CFormTextarea name="text" value={form.text} onChange={onChange} rows={3} required />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Text (AR)</CFormLabel>
                <CFormTextarea name="text_ar" value={form.text_ar} onChange={onChange} rows={3} dir="rtl" />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
            <CButton type="submit" color="primary">
              {editIndex !== null ? 'Update' : 'Add'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default ManifestoSection
