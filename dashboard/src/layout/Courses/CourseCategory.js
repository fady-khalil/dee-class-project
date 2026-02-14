import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import { api } from '../../services/api'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import ResourceTable from '../../components/common/ResourceTable'
import { useAuth } from '../../context/AuthContext'

const CourseCategory = () => {
  const { canWrite } = useAuth()
  const hasWritePermission = canWrite('courses')

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState({
    title: '',
    title_ar: '',
    status: 'active',
    image: null,
  })
  const [viewVisible, setViewVisible] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState(1)

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
    { header: 'Slug', accessor: 'slug' },
    {
      header: 'Status',
      accessor: (item) => {
        const status = item.status || 'active'
        return (
          <span
            className={`badge ${status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}
          >
            {status === 'active' ? 'Active' : 'Coming Soon'}
          </span>
        )
      },
    },
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/course-categories')
      setCategories(data?.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (!hasWritePermission) return

    setIsEditing(false)
    setCurrentCategory({ title: '', title_ar: '', slug: '', status: 'active', image: null })
    setErrorMessage('')
    setVisible(true)
  }

  const handleEdit = async (category) => {
    setIsEditing(true)

    console.log('Starting edit for category:', category)

    try {
      // Try to get the category with full translations from admin endpoint first
      let response
      try {
        const adminEndpoint = `/course-categories/admin/${category.slug}`
        console.log('Calling admin endpoint:', adminEndpoint)

        response = await api.get(adminEndpoint)
        console.log('Category data from admin API:', response)
        console.log('Category translations:', response.data?.translations)
      } catch (adminError) {
        console.error('Admin endpoint failed with error:', adminError)
        console.log('Falling back to regular endpoint')
        // If admin endpoint fails, fall back to using the provided category data
        response = { data: category }
      }

      const categoryData = response.data

      // Format data for editing
      const formattedCategory = {
        id: categoryData._id || categoryData.id,
        slug: categoryData.slug,
        title: '',
        title_ar: '',
        status: categoryData.status || 'active',
        image: categoryData.image || null,
      }

      // Extract translations if available
      if (categoryData.translations) {
        console.log(
          'Found translations in category data:',
          categoryData.translations,
        )
        formattedCategory.title = categoryData.translations.en?.title || ''
        formattedCategory.title_ar = categoryData.translations.ar?.title || ''
        console.log('Extracted titles:', {
          title: formattedCategory.title,
          title_ar: formattedCategory.title_ar,
        })
      } else {
        // Legacy support
        console.log('No translations found, using legacy format')
        formattedCategory.title = categoryData.title || ''
      }

      console.log('Final formatted category:', formattedCategory)
      setCurrentCategory(formattedCategory)
    } catch (error) {
      console.error('Failed to fetch category data:', error)
    }

    setErrorMessage('')
    setVisible(true)
  }

  const handleTabChange = (tabId, e) => {
    if (e) {
      e.preventDefault()
    }
    setActiveTab(tabId)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrorMessage('')
    setCurrentCategory((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('title', currentCategory.title)
      formData.append('title_ar', currentCategory.title_ar)
      formData.append('status', currentCategory.status)
      if (currentCategory.imageFile) {
        formData.append('image', currentCategory.imageFile)
      }

      if (isEditing) {
        await api.putWithFile(`/course-categories/${currentCategory.slug}`, formData)
      } else {
        await api.postWithFile('/course-categories', formData)
      }
      setVisible(false)
      setCurrentCategory({ title: '', title_ar: '', status: 'active', image: null })
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error?.message)
      setErrorMessage(
        `Failed to ${isEditing ? 'update' : 'create'} category: ${error?.message || 'Unknown error occurred'}`,
      )
    }
  }

  const initiateDelete = (category) => {
    setCategoryToDelete(category)
    setDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/course-categories/${categoryToDelete.slug}`)
      setDeleteModal(false)
      setCategoryToDelete(null)
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleView = (category) => {
    // Format data for viewing
    const formattedCategory = {
      ...category,
      title: category.translations?.en?.title || category.title || 'N/A',
      title_ar: category.translations?.ar?.title || 'N/A',
      status: category.status || 'active',
      image: category.image || null,
    }

    setCurrentCategory(formattedCategory)
    setViewVisible(true)
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(categories.length / itemsPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const emptyStateComponent = (
    <EmptyState
      title="No Course Categories Found"
      message="There are no course categories in the database yet."
      actionLabel={hasWritePermission ? 'Add Category' : null}
      onAction={hasWritePermission ? handleAddCategory : null}
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
            <h4>Course Categories</h4>
            {hasWritePermission && (
              <CButton color="primary" onClick={handleAddCategory}>
                Add Category
              </CButton>
            )}
          </div>

          <ResourceTable
            columns={tableColumns}
            data={currentCategories}
            resourceType="courses"
            onView={handleView}
            onEdit={hasWritePermission ? handleEdit : undefined}
            onDelete={hasWritePermission ? initiateDelete : undefined}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: paginate,
            }}
            emptyState={emptyStateComponent}
          />
        </CCardBody>
      </CCard>

      <COffcanvas
        placement="end"
        visible={visible}
        onHide={() => {
          setVisible(false)
          setErrorMessage('')
        }}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CForm onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="alert alert-danger mb-3">{errorMessage}</div>
            )}

            {/* Language Tabs */}
            <div className="mb-3">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
                    onClick={(e) => handleTabChange(1, e)}
                    type="button"
                  >
                    English
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
                    onClick={(e) => handleTabChange(2, e)}
                    type="button"
                  >
                    Arabic
                  </button>
                </li>
              </ul>
            </div>

            {/* English Title */}
            <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
              <div className="mb-3">
                <label className="form-label">Title (English)</label>
                <CFormInput
                  type="text"
                  name="title"
                  value={currentCategory.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Arabic Title */}
            <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
              <div className="mb-3">
                <label className="form-label">Title (Arabic)</label>
                <CFormInput
                  type="text"
                  name="title_ar"
                  value={currentCategory.title_ar}
                  onChange={handleInputChange}
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <CFormSelect
                name="status"
                value={currentCategory.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
              </CFormSelect>
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label">Image (400x600 recommended)</label>
              <CFormInput
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setCurrentCategory((prev) => ({
                    ...prev,
                    imageFile: file,
                  }))
                }}
              />
              {currentCategory.image && !currentCategory.imageFile && (
                <img
                  src={`${process.env.REACT_APP_BASE_URL?.replace('/api', '')}/${currentCategory.image}`}
                  alt="Current"
                  className="mt-2 rounded"
                  style={{ maxHeight: '120px' }}
                />
              )}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => setVisible(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                {isEditing ? 'Update' : 'Save'}
              </CButton>
            </div>
          </CForm>
        </COffcanvasBody>
      </COffcanvas>

      <COffcanvas
        placement="end"
        visible={viewVisible}
        onHide={() => setViewVisible(false)}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>View Category</COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Category Name (English)</h6>
            <p className="fs-5">{currentCategory.title}</p>
          </div>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Category Name (Arabic)</h6>
            <p className="fs-5" dir="rtl">
              {currentCategory.title_ar}
            </p>
          </div>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Slug</h6>
            <p className="fs-5">{currentCategory.slug}</p>
          </div>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Status</h6>
            <span
              className={`badge ${currentCategory.status === 'coming_soon' ? 'bg-warning text-dark' : 'bg-success'}`}
            >
              {currentCategory.status === 'coming_soon' ? 'Coming Soon' : 'Active'}
            </span>
          </div>
          {currentCategory.image && (
            <div className="mb-4">
              <h6 className="text-muted mb-2">Image</h6>
              <img
                src={`${process.env.REACT_APP_BASE_URL?.replace('/api', '')}/${currentCategory.image}`}
                alt="Category"
                className="rounded"
                style={{ maxHeight: '160px' }}
              />
            </div>
          )}
          <div className="mb-4">
            <h6 className="text-muted mb-2">Created At</h6>
            <p className="fs-5">
              {new Date(currentCategory.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Last Updated</h6>
            <p className="fs-5">
              {new Date(currentCategory.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <CButton color="secondary" onClick={() => setViewVisible(false)}>
              Close
            </CButton>
            {hasWritePermission && (
              <CButton
                color="warning"
                onClick={() => {
                  setViewVisible(false)
                  handleEdit(currentCategory)
                }}
              >
                Edit
              </CButton>
            )}
          </div>
        </COffcanvasBody>
      </COffcanvas>

      <ConfirmDeleteModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={
          categoryToDelete?.translations?.en?.title || categoryToDelete?.title
        }
        itemType="category"
      />
    </>
  )
}

export default CourseCategory
