import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Loading } from './components/common/Loading';
import { ROUTES } from './routes/RouteConstants';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HCPListPage = lazy(() => import('./pages/HCPListPage'));
const HCPDetailsPage = lazy(() => import('./pages/HCPDetailsPage'));
const LogInteractionPage = lazy(() => import('./pages/LogInteractionPage'));
const InteractionHistoryPage = lazy(() => import('./pages/InteractionHistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const App = () => {
  return (
    <>
      <Suspense fallback={<Loading fullScreen message="Loading page..." />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes with MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - Default route */}
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            
            {/* Main Pages */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.HCPS} element={<HCPListPage />} />
            <Route path={ROUTES.HCP_DETAILS} element={<HCPDetailsPage />} />
            
            {/* ============================================
                FIX: Remove InteractionsPage - use LogInteractionPage instead
                ============================================ */}
            <Route path={ROUTES.INTERACTIONS} element={<Navigate to={ROUTES.INTERACTION_NEW} replace />} />
            <Route path={ROUTES.INTERACTION_NEW} element={<LogInteractionPage />} />
            <Route path={ROUTES.INTERACTION_HISTORY} element={<InteractionHistoryPage />} />
            
            {/* Other Pages */}
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.CHAT} element={<ChatPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>

          {/* 404 - Redirect to Dashboard */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;