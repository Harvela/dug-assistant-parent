import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loadSession } from '../lib/auth/session';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const session = loadSession();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
