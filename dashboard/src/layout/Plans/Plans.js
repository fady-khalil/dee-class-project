import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSwitch,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilCheckCircle, cilXCircle } from '@coreui/icons'
import { api } from '../../services/api'

const Plans = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/plans')
      if (response?.success) {
        setPlans(response.data || [])
      } else {
        setError('Failed to load plans')
      }
    } catch (err) {
      setError('Failed to load plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!selectedPlan) return
    setDeleting(true)
    setError(null)

    try {
      const response = await api.delete(`/admin/plans/${selectedPlan._id}`)
      if (response?.success) {
        setSuccess('Plan deleted successfully')
        setShowDeleteModal(false)
        setSelectedPlan(null)
        loadPlans()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response?.message || 'Failed to delete plan')
      }
    } catch (err) {
      setError('Failed to delete plan')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (plan) => {
    try {
      const response = await api.patch(`/admin/plans/${plan._id}/toggle-status`)
      if (response?.success) {
        loadPlans()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && plans.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Subscription Plans</strong>
          <CButton color="primary" onClick={() => navigate('/plans/new')}>
            <CIcon icon={cilPlus} className="me-1" />
            Add Plan
          </CButton>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          {plans.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted mb-3">No plans found</h5>
              <p className="text-muted mb-4">Create your first subscription plan to get started.</p>
              <CButton color="primary" onClick={() => navigate('/plans/new')}>
                <CIcon icon={cilPlus} className="me-1" />
                Create First Plan
              </CButton>
            </div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '60px' }}>Order</CTableHeaderCell>
                  <CTableHeaderCell>Plan Name</CTableHeaderCell>
                  <CTableHeaderCell>Monthly</CTableHeaderCell>
                  <CTableHeaderCell>Yearly</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '80px' }}>Profiles</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '80px' }}>Download</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '80px' }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '100px' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {plans.map((plan) => (
                  <CTableRow key={plan._id}>
                    <CTableDataCell className="text-center">
                      <CBadge color="secondary">{plan.order}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">
                        {plan.title}
                        {plan.isPopular && (
                          <CBadge color="warning" className="ms-2">
                            Popular
                          </CBadge>
                        )}
                      </div>
                      <small className="text-muted">{plan.title_ar}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold text-primary">
                        {plan.monthlyPrice} {plan.currency}
                      </div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '120px' }}>
                        {plan.monthlyStripePriceId}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold text-success">
                        {plan.yearlyPrice} {plan.currency}
                      </div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '120px' }}>
                        {plan.yearlyStripePriceId}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge color="info">{plan.profilesAllowed}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {plan.canDownload ? (
                        <CIcon icon={cilCheckCircle} className="text-success" size="lg" />
                      ) : (
                        <CIcon icon={cilXCircle} className="text-danger" size="lg" />
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormSwitch
                        checked={plan.isActive}
                        onChange={() => handleToggleStatus(plan)}
                        title={plan.isActive ? 'Click to deactivate' : 'Click to activate'}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/plans/edit/${plan._id}`)}
                        className="me-1"
                        title="Edit"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(plan)}
                        title="Delete"
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Delete Plan</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Are you sure you want to delete <strong>{selectedPlan?.title}</strong>?
          </p>
          <CAlert color="warning" className="mb-0">
            <strong>Warning:</strong> Users currently subscribed to this plan will not be affected,
            but no new subscriptions can be made to this plan.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting && <CSpinner size="sm" className="me-2" />}
            Delete Plan
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Plans
