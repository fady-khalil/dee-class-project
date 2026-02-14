import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowTop,
  cilArrowBottom,
  cilPencil,
  cilTrash,
  cilZoom,
  cilChevronBottom,
  cilChevronRight,
} from '@coreui/icons'

const CategorySection = ({
  category,
  onView,
  onEdit,
  onDelete,
  onReorder,
  hasWritePermission,
}) => {
  const [open, setOpen] = useState(true)
  const { courses } = category

  const handleMoveUp = (index) => {
    if (index === 0) return
    const updated = [...courses]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onReorder(category._id, updated.map((c) => c._id))
  }

  const handleMoveDown = (index) => {
    if (index === courses.length - 1) return
    const updated = [...courses]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onReorder(category._id, updated.map((c) => c._id))
  }

  return (
    <div className="mb-4">
      <div
        className="d-flex align-items-center gap-2 p-2 bg-light rounded cursor-pointer"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <CIcon icon={open ? cilChevronBottom : cilChevronRight} size="sm" />
        <h5 className="mb-0">
          {category.title}{' '}
          <span className="text-medium-emphasis fw-normal fs-6">
            ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
          </span>
        </h5>
      </div>

      <CCollapse visible={open}>
        {courses.length === 0 ? (
          <p className="text-medium-emphasis ms-3 mt-2">No courses in this category</p>
        ) : (
          <CTable hover responsive className="mt-2">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: 50 }}>#</CTableHeaderCell>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 80 }}>Price</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 200 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {courses.map((course, idx) => (
                <CTableRow key={course._id}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell>{course.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>${course.price}</CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex gap-1">
                      {hasWritePermission && (
                        <>
                          <CButton
                            color="light"
                            size="sm"
                            disabled={idx === 0}
                            onClick={() => handleMoveUp(idx)}
                            title="Move up"
                          >
                            <CIcon icon={cilArrowTop} size="sm" />
                          </CButton>
                          <CButton
                            color="light"
                            size="sm"
                            disabled={idx === courses.length - 1}
                            onClick={() => handleMoveDown(idx)}
                            title="Move down"
                          >
                            <CIcon icon={cilArrowBottom} size="sm" />
                          </CButton>
                        </>
                      )}
                      <CButton
                        color="info"
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(course)}
                        title="View"
                      >
                        <CIcon icon={cilZoom} size="sm" />
                      </CButton>
                      {hasWritePermission && (
                        <>
                          <CButton
                            color="warning"
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(course)}
                            title="Edit"
                          >
                            <CIcon icon={cilPencil} size="sm" />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(course)}
                            title="Delete"
                          >
                            <CIcon icon={cilTrash} size="sm" />
                          </CButton>
                        </>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCollapse>
    </div>
  )
}

export default CategorySection
