import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilBook,
  cilHome,
  cilPeople,
  cilSettings,
  cilDescription,
  cilCreditCard,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Function to get nav items based on role
const getNavItems = (role) => {
  const items = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
      component: CNavGroup,
      name: 'Content Management',
      icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Hero Section',
          to: '/content/hero',
        },
        {
          component: CNavItem,
          name: 'Join Us',
          to: '/content/join-us',
        },
        {
          component: CNavItem,
          name: 'Trending Course',
          to: '/content/trending',
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Expert Applications',
      to: '/expert-applications',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Subscription Plans',
      to: '/plans',
      icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    },
    {
      component: CNavGroup,
      name: 'Course Management',
      icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Course Categories',
          to: '/course-categories',
        },
        {
          component: CNavItem,
          name: 'Courses',
          to: '/courses',
        },
        {
          component: CNavItem,
          name: 'Instructors',
          to: '/instructors',
        },
      ],
    },
  ]

  // Only show Admin Management and User Management for super_admin
  if (role === 'super_admin') {
    items.push({
      component: CNavGroup,
      name: 'Admin Management',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Admin Users',
          to: '/admin-management',
        },
      ],
    })

    items.push({
      component: CNavGroup,
      name: 'User Management',
      icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Users',
          to: '/users',
        },
      ],
    })
  }

  return items
}

export default getNavItems
