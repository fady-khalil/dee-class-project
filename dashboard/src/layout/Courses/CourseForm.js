import React from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import VideoUploader from '../../components/VideoUploader'

const CourseForm = ({ course = {}, session = {} }) => {
  return (
    <>
      {course._id && (
        <CCard className="mb-4">
          <CCardHeader>Course Trailer</CCardHeader>
          <CCardBody>
            <VideoUploader
              entityId={course._id}
              entityType="course"
              onUploadComplete={(data) => {
                console.log('Trailer uploaded:', data)
                // Update form data or state as needed
              }}
            />
          </CCardBody>
        </CCard>
      )}

      {session._id && (
        <CCard className="mb-4">
          <CCardHeader>Session Video</CCardHeader>
          <CCardBody>
            <VideoUploader
              entityId={session._id}
              entityType="session"
              onUploadComplete={(data) => {
                console.log('Session video uploaded:', data)
                // Update form data or state as needed
              }}
            />
          </CCardBody>
        </CCard>
      )}
    </>
  )
}

export default CourseForm
