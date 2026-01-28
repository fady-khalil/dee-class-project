import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CButton,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CSpinner,
} from '@coreui/react'
import { api } from '../../services/api'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import ResourceTable from '../../components/common/ResourceTable'
import { useAuth } from '../../context/AuthContext'
import BACKEND_URL from '../../config'

const Course = () => {
  const navigate = useNavigate()
  const { canWrite } = useAuth()
  const hasWritePermission = canWrite('courses')

  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewVisible, setViewVisible] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Define columns for ResourceTable
  const tableColumns = [
    {
      header: 'Title',
      accessor: (item) => {
        if (item.translations && item.translations.en) {
          return item.translations.en.title
        }
        return item.title || 'N/A'
      },
    },
    {
      header: 'Category',
      accessor: (item) => {
        const category = item.category
        if (category) {
          if (category.translations && category.translations.en) {
            return category.translations.en.title
          }
          return category.title || 'N/A'
        }
        return 'N/A'
      },
    },
    { header: 'Price', accessor: 'price' },
  ]

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    fetchCourses(currentPage)
  }, [currentPage])

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true)
      const response = await api.get(`/courses?page=${page}&pageSize=10`)

      if (response?.data) {
        setCourses(response.data)
      }

      // Update pagination state if available in response
      if (response?.pagination) {
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = () => {
    if (!hasWritePermission) return

    navigate('/courses/new', { state: { isEditing: false } })
  }

  const handleEdit = (course) => {
    navigate(`/courses/${course.slug}/edit`, { state: { isEditing: true } })
  }

  const initiateDelete = (course) => {
    setCourseToDelete(course)
    setDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.slug}`)
      setDeleteModal(false)
      setCourseToDelete(null)

      // Refresh the current page, or go to previous page if this was the last item
      const currentPageNumber = pagination.currentPage
      const isLastItemOnPage =
        courses.length === 1 && pagination.currentPage > 1

      if (isLastItemOnPage) {
        setSearchParams({ page: (currentPageNumber - 1).toString() })
      } else {
        fetchCourses(currentPageNumber)
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const handleView = (course) => {
    setCurrentCourse(course)
    setViewVisible(true)
  }

  const paginate = (pageNumber) => {
    setSearchParams({ page: pageNumber.toString() })
  }

  const emptyStateComponent = (
    <EmptyState
      title="No Courses Found"
      message="There are no courses in the database yet."
      actionLabel={hasWritePermission ? 'Add Course' : null}
      onAction={hasWritePermission ? handleAddCourse : null}
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
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>Courses</h4>
              {pagination.totalCount > 0 && (
                <p className="text-medium-emphasis">
                  Showing {courses.length} of {pagination.totalCount} courses
                </p>
              )}
            </div>
            {hasWritePermission && (
              <CButton color="primary" onClick={handleAddCourse}>
                Add Course
              </CButton>
            )}
          </div>

          <ResourceTable
            columns={tableColumns}
            data={courses}
            resourceType="courses"
            onView={handleView}
            onEdit={hasWritePermission ? handleEdit : undefined}
            onDelete={hasWritePermission ? initiateDelete : undefined}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              onPageChange: paginate,
            }}
            emptyState={emptyStateComponent}
          />
        </CCardBody>
      </CCard>

      {currentCourse && (
        <COffcanvas
          placement="end"
          visible={viewVisible}
          onHide={() => setViewVisible(false)}
        >
          <COffcanvasHeader>
            <COffcanvasTitle>Course Details</COffcanvasTitle>
          </COffcanvasHeader>
          <COffcanvasBody>
            <div className="mb-4">
              <h6 className="text-muted mb-2">Title</h6>
              <p className="fs-5">
                {currentCourse.translations?.en?.title ||
                  currentCourse.title ||
                  'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-2">Arabic Title</h6>
              <p className="fs-5" dir="rtl">
                {currentCourse.translations?.ar?.title || 'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-2">Category</h6>
              <p className="fs-5">
                {currentCourse.category?.translations?.en?.title ||
                  currentCourse.category?.title ||
                  'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-2">Price</h6>
              <p className="fs-5">{currentCourse.price}</p>
            </div>

            {currentCourse.image && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">Image</h6>
                <img
                  src={`${BACKEND_URL}/${currentCourse.image.data || currentCourse.image}`}
                  alt={
                    currentCourse.translations?.en?.title || currentCourse.title
                  }
                  className="img-fluid rounded"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => setViewVisible(false)}>
                Close
              </CButton>
              {hasWritePermission && (
                <CButton
                  color="warning"
                  onClick={() => {
                    setViewVisible(false)
                    handleEdit(currentCourse)
                  }}
                >
                  Edit
                </CButton>
              )}
            </div>
          </COffcanvasBody>
        </COffcanvas>
      )}

      <ConfirmDeleteModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={
          courseToDelete?.translations?.en?.title || courseToDelete?.title
        }
        itemType="course"
      />
    </>
  )
}

export default Course
