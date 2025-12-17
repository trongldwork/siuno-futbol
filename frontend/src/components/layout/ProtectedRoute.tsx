import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from './Navbar';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'SuperAdmin';
  requireTeamRole?: 'Leader' | 'Treasurer';
}

export function ProtectedRoute({ children, requireRole, requireTeamRole }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user, currentTeam } = useAuthStore();

  // Wait for auth to be initialized
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check SuperAdmin role
  if (requireRole === 'SuperAdmin' && user?.role !== 'SuperAdmin') {
    return <Navigate to="/" replace />;
  }

  // Check team role
  if (requireTeamRole) {
    if (!currentTeam) {
      return <Navigate to="/teams" replace />;
    }

    if (requireTeamRole === 'Leader' && currentTeam.role !== 'Leader') {
      return <Navigate to="/" replace />;
    }

    if (requireTeamRole === 'Treasurer' && 
        currentTeam.role !== 'Treasurer' && 
        currentTeam.role !== 'Leader') {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
}
