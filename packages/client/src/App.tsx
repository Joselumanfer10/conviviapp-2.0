import { Routes, Route } from 'react-router-dom';
import { useInitAuth } from '@/features/auth';
import { ProtectedRoute, PublicRoute } from '@/components/layout';
import { useSocket } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { PWAUpdatePrompt } from '@/components/ui/pwa-update-prompt';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  NotFoundPage,
  CreateHomePage,
  JoinHomePage,
  HomeDashboardPage,
  ExpensesPage,
  TasksPage,
  ShoppingPage,
  AnnouncementsPage,
  CalendarPage,
  ReservationsPage,
  RulesPage,
  ReportsPage,
  NotificationsPage,
  HomeSettingsPage,
} from '@/pages';

function App() {
  // Inicializar autenticación al cargar la app
  useInitAuth();

  // Conectar socket cuando el usuario está autenticado
  const { isConnected } = useSocket();

  // Inicializar tema (light/dark/system)
  useTheme();

  return (
    <div className="min-h-screen bg-background">
      <ConnectionStatus isConnected={isConnected} className="fixed top-2 right-2 z-50" />
      <PWAUpdatePrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/create"
          element={
            <ProtectedRoute>
              <CreateHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/join"
          element={
            <ProtectedRoute>
              <JoinHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId"
          element={
            <ProtectedRoute>
              <HomeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/settings"
          element={
            <ProtectedRoute>
              <HomeSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/shopping"
          element={
            <ProtectedRoute>
              <ShoppingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homes/:homeId/rules"
          element={
            <ProtectedRoute>
              <RulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
