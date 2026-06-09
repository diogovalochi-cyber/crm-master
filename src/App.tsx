import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import './index.css'

function AppRouter() {
  const { isAuthenticated, isLoading, currentUser, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #100609 0%, #20050b 40%, #15090f 75%, #080608 100%)' }}>
        <span className="w-8 h-8 border-2 border-wine-700/40 border-t-wine-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  const isFullAccess = hasPermission('canViewAllLeads');

  return (
    <DashboardProvider userId={currentUser.id} isFullAccess={isFullAccess}>
      <DashboardLayout activeItem={activeTab} onNavigate={setActiveTab}>
        <Dashboard activeTab={activeTab} />
      </DashboardLayout>
    </DashboardProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
