import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilArrowLeft } from '@coreui/icons'
import { api } from '../../services/api'

const PlanForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    monthlyPrice: '',
    monthlyStripePriceId: '',
    yearlyPrice: '',
    yearlyStripePriceId: '',
    currency: 'SAR',
    features: [''],
    features_ar: [''],
    profilesAllowed: 1,
    canDownload: false,
    isActive: true,
    order: 0,
    isPopular: false,
  })

  useEffect(() => {
    if (isEditMode) {
      loadPlan()
    }
  }, [id])

  const loadPlan = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/plans/${id}`)
      if (response?.success && response.data) {
        const plan = response.data
        setFormData({
          title: plan.title || '',
          title_ar: plan.title_ar || '',
          description: plan.description || '',
          description_ar: plan.description_ar || '',
          monthlyPrice: plan.monthlyPrice?.toString() || '',
          monthlyStripePriceId: plan.monthlyStripePriceId || '',
          yearlyPrice: plan.yearlyPrice?.toString() || '',
          yearlyStripePriceId: plan.yearlyStripePriceId || '',
          currency: plan.currency || 'SAR',
          features: plan.features?.length ? plan.features : [''],
          features_ar: plan.features_ar?.length ? plan.features_ar : [''],
          profilesAllowed: plan.profilesAllowed || 1,
          canDownload: plan.canDownload || false,
          isActive: plan.isActive !== undefined ? plan.isActive : true,
          order: plan.order || 0,
          isPopular: plan.isPopular || false,
        })
      } else {
        setError('Failed to load plan')
      }
    } catch (err) {
      setError('Failed to load plan')
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

  const handleFeatureChange = (index, value, isArabic = false) => {
    const key = isArabic ? 'features_ar' : 'features'
    setFormData((prev) => {
      const newFeatures = [...prev[key]]
      newFeatures[index] = value
      return { ...prev, [key]: newFeatures }
    })
  }

  const addFeature = (isArabic = false) => {
    const key = isArabic ? 'features_ar' : 'features'
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ''],
    }))
  }

  const removeFeature = (index, isArabic = false) => {
    const key = isArabic ? 'features_ar' : 'features'
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const cleanData = {
        ...formData,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        yearlyPrice: parseFloat(formData.yearlyPrice),
        profilesAllowed: parseInt(formData.profilesAllowed),
        order: parseInt(formData.order),
        features: formData.features.filter((f) => f.trim()),
        features_ar: formData.features_ar.filter((f) => f.trim()),
      }

      let response
      if (isEditMode) {
        response = await api.put(`/admin/plans/${id}`, cleanData)
      } else {
        response = await api.post('/admin/plans', cleanData)
      }

      if (response?.success) {
        setSuccess(isEditMode ? 'Plan updated successfully' : 'Plan created successfully')
        setTimeout(() => {
          navigate('/plans')
        }, 1500)
      } else {
        setError(response?.message || 'Failed to save plan')
      }
    } catch (err) {
      setError('Failed to save plan')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CButton
        color="secondary"
        variant="ghost"
        className="mb-3"
        onClick={() => navigate('/plans')}
      >
        <CIcon icon={cilArrowLeft} className="me-1" />
        Back to Plans
      </CButton>

      <CCard>
        <CCardHeader>
          <strong>{isEditMode ? 'Edit Plan' : 'Create New Plan'}</strong>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <CForm onSubmit={handleSubmit}>
            <CRow>
              {/* Left Column - Basic Info & Pricing */}
              <CCol lg={6}>
                <h5 className="mb-4">Basic Information</h5>

                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Title (English) *</CFormLabel>
                      <CFormInput
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Professional"
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Title (Arabic) *</CFormLabel>
                      <CFormInput
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., احترافي"
                        dir="rtl"
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Description (English)</CFormLabel>
                      <CFormTextarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Optional description..."
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Description (Arabic)</CFormLabel>
                      <CFormTextarea
                        name="description_ar"
                        value={formData.description_ar}
                        onChange={handleInputChange}
                        rows={3}
                        dir="rtl"
                        placeholder="وصف اختياري..."
                      />
                    </div>
                  </CCol>
                </CRow>

                <hr className="my-4" />
                <h5 className="mb-4">Pricing</h5>

                <div className="mb-3">
                  <CFormLabel>Currency</CFormLabel>
                  <CFormSelect
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    style={{ maxWidth: '150px' }}
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </CFormSelect>
                </div>

                <CCard className="bg-light mb-3">
                  <CCardBody>
                    <h6 className="text-primary mb-3">Monthly Pricing</h6>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Price *</CFormLabel>
                          <CFormInput
                            type="number"
                            name="monthlyPrice"
                            value={formData.monthlyPrice}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="99"
                          />
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Stripe Price ID *</CFormLabel>
                          <CFormInput
                            name="monthlyStripePriceId"
                            value={formData.monthlyStripePriceId}
                            onChange={handleInputChange}
                            required
                            placeholder="price_xxxxxxxxxx"
                          />
                        </div>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                <CCard className="bg-light mb-3">
                  <CCardBody>
                    <h6 className="text-success mb-3">Yearly Pricing</h6>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Price *</CFormLabel>
                          <CFormInput
                            type="number"
                            name="yearlyPrice"
                            value={formData.yearlyPrice}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="999"
                          />
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Stripe Price ID *</CFormLabel>
                          <CFormInput
                            name="yearlyStripePriceId"
                            value={formData.yearlyStripePriceId}
                            onChange={handleInputChange}
                            required
                            placeholder="price_xxxxxxxxxx"
                          />
                        </div>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                <small className="text-muted d-block mb-4">
                  Get Stripe Price IDs from: Stripe Dashboard → Products → Select Product → Copy Price ID
                </small>
              </CCol>

              {/* Right Column - Settings & Features */}
              <CCol lg={6}>
                <h5 className="mb-4">Plan Settings</h5>

                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Profiles Allowed</CFormLabel>
                      <CFormSelect
                        name="profilesAllowed"
                        value={formData.profilesAllowed}
                        onChange={handleInputChange}
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} profile{num > 1 ? 's' : ''}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel>Display Order</CFormLabel>
                      <CFormInput
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                      />
                      <small className="text-muted">Lower numbers appear first</small>
                    </div>
                  </CCol>
                </CRow>

                <div className="mb-3 p-3 bg-light rounded">
                  <CFormSwitch
                    id="canDownload"
                    name="canDownload"
                    label="Allow Offline Downloads"
                    checked={formData.canDownload}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <CFormSwitch
                    id="isPopular"
                    name="isPopular"
                    label="Mark as Popular (highlighted in UI)"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <CFormSwitch
                    id="isActive"
                    name="isActive"
                    label="Active (visible to users)"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                </div>

                <hr className="my-4" />
                <h5 className="mb-4">Features</h5>

                <CRow>
                  <CCol md={6}>
                    <h6 className="text-muted mb-3">English</h6>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="d-flex mb-2">
                        <CFormInput
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                        {formData.features.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="ms-1"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        )}
                      </div>
                    ))}
                    <CButton
                      color="secondary"
                      size="sm"
                      onClick={() => addFeature()}
                      className="mt-2"
                    >
                      + Add Feature
                    </CButton>
                  </CCol>
                  <CCol md={6}>
                    <h6 className="text-muted mb-3">Arabic</h6>
                    {formData.features_ar.map((feature, index) => (
                      <div key={index} className="d-flex mb-2">
                        <CFormInput
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value, true)}
                          placeholder={`ميزة ${index + 1}`}
                          dir="rtl"
                        />
                        {formData.features_ar.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index, true)}
                            className="ms-1"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        )}
                      </div>
                    ))}
                    <CButton
                      color="secondary"
                      size="sm"
                      onClick={() => addFeature(true)}
                      className="mt-2"
                    >
                      + Add Feature
                    </CButton>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>

            <hr className="my-4" />

            <div className="d-flex justify-content-end gap-2">
              <CButton
                color="secondary"
                onClick={() => navigate('/plans')}
                disabled={saving}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={saving}>
                {saving && <CSpinner size="sm" className="me-2" />}
                {isEditMode ? 'Update Plan' : 'Create Plan'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default PlanForm
