import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const quickDemoLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card glass-panel">
        
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">⚡ Orbit Solar Admin Portal</div>
          <h2 className="auth-title">
            Sign In to Company Portal
          </h2>
          <p className="auth-subtitle">
            Access inventory catalog, turnkey calculator pricing, and incoming customer booking leads.
          </p>
        </div>

        {/* Alerts */}
        {error && <div className="auth-alert error">{error}</div>}

        {/* Demo Credentials Quick Pill */}
        <div className="demo-credentials-box">
          <span className="demo-title">⚡ Quick Admin One-Click Fill:</span>
          <div className="demo-pills-row">
            <button
              type="button"
              className="demo-pill admin-pill"
              onClick={() => quickDemoLogin('admin@orbit.solar', 'admin123')}
            >
              🔑 Admin (admin@orbit.solar / admin123)
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="auth-field">
            <label>Email or Username</label>
            <input
              type="text"
              required
              placeholder="admin@orbit.solar or admin"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard →'}
          </button>
        </form>

        {/* Back to Live Website */}
        <div className="auth-footer">
          <button
            type="button"
            className="btn-back-home"
            onClick={() => router.navigate('/')}
          >
            ← Return to Live Website
          </button>
        </div>

      </div>
    </div>
  );
}
