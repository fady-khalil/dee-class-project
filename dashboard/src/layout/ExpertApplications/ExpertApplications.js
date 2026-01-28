import React, { useState, useEffect } from 'react'
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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilEnvelopeClosed, cilPhone, cilLocationPin } from '@coreui/icons'
import { api } from '../../services/api'
import { BASE_URL } from '../../config'

const ExpertApplications = () => {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Modal state for viewing details
  const [selectedApp, setSelectedApp] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [pagination.page])

  const loadApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `/admin/expert-applications?page=${pagination.page}&limit=20`
      const response = await api.get(url)

      if (response?.success) {
        setApplications(response.data || [])
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 })
      } else {
        setError('Failed to load applications')
      }
    } catch (err) {
      setError('Failed to load applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (app) => {
    setSelectedApp(app)
    setShowModal(true)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && applications.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Expert Applications</strong>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          {applications.length === 0 ? (
            <CAlert color="info">No applications found.</CAlert>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Phone</CTableHeaderCell>
                    <CTableHeaderCell>Location</CTableHeaderCell>
                    <CTableHeaderCell>Resume</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {applications.map((app) => (
                    <CTableRow
                      key={app._id}
                      onClick={() => handleViewDetails(app)}
                      style={{ cursor: 'pointer' }}
                    >
                      <CTableDataCell>{app.name}</CTableDataCell>
                      <CTableDataCell>
                        <a href={`mailto:${app.email}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          {app.email}
                        </a>
                      </CTableDataCell>
                      <CTableDataCell>
                        <a href={`tel:${app.phone}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          {app.phone}
                        </a>
                      </CTableDataCell>
                      <CTableDataCell>{app.location}</CTableDataCell>
                      <CTableDataCell>
                        {app.resume?.path ? (
                          <CButton
                            color="success"
                            size="sm"
                            variant="ghost"
                            href={`${BASE_URL}/${app.resume.path}`}
                            target="_blank"
                            title="Download Resume"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CIcon icon={cilCloudDownload} />
                          </CButton>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{formatDate(app.createdAt)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {pagination.pages > 1 && (
                <CPagination className="justify-content-center mt-3">
                  <CPaginationItem
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </CPaginationItem>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={pagination.page === i + 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              )}

              <div className="text-muted text-center mt-2">
                Total: {pagination.total} applications
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* View Details Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Application Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedApp && (
            <div>
              <p>
                <strong>Name:</strong> {selectedApp.name}
              </p>
              <p>
                <CIcon icon={cilEnvelopeClosed} className="me-2" />
                <a href={`mailto:${selectedApp.email}`}>{selectedApp.email}</a>
              </p>
              <p>
                <CIcon icon={cilPhone} className="me-2" />
                <a href={`tel:${selectedApp.phone}`}>{selectedApp.phone}</a>
              </p>
              <p>
                <CIcon icon={cilLocationPin} className="me-2" />
                {selectedApp.location}
              </p>
              {selectedApp.resume?.path && (
                <p>
                  <CButton
                    color="primary"
                    size="sm"
                    href={`${BASE_URL}/${selectedApp.resume.path}`}
                    target="_blank"
                  >
                    <CIcon icon={cilCloudDownload} className="me-1" />
                    Download Resume ({selectedApp.resume.originalName})
                  </CButton>
                </p>
              )}
              <p className="text-muted mt-3">
                <small>Submitted: {formatDate(selectedApp.createdAt)}</small>
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ExpertApplications
