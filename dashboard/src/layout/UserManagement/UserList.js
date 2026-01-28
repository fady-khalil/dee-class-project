import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { api } from 'src/services/api'
import {
  UserFilters,
  UserTable,
  PaginationComponent,
  CartModal,
  ConfirmPurchaseModal,
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

  // Cart states
  const [selectedUser, setSelectedUser] = useState(null)
  const [userCart, setUserCart] = useState(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [markPaidSuccess, setMarkPaidSuccess] = useState(null)
  const [markPaidError, setMarkPaidError] = useState(null)

  // Ref for alert timeout
  const alertTimeoutRef = useRef(null)

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

  // Load user's cart
  const loadUserCart = async (userId) => {
    try {
      setCartLoading(true)
      setCartError(null)

      // Make API request to get user's cart
      const response = await api.get(`/admin/regular-users/${userId}/cart`)
      setUserCart(response.data || { books: [], courses: [], total: 0 })
    } catch (err) {
      console.error('Error loading user cart:', err)
      // Only set error for actual errors, not for "no cart" responses
      if (err.message !== 'Cart not found for this user') {
        setCartError(`Failed to load user's cart: ${err.message}`)
      } else {
        // Just set an empty cart
        setUserCart({ books: [], courses: [], total: 0 })
      }
    } finally {
      setCartLoading(false)
    }
  }

  // Handle view cart click
  const handleViewCart = (user) => {
    setSelectedUser(user)
    loadUserCart(user._id)
  }

  // Handle mark as paid
  const handleCompletePurchase = async () => {
    if (!selectedUser) return

    try {
      setMarkingPaid(true)
      setMarkPaidError(null)

      // Call API to complete the purchase
      await api.post(
        `/admin/regular-users/${selectedUser._id}/complete-purchase`,
      )

      // Show success message
      setMarkPaidSuccess(
        `${selectedUser.fullName}'s purchase has been completed successfully!`,
      )

      // Close modal
      setConfirmModalVisible(false)
      setSelectedUser(null)
      setUserCart(null)

      // Reload users
      loadUsers()

      // Clear success message after 5 seconds
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current)
      }

      alertTimeoutRef.current = setTimeout(() => {
        setMarkPaidSuccess(null)
      }, 5000)
    } catch (err) {
      console.error('Error completing purchase:', err)
      setMarkPaidError(`Failed to complete purchase: ${err.message}`)
    } finally {
      setMarkingPaid(false)
    }
  }

  // Clear alert timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
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

          {markPaidSuccess && (
            <CAlert color="success" dismissible>
              {markPaidSuccess}
            </CAlert>
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
            handleViewCart={handleViewCart}
          />

          {/* Pagination */}
          <PaginationComponent
            pagination={pagination}
            handlePageChange={handlePageChange}
          />
        </CCardBody>
      </CCard>

      {/* Cart Modal */}
      <CartModal
        selectedUser={selectedUser}
        userCart={userCart}
        cartLoading={cartLoading}
        cartError={cartError}
        markPaidError={markPaidError}
        setSelectedUser={setSelectedUser}
        setUserCart={setUserCart}
        setCartError={setCartError}
        setConfirmModalVisible={setConfirmModalVisible}
      />

      {/* Confirm Purchase Completion Modal */}
      <ConfirmPurchaseModal
        confirmModalVisible={confirmModalVisible}
        setConfirmModalVisible={setConfirmModalVisible}
        selectedUser={selectedUser}
        markingPaid={markingPaid}
        handleCompletePurchase={handleCompletePurchase}
      />
    </>
  )
}

export default UserList
