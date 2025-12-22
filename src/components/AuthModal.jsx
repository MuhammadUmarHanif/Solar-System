import React, { useEffect, useMemo, useState } from 'react';
import './AuthModal.css';

const USERS_KEY = 'mySolarUsers';
const CURRENT_USER_KEY = 'mySolarCurrentUser';

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const writeCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const AuthModal = ({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const headerText = useMemo(() => {
    return mode === 'login' ? 'Login' : 'Create account';
  }, [mode]);

  const submitLogin = (event) => {
    event.preventDefault();
    setError('');

    const email = loginEmail.trim().toLowerCase();
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (loginPassword.length < 6) return setError('Password must be at least 6 characters.');

    const users = readUsers();
    const user = users[email];
    if (!user || user.password !== loginPassword) return setError('Invalid email or password.');

    const currentUser = { name: user.name, email: user.email };
    writeCurrentUser(currentUser);
    onAuthSuccess(currentUser);
    onClose();
  };

  const submitSignup = (event) => {
    event.preventDefault();
    setError('');

    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();

    if (name.length < 2) return setError('Enter your name.');
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (signupPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (signupPassword !== signupConfirm) return setError('Passwords do not match.');

    const users = readUsers();
    if (users[email]) return setError('An account with this email already exists.');

    users[email] = { name, email, password: signupPassword };
    writeUsers(users);

    const currentUser = { name, email };
    writeCurrentUser(currentUser);
    onAuthSuccess(currentUser);
    onClose();
  };

  const switchMode = (nextMode) => {
    setError('');
    setMode(nextMode);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Authentication">
      <div className="auth-modal__backdrop" onMouseDown={onClose} />

      <div className="auth-modal__panel" role="document">
        <div className="auth-modal__top" />

        <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="auth-modal__header">
          <div className="auth-modal__heading">
            <span className="auth-modal__mark" aria-hidden="true">
              ☀
            </span>
            <h3 className="auth-modal__title">{headerText}</h3>
            <p className="auth-modal__subtitle">
              {mode === 'login' ? 'Welcome back. Continue your planning.' : 'Sign up to save your session locally.'}
            </p>
          </div>
        </div>

        <div className="auth-modal__tabs" role="tablist" aria-label="Login and signup">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-modal__tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-modal__tab ${mode === 'signup' ? 'is-active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        {error ? <div className="auth-modal__error">{error}</div> : null}

        {mode === 'login' ? (
          <form className="auth-modal__form" onSubmit={submitLogin}>
            <label className="auth-field">
              <span className="auth-field__label">Email</span>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="auth-field__input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Password</span>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="auth-field__input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button type="submit" className="auth-modal__submit">
              Login
            </button>

            <p className="auth-modal__hint">
              Don’t have an account?{' '}
              <button type="button" className="auth-modal__link" onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-modal__form" onSubmit={submitSignup}>
            <label className="auth-field">
              <span className="auth-field__label">Name</span>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="auth-field__input"
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Email</span>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="auth-field__input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Password</span>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="auth-field__input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Confirm password</span>
              <input
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                className="auth-field__input"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </label>

            <button type="submit" className="auth-modal__submit">
              Create account
            </button>

            <p className="auth-modal__hint">
              Already have an account?{' '}
              <button type="button" className="auth-modal__link" onClick={() => switchMode('login')}>
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;