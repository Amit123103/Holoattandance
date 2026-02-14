import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegistrationPage from './pages/RegistrationPage'
import AttendancePage from './pages/AttendancePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import SplashScreen from './components/SplashScreen'

import CommandPalette from './components/CommandPalette'
import TourGuide from './components/TourGuide'
import { ThemeProvider } from './context/ThemeContext'
import { NetworkProvider } from './context/NetworkContext'

import HelpPage from './pages/HelpPage'
import { LiveProvider } from './context/LiveContext'

import { useAutoLogout } from './hooks/useAutoLogout';
import { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  useAutoLogout();

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <ThemeProvider>
      <NetworkProvider>
        <LiveProvider>
          <div className="min-h-screen">
            <CommandPalette />
            <TourGuide />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </LiveProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
