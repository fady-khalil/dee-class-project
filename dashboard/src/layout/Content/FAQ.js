import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { api } from '../../services/api'
import RichTextEditor from '../../components/common/RichTextEditor'

const FAQ = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Modal state for FAQ items
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemFormData, setItemFormData] = useState({
    question: '',
    question_ar: '',
    answer: '',
    answer_ar: '',
  })

  // Main FAQ data
  const [formData, setFormData] = useState({
    pageTitle: '',
    pageTitle_ar: '',
  })
  const [items, setItems] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/content/faq')
      if (response?.data) {
        const data = response.data
        setFormData({
          pageTitle: data.pageTitle || '',
          pageTitle_ar: data.pageTitle_ar || '',
        })
        setItems(data.items || [])
        setHasData(data.pageTitle || data.pageTitle_ar || data.items?.length > 0)
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

  const handleItemInputChange = (e) => {
    const { name, value } = e.target
    setItemFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitHeader = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put('/admin/content/faq', formData)
      if (response?.success) {
        setSuccess('FAQ header saved successfully!')
        setHasData(true)
        setIsEditingHeader(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save FAQ header')
      }
    } catch (err) {
      setError('Failed to save FAQ header')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAddItem = () => {
    setEditingItem(null)
    setItemFormData({
      question: '',
      question_ar: '',
      answer: '',
      answer_ar: '',
    })
    setShowItemModal(true)
  }

  const handleOpenEditItem = (item) => {
    setEditingItem(item)
    setItemFormData({
      question: item.question || '',
      question_ar: item.question_ar || '',
      answer: item.answer || '',
      answer_ar: item.answer_ar || '',
    })
    setShowItemModal(true)
  }

  const handleSubmitItem = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      let response
      if (editingItem) {
        response = await api.put(`/admin/content/faq/items/${editingItem._id}`, itemFormData)
      } else {
        response = await api.post('/admin/content/faq/items', itemFormData)
      }

      if (response?.success) {
        setSuccess(editingItem ? 'FAQ item updated successfully!' : 'FAQ item added successfully!')
        setShowItemModal(false)
        loadData()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to save FAQ item')
      }
    } catch (err) {
      setError('Failed to save FAQ item')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ item?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await api.delete(`/admin/content/faq/items/${itemId}`)
      if (response?.success) {
        setSuccess('FAQ item deleted successfully!')
        loadData()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to delete FAQ item')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelHeader = () => {
    setIsEditingHeader(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      {/* Page Title Card */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>FAQ Page Settings</strong>
          {!isEditingHeader && (
            <CButton color="primary" size="sm" onClick={() => setIsEditingHeader(true)}>
              <CIcon icon={cilPencil} className="me-1" />
              Edit
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          {isEditingHeader ? (
            <CForm onSubmit={handleSubmitHeader}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Page Title (EN)</CFormLabel>
                  <CFormInput
                    name="pageTitle"
                    value={formData.pageTitle}
                    onChange={handleInputChange}
                    placeholder="Enter English page title"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Page Title (AR)</CFormLabel>
                  <CFormInput
                    name="pageTitle_ar"
                    value={formData.pageTitle_ar}
                    onChange={handleInputChange}
                    placeholder="Enter Arabic page title"
                    dir="rtl"
                  />
                </CCol>
              </CRow>
              <div className="d-flex gap-2">
                <CButton type="submit" color="primary" disabled={saving}>
                  {saving ? <CSpinner size="sm" className="me-2" /> : null}
                  Save
                </CButton>
                <CButton type="button" color="secondary" onClick={handleCancelHeader} disabled={saving}>
                  Cancel
                </CButton>
              </div>
            </CForm>
          ) : (
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
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* FAQ Items Card */}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>FAQ Items ({items.length})</strong>
          <CButton color="primary" size="sm" onClick={handleOpenAddItem}>
            <CIcon icon={cilPlus} className="me-1" />
            Add Question
          </CButton>
        </CCardHeader>
        <CCardBody>
          {items.length === 0 ? (
            <CAlert color="info">No FAQ items yet. Click "Add Question" to create one.</CAlert>
          ) : (
            <CAccordion>
              {items.map((item, index) => (
                <CAccordionItem key={item._id} itemKey={index}>
                  <CAccordionHeader>
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <div>
                        <CBadge color="secondary" className="me-2">
                          {index + 1}
                        </CBadge>
                        {item.question}
                      </div>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="mb-3">
                      <CCol md={6}>
                        <h6>Question (EN)</h6>
                        <p>{item.question}</p>
                        <h6>Answer (EN)</h6>
                        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </CCol>
                      <CCol md={6}>
                        <h6>Question (AR)</h6>
                        <p dir="rtl">{item.question_ar || '-'}</p>
                        <h6>Answer (AR)</h6>
                        <div dir="rtl" dangerouslySetInnerHTML={{ __html: item.answer_ar || '-' }} />
                      </CCol>
                    </CRow>
                    <div className="d-flex gap-2">
                      <CButton color="primary" size="sm" onClick={() => handleOpenEditItem(item)}>
                        <CIcon icon={cilPencil} className="me-1" />
                        Edit
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={saving}
                      >
                        <CIcon icon={cilTrash} className="me-1" />
                        Delete
                      </CButton>
                    </div>
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
          )}
        </CCardBody>
      </CCard>

      {/* Add/Edit Item Modal */}
      <CModal visible={showItemModal} onClose={() => setShowItemModal(false)} size="xl">
        <CModalHeader>
          <CModalTitle>{editingItem ? 'Edit FAQ Item' : 'Add FAQ Item'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitItem}>
          <CModalBody>
            <CRow className="mb-4">
              <CCol md={6}>
                <h5>English Content</h5>
                <div className="mb-3">
                  <CFormLabel>Question (EN) *</CFormLabel>
                  <CFormInput
                    name="question"
                    value={itemFormData.question}
                    onChange={handleItemInputChange}
                    placeholder="Enter question in English"
                    required
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>Answer (EN) *</CFormLabel>
                  <RichTextEditor
                    name="answer"
                    value={itemFormData.answer}
                    onChange={handleItemInputChange}
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <h5>Arabic Content</h5>
                <div className="mb-3">
                  <CFormLabel>Question (AR)</CFormLabel>
                  <CFormInput
                    name="question_ar"
                    value={itemFormData.question_ar}
                    onChange={handleItemInputChange}
                    placeholder="Enter question in Arabic"
                    dir="rtl"
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>Answer (AR)</CFormLabel>
                  <div dir="rtl">
                    <RichTextEditor
                      name="answer_ar"
                      value={itemFormData.answer_ar}
                      onChange={handleItemInputChange}
                    />
                  </div>
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowItemModal(false)} disabled={saving}>
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={saving}>
              {saving ? <CSpinner size="sm" className="me-2" /> : null}
              {editingItem ? 'Update' : 'Add'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default FAQ
