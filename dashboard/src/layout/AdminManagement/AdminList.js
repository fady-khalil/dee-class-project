import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CRow,
  CCol,
  CFormInput,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { api } from 'src/services/api'
import BACKEND_URL from '../../config'

const AdminList = () => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'danger'
      case 'admin':
        return 'primary'
      case 'read_only':
        return 'info'
      default:
        return 'secondary'
    }
  }

  // Load admins
  const loadAdmins = async () => {
    try {
      setLoading(true)
      // Hardcode the API URL
      const API_BASE_URL = BACKEND_URL
      const token = localStorage.getItem('admin_token')

      console.log('Fetching admin users with token:', token)

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const responseText = await response.text()
      console.log('Admin users API response:', response.status, responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse API response:', e)
        throw new Error('Invalid response format')
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error ${response.status}`)
      }

      // Check the structure of the response
      console.log('Parsed admin users data:', data)

      // Access the correct data path
      const adminsList = data.data || []
      console.log('Admin users list:', adminsList)

      setAdmins(adminsList)
      setError(null)
    } catch (err) {
      console.error('Error loading admins:', err)
      setError(`Failed to load admin users: ${err.message}`)
      setAdmins([]) // Initialize as empty array to prevent filter errors
    } finally {
      setLoading(false)
    }
  }

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return

    try {
      await api.delete(`/admin/users/${selectedAdmin._id}`)
      setDeleteModalVisible(false)
      setSelectedAdmin(null)
      loadAdmins() // Reload the list
    } catch (err) {
      console.error('Error deleting admin:', err)
      setError('Failed to delete admin user. Please try again.')
    }
  }

  // Initialize the component
  useEffect(() => {
    loadAdmins()
  }, [])

  // Filter admins based on search term - with null check
  const filteredAdmins =
    admins && admins.length > 0
      ? admins.filter(
          (admin) =>
            admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.role?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : []

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow>
            <CCol>
              <h5>Admin Users</h5>
            </CCol>
            <CCol xs="auto">
              <Link to="/admin-management/new">
                <CButton color="primary">Add New Admin</CButton>
              </Link>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="text"
                placeholder="Search admin users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Created Date</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredAdmins.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      {searchTerm
                        ? 'No admin users found matching your search'
                        : 'No admin users found'}
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <CTableRow key={admin._id}>
                      <CTableDataCell>{admin.fullName}</CTableDataCell>
                      <CTableDataCell>{admin.email}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getRoleBadgeColor(admin.role)}>
                          {admin.role.replace('_', ' ')}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <Link to={`/admin-management/${admin._id}/edit`}>
                          <CButton color="info" size="sm" className="me-2">
                            Edit
                          </CButton>
                        </Link>
                        {admin.role !== 'super_admin' && (
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin)
                              setDeleteModalVisible(true)
                            }}
                          >
                            Delete
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the admin user{' '}
          <strong>{selectedAdmin?.fullName}</strong>? This action cannot be
          undone.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModalVisible(false)}
          >
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteAdmin}>
            Delete Admin
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AdminList
