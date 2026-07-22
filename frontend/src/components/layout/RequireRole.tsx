import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
}

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return null;
  }

  return <>{children}</>;
};
