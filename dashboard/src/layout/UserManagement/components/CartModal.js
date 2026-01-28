import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'

const CartModal = ({
  selectedUser,
  userCart,
  cartLoading,
  cartError,
  markPaidError,
  setSelectedUser,
  setUserCart,
  setCartError,
  setConfirmModalVisible,
}) => {
  if (!selectedUser) return null

  return (
    <CModal
      visible={selectedUser !== null}
      onClose={() => {
        setSelectedUser(null)
        setUserCart(null)
        setCartError(null)
      }}
      size="lg"
    >
      <CModalHeader>
        <CModalTitle>{selectedUser?.fullName}'s Cart</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {cartLoading ? (
          <div className="text-center py-3">
            <CSpinner color="primary" />
          </div>
        ) : cartError ? (
          <CAlert color="danger">{cartError}</CAlert>
        ) : !userCart ||
          ((!userCart.books || userCart.books.length === 0) &&
            (!userCart.courses || userCart.courses.length === 0)) ? (
          <CAlert color="info">This user has no items in their cart.</CAlert>
        ) : (
          <>
            <CAccordion activeItemKey={1}>
              {userCart.books && userCart.books.length > 0 && (
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>
                    Books ({userCart.books.length})
                  </CAccordionHeader>
                  <CAccordionBody>
                    <CTable small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Title</CTableHeaderCell>
                          <CTableHeaderCell>Price</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {userCart.books.map((book, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{book.title}</CTableDataCell>
                            <CTableDataCell>${book.price}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CAccordionBody>
                </CAccordionItem>
              )}

              {userCart.courses && userCart.courses.length > 0 && (
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>
                    Courses ({userCart.courses.length})
                  </CAccordionHeader>
                  <CAccordionBody>
                    <CTable small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Title</CTableHeaderCell>
                          <CTableHeaderCell>Price</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {userCart.courses.map((course, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{course.title}</CTableDataCell>
                            <CTableDataCell>${course.price}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CAccordionBody>
                </CAccordionItem>
              )}
            </CAccordion>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <h5>Total: ${userCart.total}</h5>
                {userCart.status && (
                  <CBadge
                    color={
                      userCart.status === 'pending'
                        ? 'warning'
                        : userCart.status === 'completed'
                          ? 'success'
                          : 'info'
                    }
                    className="ms-2"
                  >
                    {userCart.status.charAt(0).toUpperCase() +
                      userCart.status.slice(1)}
                  </CBadge>
                )}
              </div>

              {userCart?.status === 'pending' && (
                <CButton
                  color="success"
                  className="text-white"
                  onClick={() => setConfirmModalVisible(true)}
                >
                  Complete Purchase
                </CButton>
              )}
            </div>

            {markPaidError && (
              <CAlert color="danger" className="mt-3">
                {markPaidError}
              </CAlert>
            )}
          </>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          onClick={() => {
            setSelectedUser(null)
            setUserCart(null)
            setCartError(null)
          }}
        >
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CartModal
