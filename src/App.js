import React, { useState, useEffect } from 'react';
import './App.css';
import OrbitHero from './components/OrbitHero';
import SolarCalculator from './components/SolarCalculator';
import PriceTracker from './components/PriceTracker';
import AIChatbot from './components/AIChatbot';
import FAQ from './components/FAQ';
import AuthModal from './components/AuthModal';

const CURRENT_USER_KEY = 'mySolarCurrentUser';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') setCurrentUser(parsed);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => setIsAuthOpen(false);

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <div className="App">
      {/* 1. Orbit Hero Section (SS1 artwork + SS2 typography) */}
      <OrbitHero
        currentUser={currentUser}
        onOpenAuth={openAuth}
        onLogout={logout}
      />

      {/* 2. Core Solar Features Section (Seamless scroll down) */}
      <main className="Main">
        <div className="Content">
          <SolarCalculator />
          <PriceTracker />
          <AIChatbot />
          <FAQ />
        </div>
      </main>

      {/* 3. Deep Space Themed Footer */}
      <footer className="Footer glass-panel">
        <div className="Footer__inner">
          <span>Orbit Solar Guidance System</span>
          <span className="Footer__dot" aria-hidden="true">•</span>
          <span>Deep Space Energy Solutions</span>
          <span className="Footer__dot" aria-hidden="true">•</span>
          <span>Pakistan</span>
        </div>
      </footer>

      {/* 4. Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={closeAuth}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}

export default App;
