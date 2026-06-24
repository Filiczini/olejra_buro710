import { lazy, Suspense, type ComponentType } from 'react';
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

// Reload once if a lazy chunk fails to load — happens when a stale tab
// requests an asset hash that no longer exists after a deploy.
const CHUNK_RELOAD_KEY = 'chunkReloaded';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithReload<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory()
      .then((module) => {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        return module;
      })
      .catch((error) => {
        if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
          window.location.reload();
          return new Promise<{ default: T }>(() => {}); // hold render while reloading
        }
        throw error;
      })
  );
}

const PostsPage = lazyWithReload(() => import('./pages/admin/PostsPage'));
const EditPostPage = lazyWithReload(() => import('./pages/admin/EditPostPage'));
const ActivityLogPage = lazyWithReload(() => import('./pages/admin/ActivityLogPage'));
const UsersPage = lazyWithReload(() => import('./pages/admin/UsersPage'));
const SettingsPage = lazyWithReload(() => import('./pages/admin/SettingsPage'));

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
