import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../services/api'
import {
  CCard,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
} from '@coreui/react'
import { BASE_URL } from '../../../config'

const InstructorFormPage = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditing = !!slug
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    bio: '',
    bio_ar: '',
    description: '',
    description_ar: '',
    facebook: '',
    instagram: '',
    linkedin: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState(1)

  useEffect(() => {
    if (isEditing) {
      fetchInstructorData()
    }
  }, [isEditing, slug])

  const fetchInstructorData = async () => {
    try {
      const response = await api.get(`/instructors/admin/${slug}`)
      const data = response.data

      setFormData({
        name: data.name || '',
        name_ar: data.name_ar || '',
        bio: data.bio || '',
        bio_ar: data.bio_ar || '',
        description: data.description || '',
        description_ar: data.description_ar || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
      })

      if (data.profileImage?.data) {
        setImagePreview(`${BASE_URL}/${data.profileImage.data}`)
      }
    } catch (error) {
      console.error('Failed to fetch instructor data:', error)
      setErrorMessage('Failed to load instructor data')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrorMessage('')
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const submitData = new FormData()

    // Add text fields
    submitData.append('name', formData.name)
    submitData.append('name_ar', formData.name_ar)
    submitData.append('bio', formData.bio)
    submitData.append('bio_ar', formData.bio_ar)
    submitData.append('description', formData.description)
    submitData.append('description_ar', formData.description_ar)
    submitData.append('facebook', formData.facebook)
    submitData.append('instagram', formData.instagram)
    submitData.append('linkedin', formData.linkedin)

    // Add file if selected
    if (selectedFile) {
      submitData.append('profileImage', selectedFile)
    }

    try {
      if (isEditing) {
        await api.putWithFile(`/instructors/${slug}`, submitData)
      } else {
        await api.postWithFile('/instructors', submitData)
      }
      navigate('/instructors')
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage(error.message || 'An error occurred')
    }
  }

  const handleCancel = () => {
    navigate('/instructors')
  }

  const handleTabChange = (tabId, e) => {
    if (e) e.preventDefault()
    setActiveTab(tabId)
  }

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>{isEditing ? 'Edit Instructor' : 'Add New Instructor'}</h4>
        </div>

        {errorMessage && (
          <div className="alert alert-danger mb-3">{errorMessage}</div>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Language Tabs */}
          <div className="mb-3">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
                  onClick={(e) => handleTabChange(1, e)}
                  type="button"
                >
                  English
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
                  onClick={(e) => handleTabChange(2, e)}
                  type="button"
                >
                  Arabic
                </button>
              </li>
            </ul>
          </div>

          {/* Common Fields */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <label className="form-label">Profile Image</label>
              <CFormInput
                type="file"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
                ref={fileInputRef}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '150px', borderRadius: '50%' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Facebook URL</label>
              <CFormInput
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Instagram URL</label>
              <CFormInput
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">LinkedIn URL</label>
              <CFormInput
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {/* English Content */}
          <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Name (English) *</label>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Bio (English)</label>
                <CFormTextarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Short bio..."
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description (English)</label>
                <CFormTextarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Full description..."
                />
              </div>
            </div>
          </div>

          {/* Arabic Content */}
          <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Name (Arabic) *</label>
                <CFormInput
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  dir="rtl"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Bio (Arabic)</label>
                <CFormTextarea
                  name="bio_ar"
                  value={formData.bio_ar}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="نبذة مختصرة..."
                  dir="rtl"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description (Arabic)</label>
                <CFormTextarea
                  name="description_ar"
                  value={formData.description_ar}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="الوصف الكامل..."
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CButton color="secondary" onClick={handleCancel}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit">
              {isEditing ? 'Update' : 'Save'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default InstructorFormPage
