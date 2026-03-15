import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicPostPage from './pages/PublicPostPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/admin/LoginPage';
import PostsPage from './pages/admin/PostsPage';
import EditPostPage from './pages/admin/EditPostPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import UsersPage from './pages/admin/UsersPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import NotFoundPage from './pages/NotFoundPage';

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
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/page/:slug" element={<PublicPostPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin routes with AdminLayout */}
        <Route element={<AdminWrapper />}>
          <Route path="/admin/posts" element={<PostsPage />} />
          <Route path="/admin/posts/create" element={<EditPostPage />} />
          <Route path="/admin/posts/edit/:id" element={<EditPostPage />} />
          <Route path="/admin/logs" element={<ActivityLogPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
