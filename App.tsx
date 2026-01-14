
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import RegisterPlayPage from './pages/RegisterPlayPage';
import RegisterMatchPage from './pages/RegisterMatchPage';
import DailyResultsPage from './pages/DailyResultsPage';
import DashboardPage from './pages/DashboardPage';
import TeamSetupPage from './pages/TeamSetupPage';
import PlayerCheckInPage from './pages/PlayerCheckInPage';
import UserManagementPage from './pages/UserManagementPage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/LoginPage';
import ToastContainer from './components/feedback/ToastContainer';
import { ToastMessage, ToastType, Routine } from './types';
import { getCurrentUser, hasPermission } from './services/authService';

// Componente para proteção de rotas
// Fixed: Changed children to be optional in the type definition to resolve TypeScript errors
// where children were not being correctly identified as present in some build environments.
const ProtectedRoute = ({ children, routine }: { children?: React.ReactNode, routine: Routine }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(user, routine)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const addToast = useCallback((text: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLoginUpdate = () => {
    setCurrentUser(getCurrentUser());
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage onToast={addToast} onLogin={handleLoginUpdate} />} 
        />
        
        <Route path="/" element={
          currentUser ? (
            <Navigate to="/checkin" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route 
          path="/checkin" 
          element={
            <ProtectedRoute routine="checkin">
              <MainLayout><PlayerCheckInPage onToast={addToast} /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/registro/escalacao" 
          element={
            <ProtectedRoute routine="escalacao">
              <MainLayout><TeamSetupPage onToast={addToast} /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/registro/jogadas" 
          element={
            <ProtectedRoute routine="jogadas">
              <MainLayout><RegisterPlayPage onToast={addToast} /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/registro/partidas" 
          element={
            <ProtectedRoute routine="partidas">
              <MainLayout><RegisterMatchPage onToast={addToast} /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resultados" 
          element={
            <ProtectedRoute routine="resultados">
              <MainLayout><DailyResultsPage /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute routine="dashboard">
              <MainLayout><DashboardPage /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/usuarios" 
          element={
            <ProtectedRoute routine="usuarios">
              <MainLayout><UserManagementPage onToast={addToast} /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ajuda" 
          element={
            <ProtectedRoute routine="ajuda">
              <MainLayout><HelpPage /></MainLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer messages={toasts} onRemove={removeToast} />
    </HashRouter>
  );
};

export default App;
