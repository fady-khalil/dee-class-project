import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
} from '@coreui/react'
import { api } from 'src/services/api'
import {
  UserFilters,
  UserTable,
  PaginationComponent,
} from './components'

const UserList = () => {
  // State
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })

  // Filter states
  const [verificationFilter, setVerificationFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [itemsFilter, setItemsFilter] = useState('')
  const [sortBy, setSortBy] = useState('fullName')
  const [sortOrder, setSortOrder] = useState('asc')

  // Load users with pagination and filters
  const loadUsers = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      })

      // Add optional filters if they are set
      if (searchTerm) params.append('search', searchTerm)
      if (verificationFilter)
        params.append('isVerified', verificationFilter === 'verified')
      if (paymentFilter) params.append('isPaid', paymentFilter === 'paid')
      if (itemsFilter) params.append('hasItems', itemsFilter === 'hasItems')

      // Make API request
      const response = await api.get(
        `/admin/regular-users?${params.toString()}`,
      )

      // Update state
      setUsers(response.data || [])
      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      )
      setError(null)
    } catch (err) {
      console.error('Error loading users:', err)
      setError(`Failed to load users: ${err.message}`)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  // Handle filter changes
  const handleFilterChange = () => {
    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setVerificationFilter('')
    setPaymentFilter('')
    setItemsFilter('')
    setSortBy('fullName')
    setSortOrder('asc')
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  // Apply filters when page changes or filters change
  useEffect(() => {
    loadUsers()
  }, [
    pagination.page,
    verificationFilter,
    paymentFilter,
    itemsFilter,
    sortBy,
    sortOrder,
  ])

  // Apply search when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadUsers()
      } else {
        // If we're not on page 1, reset to page 1 (which will trigger loadUsers)
        setPagination((prev) => ({
          ...prev,
          page: 1,
        }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CRow>
          <CCol>
            <h5>User Management</h5>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filters */}
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verificationFilter={verificationFilter}
          setVerificationFilter={setVerificationFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          itemsFilter={itemsFilter}
          setItemsFilter={setItemsFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
        />

        {/* Users Table */}
        <UserTable
          users={users}
          loading={loading}
          searchTerm={searchTerm}
          filters={{ verificationFilter, paymentFilter, itemsFilter }}
        />

        {/* Pagination */}
        <PaginationComponent
          pagination={pagination}
          handlePageChange={handlePageChange}
        />
      </CCardBody>
    </CCard>
  )
}

export default UserList
