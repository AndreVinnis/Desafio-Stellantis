import { createBrowserRouter, Navigate } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import VehiclesListPage from './pages/VehiclesListPage'
import VehicleFormPage from './pages/VehicleFormPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import DealersListPage from './pages/DealersListPage'
import DealerFormPage from './pages/DealerFormPage'
import DealerDetailPage from './pages/DealerDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Navigate to="/vehicles" replace /> },
          { path: '/vehicles', element: <VehiclesListPage /> },
          { path: '/vehicles/new', element: <VehicleFormPage /> },
          { path: '/vehicles/:id', element: <VehicleDetailPage /> },
          { path: '/vehicles/:id/edit', element: <VehicleFormPage /> },
          { path: '/dealers', element: <DealersListPage /> },
          { path: '/dealers/new', element: <DealerFormPage /> },
          { path: '/dealers/:id', element: <DealerDetailPage /> },
          { path: '/dealers/:id/edit', element: <DealerFormPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
