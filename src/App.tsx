import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AllProjectsPage from './pages/AllProjectsPage';
import AboutPage from './pages/AboutPage';
import ProjectPage from './pages/ProjectPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import CreateProjectPage from './pages/admin/CreateProjectPage';
import EditProjectPage from './pages/admin/EditProjectPage';
import ProjectSectionsPage from './pages/admin/ProjectSectionsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

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
        <Route path="/projects" element={<AllProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin routes with AdminLayout */}
        <Route element={<AdminWrapper />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/projects/create" element={<CreateProjectPage />} />
          <Route path="/admin/projects/edit/:id" element={<EditProjectPage />} />
          <Route path="/admin/projects/:projectId/sections" element={<ProjectSectionsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/site-settings" element={<SiteSettingsPage />} />
          <Route path="/admin/logs" element={<ActivityLogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

