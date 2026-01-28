import React from 'react'
import ProtectedWriteAction from './components/common/ProtectedWriteAction'
import { UserList, UserDetail } from './layout/UserManagement'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// content management
const HeroSection = React.lazy(() => import('./layout/Content/HeroSection'))
const JoinUs = React.lazy(() => import('./layout/Content/JoinUs'))
const TrendingCourse = React.lazy(() => import('./layout/Content/TrendingCourse'))

// expert applications
const ExpertApplications = React.lazy(() => import('./layout/ExpertApplications/ExpertApplications'))

// plans
const Plans = React.lazy(() => import('./layout/Plans/Plans'))
const PlanForm = React.lazy(() => import('./layout/Plans/PlanForm'))

// courses
const CourseCategories = React.lazy(
  () => import('./layout/Courses/CourseCategory'),
)
const Courses = React.lazy(() => import('./layout/Courses/Course'))
const CoursePageForm = React.lazy(
  () => import('./layout/Courses/Pages/CoursePageForm'),
)
// instructors
const Instructors = React.lazy(() => import('./layout/Instructors/Instructor'))
const InstructorFormPage = React.lazy(
  () => import('./layout/Instructors/pages/InstructorFormPage'),
)

import { AdminList, AdminForm } from './layout/AdminManagement'

const ProtectedCourseForm = (props) => (
  <ProtectedWriteAction resourceType="courses">
    <CoursePageForm {...props} />
  </ProtectedWriteAction>
)

const ProtectedInstructorForm = (props) => (
  <ProtectedWriteAction resourceType="courses">
    <InstructorFormPage {...props} />
  </ProtectedWriteAction>
)

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  // content management
  {
    path: '/content/hero',
    name: 'Hero Section',
    element: HeroSection,
  },
  {
    path: '/content/join-us',
    name: 'Join Us',
    element: JoinUs,
  },
  {
    path: '/content/trending',
    name: 'Trending Course',
    element: TrendingCourse,
  },
  // expert applications
  {
    path: '/expert-applications',
    name: 'Expert Applications',
    element: ExpertApplications,
  },
  // plans
  {
    path: '/plans',
    name: 'Subscription Plans',
    element: Plans,
  },
  {
    path: '/plans/new',
    name: 'Create Plan',
    element: PlanForm,
  },
  {
    path: '/plans/edit/:id',
    name: 'Edit Plan',
    element: PlanForm,
  },
  // courses
  {
    path: '/course-categories',
    name: 'Course Categories',
    element: CourseCategories,
  },
  {
    path: '/courses',
    name: 'Courses',
    element: Courses,
  },
  {
    path: '/courses/new',
    name: 'Add New Course',
    element: ProtectedCourseForm,
  },
  {
    path: '/courses/:slug/edit',
    name: 'Edit Course',
    element: ProtectedCourseForm,
  },
  // instructors
  {
    path: '/instructors',
    name: 'Instructors',
    element: Instructors,
  },
  {
    path: '/instructors/new',
    name: 'Add New Instructor',
    element: ProtectedInstructorForm,
  },
  {
    path: '/instructors/:slug/edit',
    name: 'Edit Instructor',
    element: ProtectedInstructorForm,
  },
  {
    path: '/admin-management',
    name: 'Admin Management',
    element: AdminList,
  },
  {
    path: '/admin-management/new',
    name: 'Add New Admin',
    element: AdminForm,
  },
  {
    path: '/admin-management/:id/edit',
    name: 'Edit Admin',
    element: AdminForm,
  },
  {
    path: '/users',
    name: 'User Management',
    element: UserList,
  },
  {
    path: '/users/:id/view',
    name: 'User Details',
    element: UserDetail,
  },
]

export default routes
