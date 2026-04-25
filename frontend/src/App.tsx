import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicPostPage from './pages/PublicPostPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import NotFoundPage from './pages/NotFoundPage';

const PostsPage = lazy(() => import('./pages/admin/PostsPage'));
const EditPostPage = lazy(() => import('./pages/admin/EditPostPage'));
const ActivityLogPage = lazy(() => import('./pages/admin/ActivityLogPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

const loadingFallback = (
  <div className="flex items-center justify-center py-32 text-gray-400">Завантаження...</div>
);

function AdminWrapper() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/page/:slug', element: <PublicPostPage /> },
  { path: '/admin/login', element: <LoginPage /> },
  {
    element: <AdminWrapper />,
    children: [
      {
        path: '/admin/posts',
        element: (
          <Suspense fallback={loadingFallback}>
            <PostsPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/posts/create',
        element: (
          <Suspense fallback={loadingFallback}>
            <EditPostPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/posts/edit/:id',
        element: (
          <Suspense fallback={loadingFallback}>
            <EditPostPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/logs',
        element: (
          <Suspense fallback={loadingFallback}>
            <ActivityLogPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <Suspense fallback={loadingFallback}>
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/settings',
        element: (
          <Suspense fallback={loadingFallback}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
