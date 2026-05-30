import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, profile, profileLoading } = useAuth();
  const location = useLocation();

  // Wait for auth to resolve
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for profile to finish loading before making role decisions
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user profile is missing, they need to onboard first on the Auth page
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Role-based access control (only when allowedRoles is specified)
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to their default landing page (avoid redirect loops)
    if (profile.role === 'admin' && location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.role !== 'admin' && location.pathname !== '/') {
      return <Navigate to="/" replace />;
    }
    // If we'd redirect to the same page, just render children to prevent loop
    return <>{children}</>;
  }

  return <>{children}</>;
}
