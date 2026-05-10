import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/providers/ErrorBoundary';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicPostPage from './pages/PublicPostPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
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
  { path: '/page/:slug', element: <PublicPostPage /> },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: '', element: <HomePage />, handle: { transparentHeader: true } },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminWrapper />,
    children: [
      {
        path: 'posts',
        element: (
          <Suspense fallback={loadingFallback}>
            <PostsPage />
          </Suspense>
        ),
      },
      {
        path: 'posts/create',
        element: (
          <Suspense fallback={loadingFallback}>
            <EditPostPage />
          </Suspense>
        ),
      },
      {
        path: 'posts/edit/:id',
        element: (
          <Suspense fallback={loadingFallback}>
            <EditPostPage />
          </Suspense>
        ),
      },
      {
        path: 'logs',
        element: (
          <Suspense fallback={loadingFallback}>
            <ActivityLogPage />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={loadingFallback}>
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={loadingFallback}>
            <SettingsPage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
