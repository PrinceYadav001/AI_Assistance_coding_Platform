import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ProblemsPage from './pages/ProblemsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import ReviewPage from './pages/ReviewPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/admin/AdminPage';
import AdminProblemsPage from './pages/admin/AdminProblemsPage';
import AdminProblemFormPage from './pages/admin/AdminProblemFormPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin' && user?.role !== 'instructor') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#3fb950', secondary: '#161b22' } },
            error: { iconTheme: { primary: '#f85149', secondary: '#161b22' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
          <Route path="/problems" element={<ProtectedRoute><ProblemsPage /></ProtectedRoute>} />
          <Route path="/submissions" element={<ProtectedRoute><SubmissionsPage /></ProtectedRoute>} />
          <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>} />
          <Route path="/review/:id" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/problems" element={<AdminRoute><AdminProblemsPage /></AdminRoute>} />
          <Route path="/admin/problems/create" element={<AdminRoute><AdminProblemFormPage /></AdminRoute>} />
          <Route path="/admin/problems/:id/edit" element={<AdminRoute><AdminProblemFormPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
