import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/app/AppShell";
import { useAuth } from "../contexts/AuthContext";
import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { DashboardPage } from "../pages/app/DashboardPage";
import { CreateVisualizationPage } from "../pages/app/CreateVisualizationPage";
import { ProjectsPage } from "../pages/app/ProjectsPage";
import { ProjectDetailPage } from "../pages/app/ProjectDetailPage";
import { CatalogPage } from "../pages/app/CatalogPage";
import { CustomersPage } from "../pages/app/CustomersPage";
import { QuotationsPage } from "../pages/app/QuotationsPage";
import { SettingsPage } from "../pages/app/SettingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-ivory text-muted">Đang tải dữ liệu...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/app" element={<Protected />}>
        <Route index element={<DashboardPage />} />
        <Route path="create" element={<CreateVisualizationPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
