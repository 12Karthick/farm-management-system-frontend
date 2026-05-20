import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ConfigurationPage from '../pages/Configuration/ConfigurationPage';
import PlaceholderPage from '../pages/PlaceholderPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <MainLayout organizationName="AgriTech Solutions" farmName="Green Valley Farm">
        <DashboardPage />
      </MainLayout>
    ),
  },
  {
    path: '/personnel',
    element: (
      <MainLayout organizationName="AgriTech Solutions" farmName="Green Valley Farm">
        <PlaceholderPage title="Personnel" description="Manage farm workers, admins, and support staff." />
      </MainLayout>
    ),
  },
  {
    path: '/areas',
    element: (
      <MainLayout organizationName="AgriTech Solutions" farmName="Green Valley Farm">
        <PlaceholderPage title="Areas" description="Configure and manage farm geographic areas and zones." />
      </MainLayout>
    ),
  },
  {
    path: '/function-groups',
    element: (
      <MainLayout organizationName="AgriTech Solutions" farmName="Green Valley Farm">
        <PlaceholderPage title="Function Groups" description="Define and manage functional groups for farm operations." />
      </MainLayout>
    ),
  },
  {
    path: '/configuration',
    element: (
      <MainLayout organizationName="AgriTech Solutions" farmName="Green Valley Farm">
        <ConfigurationPage />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
