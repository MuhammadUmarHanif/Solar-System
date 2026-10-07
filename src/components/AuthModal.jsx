import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TiltContainer } from './TiltContainer';
import './AuthModal.css';
import { useAuth } from '../context/AuthContext';

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

// Mini 3D Solar Hologram Scene for the logo
const MiniGlobeScene = () => {
  const sunRef = useRef();
  const planetRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.015;
      sunRef.current.rotation.x += 0.005;
    }
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(t * 1.5) * 0.95;
      planetRef.current.position.z = Math.sin(t * 1.5) * 0.95;
      planetRef.current.rotation.y += 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2.5} color="#ffffff" />
      
      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial 
          color="#ff9f0a" 
          emissive="#ff3b30"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Orbit Trail */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[0.93, 0.97, 64]} />
        <meshBasicMaterial color="#13ffaa" opacity={0.25} transparent side={THREE.DoubleSide} />
      </mesh>
      
      {/* Orbiting Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#13ffaa" 
          emissive="#005533" 
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
    </>
  );
};

const MiniSolarGlobe = () => {
  return (
    <div className="auth-modal__3d-logo">
      <Canvas camera={{ position: [0, 0, 2.0], fov: 45 }}>
        <MiniGlobeScene />
      </Canvas>
    </div>
  );
};

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

  const authCtx = useAuth();

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');

    const email = loginEmail.trim().toLowerCase();
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (loginPassword.length < 6) return setError('Password must be at least 6 characters.');

    // 1. Try company admin login first
    if (authCtx && authCtx.login) {
      try {
        const res = await authCtx.login(email, loginPassword);
        if (res && res.user) {
          writeCurrentUser(res.user);
          onAuthSuccess(res.user);
          onClose();
          return;
        }
      } catch (err) {
        // Continue to check local users
      }
    }

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

      {/* Tilt Container wrapper for 3D card tilt interaction */}
      <TiltContainer className="auth-modal__tilt" intensity={8} style={{ transformStyle: 'preserve-3d' }}>
        <div className={`auth-modal__card ${mode === 'signup' ? 'is-flipped' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          
          {/* ==================== FRONT SIDE: LOGIN ==================== */}
          <div className="auth-modal__side auth-modal__front" role="document" style={{ transformStyle: 'preserve-3d' }}>
            <div className="auth-modal__top-gradient" />
            
            <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="auth-modal__header" style={{ transform: 'translateZ(30px)' }}>
              <div className="auth-modal__heading">
                <MiniSolarGlobe />
                <h3 className="auth-modal__title">Login</h3>
                <p className="auth-modal__subtitle">
                  Welcome back. Continue your planning.
                </p>
              </div>
            </div>

            <div className="auth-modal__tabs" role="tablist" aria-label="Login and signup" style={{ transform: 'translateZ(20px)' }}>
              <button
                type="button"
                role="tab"
                aria-selected={true}
                className="auth-modal__tab is-active"
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={false}
                className="auth-modal__tab"
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>

            {error && mode === 'login' ? (
              <div className="auth-modal__error" style={{ transform: 'translateZ(25px)' }}>{error}</div>
            ) : null}

            <form className="auth-modal__form" onSubmit={submitLogin} style={{ transform: 'translateZ(15px)' }}>
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

              <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                🔑 Company Admin: <strong style={{ color: '#13ffaa' }}>admin@orbit.solar</strong> / <strong style={{ color: '#13ffaa' }}>admin123</strong>
              </div>
            </form>
          </div>

          {/* ==================== BACK SIDE: SIGN UP ==================== */}
          <div className="auth-modal__side auth-modal__back" role="document" style={{ transformStyle: 'preserve-3d' }}>
            <div className="auth-modal__top-gradient" />

            <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="auth-modal__header" style={{ transform: 'translateZ(30px)' }}>
              <div className="auth-modal__heading">
                <MiniSolarGlobe />
                <h3 className="auth-modal__title">Create account</h3>
                <p className="auth-modal__subtitle">
                  Sign up to save your session locally.
                </p>
              </div>
            </div>

            <div className="auth-modal__tabs" role="tablist" aria-label="Login and signup" style={{ transform: 'translateZ(20px)' }}>
              <button
                type="button"
                role="tab"
                aria-selected={false}
                className="auth-modal__tab"
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={true}
                className="auth-modal__tab is-active"
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>

            {error && mode === 'signup' ? (
              <div className="auth-modal__error" style={{ transform: 'translateZ(25px)' }}>{error}</div>
            ) : null}

            <form className="auth-modal__form" onSubmit={submitSignup} style={{ transform: 'translateZ(15px)' }}>
              <div className="auth-modal__scrollable-fields">
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
              </div>

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
          </div>

        </div>
      </TiltContainer>
    </div>
  );
};

export default AuthModal;