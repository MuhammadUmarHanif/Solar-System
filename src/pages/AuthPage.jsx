import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import {
  IconZap,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconKey,
  IconCheck,
  IconArrowLeft,
  IconShield
} from '../components/Icons';
import './AuthPage.css';

export default function AuthPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      router.navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const quickDemoLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setError('');
    setJustAutoFilled(true);
    setTimeout(() => setJustAutoFilled(false), 2400);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow auth-glow-1" />
      <div className="auth-ambient-glow auth-glow-2" />

      <div className="auth-card">
        {/* Top Brand Tag */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <span className="auth-live-dot" />
            <IconZap size={13} className="auth-badge-icon" />
            <span>ORBIT SOLAR • ADMIN PORTAL</span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to manage company inventory, calculator rates, and customer booking leads.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="auth-alert error">
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Quick Pill */}
        <div className="demo-credentials-card">
          <div className="demo-card-top">
            <div className="demo-card-left">
              <IconKey size={14} className="demo-key-icon" />
              <span>Quick Demo Access</span>
            </div>
            {justAutoFilled && (
              <span className="demo-applied-badge">
                <IconCheck size={12} />
                <span>Autofilled!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            className={`btn-demo-autofill ${justAutoFilled ? 'is-filled' : ''}`}
            onClick={() => quickDemoLogin('admin@orbit.solar', 'admin123')}
            title="Click to automatically fill demo admin credentials"
          >
            <div className="demo-pill-content">
              <strong>Admin Account</strong>
              <code>admin@orbit.solar</code>
            </div>
            <span className="demo-pill-action">
              {justAutoFilled ? 'Applied ✓' : 'One-Click Fill →'}
            </span>
          </button>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="auth-field">
            <label htmlFor="auth-email">Email or Username</label>
            <div className="auth-input-wrapper">
              <span className="input-prefix-icon">
                <IconMail size={16} />
              </span>
              <input
                id="auth-email"
                type="text"
                required
                placeholder="admin@orbit.solar or username"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrapper">
              <span className="input-prefix-icon">
                <IconLock size={16} />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span>Sign In to Dashboard →</span>
            )}
          </button>
        </form>

        {/* Security Assurance */}
        <div className="auth-security-strip">
          <IconShield size={13} />
          <span>256-Bit SSL Encrypted Enterprise Access</span>
        </div>

        {/* Back to Live Website */}
        <div className="auth-footer">
          <button
            type="button"
            className="btn-back-home"
            onClick={() => router.navigate('/')}
          >
            <IconArrowLeft size={14} />
            <span>Return to Live Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}

