import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireResponsable?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireResponsable = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isResponsable } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (profile?.must_change_password) {
      setMustChangePassword(true);
    }
  }, [profile]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireResponsable && !isResponsable) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <ChangePasswordModal 
        isOpen={mustChangePassword} 
        onPasswordChanged={() => setMustChangePassword(false)} 
      />
      {children}
    </>
  );
}
