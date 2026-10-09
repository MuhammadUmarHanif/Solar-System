import React, { useState } from 'react';
import './App.css';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SupplierProvider } from './context/SupplierContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Lightbulb from './components/Lightbulb';

// Components
import OrbitHero from './components/OrbitHero';
import SolarCalculator from './components/SolarCalculator';
import PriceTracker from './components/PriceTracker';
import AIChatbot from './components/AIChatbot';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Company Admin Dashboard & Auth
import SupplierDashboardPage from './pages/SupplierDashboardPage';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => setIsAuthModalOpen(false);

  // Dynamic Route Switcher
  let pageContent = null;

  if (router.route === 'dashboard' || router.route === 'admin') {
    // Protected Company Admin Dashboard
    if (currentUser) {
      pageContent = <SupplierDashboardPage />;
    } else {
      pageContent = <AuthPage initialMode="login" />;
    }
  } else if (router.route === 'login' || router.route === 'register') {
    // Auth login page
    pageContent = <AuthPage initialMode="login" />;
  } else {
    // Single Company Main Public Website (3D Orbit Hero + Solar Calculator + Price Tracker + AI + FAQ + Footer)
    pageContent = (
      <>
        <OrbitHero
          currentUser={currentUser}
          onOpenAuth={openAuth}
          onLogout={logout}
        />
        <main className="Main">
          <div className="Content">
            <SolarCalculator />
            <PriceTracker />
            <AIChatbot />
            <FAQ />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="App">
      {/* Dynamic Route View */}
      {pageContent}

      {/* Floating Lightbulb Theme Switcher */}
      <Lightbulb
        className="floating-theme-toggle"
        toggled={theme === 'dark'}
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      />

      {/* Auth Modal for Quick Access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={closeAuth}
        onAuthSuccess={() => closeAuth()}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <SupplierProvider>
            <AppContent />
          </SupplierProvider>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}
