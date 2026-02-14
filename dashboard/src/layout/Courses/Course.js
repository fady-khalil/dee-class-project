import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CButton, CSpinner } from '@coreui/react'
import { api } from '../../services/api'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import { useAuth } from '../../context/AuthContext'
import CategorySection from './components/CategorySection'
import CourseViewOffcanvas from './components/CourseViewOffcanvas'

const Course = () => {
  const navigate = useNavigate()
  const { canWrite } = useAuth()
  const hasWritePermission = canWrite('courses')

  const [grouped, setGrouped] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewVisible, setViewVisible] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  useEffect(() => {
    fetchGrouped()
  }, [])

  const fetchGrouped = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses/grouped')
      if (response?.data) setGrouped(response.data)
    } catch (error) {
      console.error('Failed to fetch grouped courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (categoryId, orderedIds) => {
    // Optimistic update
    setGrouped((prev) =>
      prev.map((cat) => {
        if (cat._id !== categoryId) return cat
        const reordered = orderedIds.map((id) => cat.courses.find((c) => c._id === id))
        return { ...cat, courses: reordered }
      }),
    )

    try {
      await api.put('/courses/reorder', { orderedIds })
    } catch (error) {
      console.error('Failed to reorder:', error)
      fetchGrouped() // rollback on failure
    }
  }

  const handleAddCourse = () => {
    if (!hasWritePermission) return
    navigate('/courses/new', { state: { isEditing: false } })
  }

  const handleEdit = (course) => {
    navigate(`/courses/${course.slug}/edit`, { state: { isEditing: true } })
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.slug}`)
      setDeleteModal(false)
      setCourseToDelete(null)
      fetchGrouped()
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const totalCourses = grouped.reduce((sum, cat) => sum + cat.courses.length, 0)

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
              {totalCourses > 0 && (
                <p className="text-medium-emphasis">{totalCourses} courses total</p>
              )}
            </div>
            {hasWritePermission && (
              <CButton color="primary" onClick={handleAddCourse}>
                Add Course
              </CButton>
            )}
          </div>

          {grouped.length === 0 ? (
            <EmptyState
              title="No Courses Found"
              message="There are no courses in the database yet."
              actionLabel={hasWritePermission ? 'Add Course' : null}
              onAction={hasWritePermission ? handleAddCourse : null}
            />
          ) : (
            grouped.map((category) => (
              <CategorySection
                key={category._id}
                category={category}
                onView={(course) => {
                  setCurrentCourse(course)
                  setViewVisible(true)
                }}
                onEdit={handleEdit}
                onDelete={(course) => {
                  setCourseToDelete(course)
                  setDeleteModal(true)
                }}
                onReorder={handleReorder}
                hasWritePermission={hasWritePermission}
              />
            ))
          )}
        </CCardBody>
      </CCard>

      <CourseViewOffcanvas
        visible={viewVisible}
        course={currentCourse}
        onHide={() => setViewVisible(false)}
        onEdit={handleEdit}
        hasWritePermission={hasWritePermission}
      />

      <ConfirmDeleteModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={courseToDelete?.name}
        itemType="course"
      />
    </>
  )
}

export default Course
