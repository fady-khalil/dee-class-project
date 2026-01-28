import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CButton,
  CSpinner,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CCloseButton,
} from '@coreui/react'
import { api } from '../../services/api'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import ResourceTable from '../../components/common/ResourceTable'
import { useAuth } from '../../context/AuthContext'
import { BASE_URL } from '../../config'

const Instructors = () => {
  const navigate = useNavigate()
  const { canWrite } = useAuth()
  const hasWritePermission = canWrite('courses')

  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewVisible, setViewVisible] = useState(false)
  const [currentInstructor, setCurrentInstructor] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [instructorToDelete, setInstructorToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const tableColumns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Name (Arabic)',
      accessor: 'name_ar',
    },
    {
      header: 'Created At',
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ]

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors')
      setInstructors(response?.data || [])
    } catch (error) {
      console.error('Failed to fetch instructors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInstructor = () => {
    if (!hasWritePermission) return
    navigate('/instructors/new')
  }

  const handleEdit = (instructor) => {
    navigate(`/instructors/${instructor.slug}/edit`)
  }

  const initiateDelete = (instructor) => {
    setInstructorToDelete(instructor)
    setDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/instructors/${instructorToDelete.slug}`)
      setDeleteModal(false)
      setInstructorToDelete(null)
      fetchInstructors()
    } catch (error) {
      console.error('Failed to delete instructor:', error)
    }
  }

  const handleView = (instructor) => {
    setCurrentInstructor(instructor)
    setViewVisible(true)
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentInstructors = instructors.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(instructors.length / itemsPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const emptyStateComponent = (
    <EmptyState
      title="No Instructors Found"
      message="There are no instructors in the database yet."
      actionLabel={hasWritePermission ? 'Add Instructor' : null}
      onAction={hasWritePermission ? handleAddInstructor : null}
    />
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Instructors</h4>
            {hasWritePermission && (
              <CButton color="primary" onClick={handleAddInstructor}>
                Add Instructor
              </CButton>
            )}
          </div>

          <ResourceTable
            columns={tableColumns}
            data={instructors}
            resourceType="courses"
            onView={handleView}
            onEdit={hasWritePermission ? handleEdit : undefined}
            onDelete={hasWritePermission ? initiateDelete : undefined}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: paginate,
            }}
            emptyState={emptyStateComponent}
          />
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={instructorToDelete?.name || ''}
        itemType="instructor"
      />

      {/* Instructor View Offcanvas */}
      <COffcanvas
        placement="end"
        visible={viewVisible}
        onHide={() => setViewVisible(false)}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>Instructor Details</COffcanvasTitle>
          <CCloseButton
            className="text-reset"
            onClick={() => setViewVisible(false)}
          />
        </COffcanvasHeader>
        <COffcanvasBody>
          {currentInstructor && (
            <div>
              {currentInstructor.profileImage && (
                <div className="mb-3 text-center">
                  <img
                    src={`${BASE_URL}/${currentInstructor.profileImage}`}
                    alt={currentInstructor.name}
                    style={{ maxWidth: '150px', borderRadius: '50%' }}
                  />
                </div>
              )}
              <h5>Name (English)</h5>
              <p>{currentInstructor.name || 'N/A'}</p>

              <h5>Name (Arabic)</h5>
              <p dir="rtl">{currentInstructor.name_ar || 'N/A'}</p>

              <h5>Bio (English)</h5>
              <p>{currentInstructor.bio || 'N/A'}</p>

              <h5>Bio (Arabic)</h5>
              <p dir="rtl">{currentInstructor.bio_ar || 'N/A'}</p>

              <h5>Description (English)</h5>
              <p>{currentInstructor.description || 'N/A'}</p>

              <h5>Description (Arabic)</h5>
              <p dir="rtl">{currentInstructor.description_ar || 'N/A'}</p>

              <h5>Social Links</h5>
              <ul>
                {currentInstructor.facebook && (
                  <li>
                    <a href={currentInstructor.facebook} target="_blank" rel="noreferrer">
                      Facebook
                    </a>
                  </li>
                )}
                {currentInstructor.instagram && (
                  <li>
                    <a href={currentInstructor.instagram} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  </li>
                )}
                {currentInstructor.linkedin && (
                  <li>
                    <a href={currentInstructor.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </li>
                )}
              </ul>

              {hasWritePermission && (
                <CButton
                  color="primary"
                  className="mt-3"
                  onClick={() => {
                    setViewVisible(false)
                    handleEdit(currentInstructor)
                  }}
                >
                  Edit Instructor
                </CButton>
              )}
            </div>
          )}
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

export default Instructors
