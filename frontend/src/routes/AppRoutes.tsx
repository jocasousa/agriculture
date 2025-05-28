import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import ProducerPage from '@/pages/producer';
import type { ReactNode } from 'react';


const Private = ({ children }: { children: ReactNode }) => {
  const isAuth = useAppSelector(s => s.auth.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route path="/" element={<Private><DashboardPage/></Private>} />
    <Route path="/producer" element={<Private><ProducerPage/></Private>} />
    
    {/* fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
