import React, { useState } from 'react';
import './Footer.css';
import { useSupplier } from '../context/SupplierContext';

export default function Footer() {
  const { activeSupplier } = useSupplier() || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const companyName = activeSupplier?.name || 'ORBIT';

  return (
    <footer className="techexa-style-footer">
      <div className="techexa-footer-container">
        {/* Top Brand Logo Bar */}
        <div className="techexa-top-brand">
          <div className="techexa-logo-wrap" onClick={() => scrollToSection('top')}>
            <svg className="techexa-logo-icon" viewBox="0 0 27 17" fill="none">
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#00d2ff" strokeWidth="1.4" />
              <circle cx="13.25" cy="8.4" r="8.2" fill="#00d2ff" />
              <circle cx="13.25" cy="8.4" r="7.5" fill="#080c14" />
              <circle cx="13.25" cy="8.4" r="5" fill="#00d2ff" />
            </svg>
            <span className="techexa-brand-name">{companyName.toUpperCase()}</span>
          </div>
        </div>

        {/* 3-Column Navigation & Subscription Grid */}
        <div className="techexa-nav-grid">
          {/* Column 1: Services / Navigation */}
          <div className="techexa-nav-col">
            <h4 className="techexa-col-heading">SERVICES</h4>
            <ul className="techexa-links-list">
              <li>
                <button type="button" onClick={() => scrollToSection('calculator')}>
                  Solar Sizing & Calculator
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('tracker')}>
                  Live Hardware Price Tracker <span className="techexa-badge-blue">Live</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('calculator')}>
                  Turnkey BOM Cost Breakdown
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('chatbot')}>
                  Orbit AI Solar Advisor <span className="techexa-badge-blue">New</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('calculator')}>
                  Tier-1 Solar Plate Sizing
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('faq')}>
                  DISCO Net Metering Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="techexa-nav-col">
            <h4 className="techexa-col-heading">COMPANY</h4>
            <ul className="techexa-links-list">
              <li>
                <button type="button" onClick={() => scrollToSection('top')}>
                  About Orbit
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('calculator')}>
                  Why Orbit Solar
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('tracker')}>
                  Verified Market Benchmarks
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('faq')}>
                  AEDB & NEPRA Standards
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('top')}>
                  Careers <span className="techexa-badge-green">Hiring</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('faq')}>
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Subscribe & Social */}
          <div className="techexa-sub-col">
            <h4 className="techexa-col-heading">SUBSCRIBE FOR UPDATES</h4>
            <form className="techexa-sub-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                className="techexa-email-input"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="techexa-sub-btn">
                {subscribed ? '✓ Subscribed' : 'Subscribe'}
              </button>
            </form>
            <p className="techexa-sub-disclaimer">
              Get verified hardware rates, NEPRA tariff updates, and solar market intelligence delivered to your inbox.
            </p>

            <div className="techexa-social-block">
              <span className="techexa-col-heading techexa-social-heading">FIND US ON</span>
              <div className="techexa-social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="techexa-social-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="techexa-social-btn" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="techexa-social-btn" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="techexa-social-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Giant Brand Typographic Showcase (Exact Techexa Style) */}
        <div className="techexa-giant-wordmark-wrap">
          <span className="techexa-giant-text">{companyName.toUpperCase()}</span>
        </div>

        {/* Bottom Legal Bar */}
        <div className="techexa-bottom-bar">
          <div className="techexa-copyright">
            © {new Date().getFullYear()} {companyName} Pvt. Ltd. All rights reserved.
          </div>
          <div className="techexa-legal-links">
            <button type="button" onClick={() => scrollToSection('faq')}>Privacy Policy</button>
            <button type="button" onClick={() => scrollToSection('faq')}>Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
