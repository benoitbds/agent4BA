import React from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import ProjectListPage from '../pages/ProjectListPage'
import ProjectDetail from '../pages/ProjectDetail'

export const routeConfig: RouteObject[] = [
  {
    index: true,
    element: React.createElement(Navigate, { to: '/projects', replace: true }),
  },
  { path: '/projects', element: React.createElement(ProjectListPage) },
  { path: '/projects/:id', element: React.createElement(ProjectDetail) },
]

