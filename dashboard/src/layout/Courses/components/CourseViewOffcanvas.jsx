import React from 'react'
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CButton,
} from '@coreui/react'
import BACKEND_URL from '../../../config'

const CourseViewOffcanvas = ({ visible, course, onHide, onEdit, hasWritePermission }) => {
  if (!course) return null

  return (
    <COffcanvas placement="end" visible={visible} onHide={onHide}>
      <COffcanvasHeader>
        <COffcanvasTitle>Course Details</COffcanvasTitle>
      </COffcanvasHeader>
      <COffcanvasBody>
        <div className="mb-4">
          <h6 className="text-muted mb-2">Title</h6>
          <p className="fs-5">{course.name || 'N/A'}</p>
        </div>

        <div className="mb-4">
          <h6 className="text-muted mb-2">Category</h6>
          <p className="fs-5">{course.category?.title || 'N/A'}</p>
        </div>

        <div className="mb-4">
          <h6 className="text-muted mb-2">Price</h6>
          <p className="fs-5">${course.price}</p>
        </div>

        {course.image && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">Image</h6>
            <img
              src={`${BACKEND_URL}/${course.image.data || course.image}`}
              alt={course.name || 'Course'}
              className="img-fluid rounded"
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <CButton color="secondary" onClick={onHide}>
            Close
          </CButton>
          {hasWritePermission && (
            <CButton
              color="warning"
              onClick={() => {
                onHide()
                onEdit(course)
              }}
            >
              Edit
            </CButton>
          )}
        </div>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default CourseViewOffcanvas
