import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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

function AdminWrapper() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/page/:slug" element={<PublicPostPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin routes with AdminLayout — lazy-loaded */}
          <Route element={<AdminWrapper />}>
            <Route
              path="/admin/posts"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <PostsPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/posts/create"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <EditPostPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/posts/edit/:id"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <EditPostPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <ActivityLogPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <UsersPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-32 text-gray-400">
                      Завантаження...
                    </div>
                  }
                >
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
