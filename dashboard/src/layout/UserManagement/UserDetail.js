import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CBadge,
  CListGroup,
  CListGroupItem,
  CCardImage,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGift, cilCreditCard, cilUser, cilCalendar } from '@coreui/icons'
import { api } from 'src/services/api'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user details
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/regular-users/${id}`)
        setUser(response.data)
        setError(null)
      } catch (err) {
        console.error('Error loading user details:', err)
        setError(`Failed to load user details: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id])

  // Handle back button
  const handleBack = () => {
    navigate('/users')
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get subscription status badge
  const getSubscriptionStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      cancelled: 'warning',
      expired: 'danger',
      past_due: 'danger',
    }
    return (
      <CBadge color={statusColors[status] || 'secondary'}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'None'}
      </CBadge>
    )
  }

  // Get gift status badge
  const getGiftStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      redeemed: 'success',
      expired: 'danger',
    }
    return (
      <CBadge color={statusColors[status] || 'secondary'}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </CBadge>
    )
  }

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <h5>User Details</h5>
        </CCardHeader>
        <CCardBody>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <CButton color="primary" onClick={handleBack}>
            Back to Users
          </CButton>
        </CCardBody>
      </CCard>
    )
  }

  const subscription = user?.subscription
  const plan = subscription?.planId
  const hasActiveSubscription =
    subscription?.status === 'active' &&
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) > new Date()

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow>
            <CCol>
              <h5>User Details</h5>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" onClick={handleBack}>
                Back to Users
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {user && (
            <>
              {/* User Information */}
              <CRow className="mb-4">
                <CCol md={6}>
                  <h6 className="mb-3">Personal Information</h6>
                  <CListGroup>
                    <CListGroupItem>
                      <strong>Name:</strong> {user.fullName || 'N/A'}
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Email:</strong> {user.email}
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Phone:</strong> {user.phoneNumber || 'N/A'}
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Created:</strong> {formatDateTime(user.createdAt)}
                    </CListGroupItem>
                  </CListGroup>
                </CCol>
                <CCol md={6}>
                  <h6 className="mb-3">Account Status</h6>
                  <CListGroup>
                    <CListGroupItem>
                      <strong>Verification Status:</strong>{' '}
                      <CBadge color={user.verified ? 'success' : 'warning'}>
                        {user.verified ? 'Verified' : 'Not Verified'}
                      </CBadge>
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Subscription Status:</strong>{' '}
                      {getSubscriptionStatusBadge(subscription?.status)}
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Total Purchased Courses:</strong>{' '}
                      {user.purchasedItems?.courses?.length || 0}
                    </CListGroupItem>
                    <CListGroupItem>
                      <strong>Profiles:</strong> {user.profiles?.length || 0}
                    </CListGroupItem>
                  </CListGroup>
                </CCol>
              </CRow>

              {/* Subscription Details */}
              <CCard className="mb-4 border-primary">
                <CCardHeader className="bg-primary text-white">
                  <CIcon icon={cilCreditCard} className="me-2" />
                  <strong>Subscription Details</strong>
                </CCardHeader>
                <CCardBody>
                  {hasActiveSubscription ? (
                    <CRow>
                      <CCol md={6}>
                        <CListGroup flush>
                          <CListGroupItem>
                            <strong>Plan:</strong> {plan?.title || 'N/A'}
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Status:</strong>{' '}
                            {getSubscriptionStatusBadge(subscription?.status)}
                            {subscription?.cancelAtPeriodEnd && (
                              <CBadge color="warning" className="ms-2">
                                Cancels at period end
                              </CBadge>
                            )}
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Profiles Allowed:</strong>{' '}
                            {subscription?.profilesAllowed || plan?.profilesAllowed || 0}
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Can Download:</strong>{' '}
                            <CBadge color={subscription?.canDownload ? 'success' : 'secondary'}>
                              {subscription?.canDownload ? 'Yes' : 'No'}
                            </CBadge>
                          </CListGroupItem>
                        </CListGroup>
                      </CCol>
                      <CCol md={6}>
                        <CListGroup flush>
                          <CListGroupItem>
                            <strong>Period Start:</strong>{' '}
                            {formatDate(subscription?.currentPeriodStart)}
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Period End:</strong>{' '}
                            {formatDate(subscription?.currentPeriodEnd)}
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Days Remaining:</strong>{' '}
                            <CBadge color="info">
                              {getDaysRemaining(subscription?.currentPeriodEnd)} days
                            </CBadge>
                          </CListGroupItem>
                          <CListGroupItem>
                            <strong>Stripe Customer ID:</strong>{' '}
                            <code className="small">{subscription?.stripeCustomerId || 'N/A'}</code>
                          </CListGroupItem>
                        </CListGroup>
                      </CCol>
                    </CRow>
                  ) : (
                    <div className="alert alert-info mb-0">
                      <CIcon icon={cilUser} className="me-2" />
                      This user does not have an active subscription.
                      {subscription?.status === 'cancelled' && (
                        <span className="ms-2">
                          (Cancelled - expired on {formatDate(subscription?.currentPeriodEnd)})
                        </span>
                      )}
                      {subscription?.status === 'expired' && (
                        <span className="ms-2">
                          (Expired on {formatDate(subscription?.currentPeriodEnd)})
                        </span>
                      )}
                    </div>
                  )}
                </CCardBody>
              </CCard>

              {/* Gifts Section */}
              <CAccordion alwaysOpen className="mb-4">
                {/* Gifts Purchased (Paid) */}
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>
                    <CIcon icon={cilGift} className="me-2 text-success" />
                    <strong>Gifts Purchased (Paid)</strong>
                    <CBadge color="success" className="ms-2">
                      {user.giftsPurchased?.length || 0}
                    </CBadge>
                  </CAccordionHeader>
                  <CAccordionBody>
                    {user.giftsPurchased?.length > 0 ? (
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Code</CTableHeaderCell>
                            <CTableHeaderCell>Plan</CTableHeaderCell>
                            <CTableHeaderCell>Duration</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Purchased</CTableHeaderCell>
                            <CTableHeaderCell>Redeemed By</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {user.giftsPurchased.map((gift) => (
                            <CTableRow key={gift._id}>
                              <CTableDataCell>
                                <code>{gift.code}</code>
                              </CTableDataCell>
                              <CTableDataCell>{gift.planId?.title || 'N/A'}</CTableDataCell>
                              <CTableDataCell>
                                {gift.billingCycle === 'yearly' ? '1 Year' : '1 Month'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {(gift.amountPaid / 100).toFixed(2)} {gift.currency}
                              </CTableDataCell>
                              <CTableDataCell>{getGiftStatusBadge(gift.status)}</CTableDataCell>
                              <CTableDataCell>{formatDate(gift.createdAt)}</CTableDataCell>
                              <CTableDataCell>
                                {gift.redeemedBy ? (
                                  <span>
                                    {gift.redeemedBy.fullName || gift.redeemedBy.email}
                                    <br />
                                    <small className="text-muted">
                                      {formatDate(gift.redeemedAt)}
                                    </small>
                                  </span>
                                ) : (
                                  <span className="text-muted">Not redeemed</span>
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    ) : (
                      <div className="alert alert-light mb-0">
                        This user has not purchased any gift codes.
                      </div>
                    )}
                  </CAccordionBody>
                </CAccordionItem>

                {/* Gifts Received */}
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>
                    <CIcon icon={cilGift} className="me-2 text-primary" />
                    <strong>Gifts Received</strong>
                    <CBadge color="primary" className="ms-2">
                      {user.giftsReceived?.length || 0}
                    </CBadge>
                  </CAccordionHeader>
                  <CAccordionBody>
                    {user.giftsReceived?.length > 0 ? (
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Code</CTableHeaderCell>
                            <CTableHeaderCell>Plan</CTableHeaderCell>
                            <CTableHeaderCell>Duration</CTableHeaderCell>
                            <CTableHeaderCell>From</CTableHeaderCell>
                            <CTableHeaderCell>Redeemed On</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {user.giftsReceived.map((gift) => (
                            <CTableRow key={gift._id}>
                              <CTableDataCell>
                                <code>{gift.code}</code>
                              </CTableDataCell>
                              <CTableDataCell>{gift.planId?.title || 'N/A'}</CTableDataCell>
                              <CTableDataCell>
                                {gift.billingCycle === 'yearly' ? '1 Year' : '1 Month'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {gift.purchasedBy?.fullName || gift.purchasedBy?.email || 'Unknown'}
                              </CTableDataCell>
                              <CTableDataCell>{formatDate(gift.redeemedAt)}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    ) : (
                      <div className="alert alert-light mb-0">
                        This user has not received any gift codes.
                      </div>
                    )}
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>

              {/* Purchased Courses */}
              {user.purchasedItems?.courses?.length > 0 && (
                <CCard className="mb-4">
                  <CCardHeader>
                    <strong>Purchased Courses</strong>
                    <CBadge color="info" className="ms-2">
                      {user.purchasedItems.courses.length}
                    </CBadge>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      {user.purchasedItems.courses.map((course) => (
                        <CCol key={course._id} md={4} className="mb-3">
                          <CCard>
                            {(course.thumbnail || course.videoTrailer?.assets?.thumbnail) && (
                              <CCardImage
                                orientation="top"
                                src={course.thumbnail || course.videoTrailer?.assets?.thumbnail}
                                alt={course.title}
                                style={{ height: '150px', objectFit: 'cover' }}
                              />
                            )}
                            <CCardBody>
                              <h6 className="mb-2">{course.title}</h6>
                              <p className="mb-1 small">
                                <strong>Price:</strong> {course.price} SAR
                              </p>
                              {course.purchasedAt && (
                                <p className="mb-0 small text-muted">
                                  <CIcon icon={cilCalendar} size="sm" className="me-1" />
                                  {formatDate(course.purchasedAt)}
                                </p>
                              )}
                            </CCardBody>
                          </CCard>
                        </CCol>
                      ))}
                    </CRow>
                  </CCardBody>
                </CCard>
              )}

              {/* No Items Message */}
              {(!user.purchasedItems?.courses || user.purchasedItems?.courses?.length === 0) &&
                !hasActiveSubscription &&
                (!user.giftsPurchased || user.giftsPurchased.length === 0) &&
                (!user.giftsReceived || user.giftsReceived.length === 0) && (
                  <div className="alert alert-info">
                    This user has no subscription, purchased courses, or gift activity.
                  </div>
                )}
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default UserDetail
