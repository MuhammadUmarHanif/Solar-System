import React, { useEffect, useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';

const CURRENT_USER_KEY = 'mySolarCurrentUser';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleHashChange = () => setIsMenuOpen(false);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') setCurrentUser(parsed);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const links = [
    { label: 'Overview', href: '#top' },
    { label: 'Solar Calculator', href: '#calculator' },
    { label: 'Price Tracker', href: '#tracker' },
    { label: 'AI Assistant', href: '#chatbot' },
    { label: 'FAQ', href: '#faq' },
  ];

  const openAuth = (mode) => {
    setIsMenuOpen(false);
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => setIsAuthOpen(false);

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#top" aria-label="Solar Guidance System">
          <div className="solar-system-logo">
            <div className="sun"></div>
            <div className="orbit orbit-mercury"><div className="planet mercury"></div></div>
            <div className="orbit orbit-venus"><div className="planet venus"></div></div>
            <div className="orbit orbit-earth">
              <div className="planet earth">
                <div className="moon-orbit"><div className="moon"></div></div>
              </div>
            </div>
          </div>
          <span className="brand__text">Solar System Guide</span>
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className="nav-toggle__icon" aria-hidden="true">
            {isMenuOpen ? '✕' : '☰'}
          </span>
        </button>

        <nav className={`site-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Primary">
          <ul className="site-nav__list">
            {links.map((link) => (
              <li key={link.href} className="site-nav__item">
                <a className="site-nav__link" href={link.href} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="site-nav__actions">
            {currentUser ? (
              <>
                <span className="site-nav__user" title={currentUser.email}>
                  {currentUser.name}
                </span>
                <button type="button" className="site-nav__logout" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className="site-nav__cta" onClick={() => openAuth('login')}>
                  Login
                </button>
                <button
                  type="button"
                  className="site-nav__authSecondary"
                  onClick={() => openAuth('signup')}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={closeAuth}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </header>
  );
};

export default Header;
