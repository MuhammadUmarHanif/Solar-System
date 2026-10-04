import React from 'react';
import './Footer.css';

export default function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="clean-footer">
      <div className="footer-top-accent" />
      <div className="clean-footer-inner">
        {/* Brand & Mission Column */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <span className="footer-solar-icon">☀️</span>
            <span className="footer-brand-title"><span className="brand-highlight">Orbit</span></span>
            <span className="footer-pak-badge">Pakistan</span>
          </div>
          <p className="footer-brand-desc">
            Pakistan’s verified solar sizing engine, live hardware price benchmarks, and turnkey installer directory. Helping homeowners and industries transition to affordable clean energy.
          </p>
          <div className="footer-live-status">
            <span className="status-dot-pulse" />
            <span>NEPRA Tariffs & Daily Wholesale Rates Active</span>
          </div>
        </div>

        {/* Quick Tools Column */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Solar Tools</h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" onClick={() => scrollToSection('calculator')}>
                ⚡ System Size Calculator
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToSection('calculator')}>
                📋 Turnkey Cost Breakdown
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToSection('tracker')}>
                📈 Live Hardware Price Tracker
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToSection('chatbot')}>
                🤖 Solar AI Assistant
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToSection('faq')}>
                ❓ Net Metering & LESCO FAQs
              </button>
            </li>
          </ul>
        </div>

        {/* Supported Cities Column */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Major Service Areas</h4>
          <ul className="footer-links-list footer-cities-grid">
            <li><span>📍 Lahore</span></li>
            <li><span>📍 Islamabad / RWP</span></li>
            <li><span>📍 Karachi</span></li>
            <li><span>📍 Faisalabad</span></li>
            <li><span>📍 Multan</span></li>
            <li><span>📍 Peshawar</span></li>
            <li><span>📍 Gujranwala</span></li>
            <li><span>📍 Quetta</span></li>
          </ul>
        </div>

        {/* Standards & Trust Column */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Quality Standards</h4>
          <div className="footer-standards-list">
            <div className="standard-item">
              <span className="standard-icon">🛡️</span>
              <div>
                <strong>Tier-1 Bloomberg NEF</strong>
                <p>Jinko, Longi, Canadian Solar & JA Solar</p>
              </div>
            </div>
            <div className="standard-item">
              <span className="standard-icon">📜</span>
              <div>
                <strong>PEC Licensed Installers</strong>
                <p>Verified C-4 & C-5 Pakistan Engineering Council vendors</p>
              </div>
            </div>
            <div className="standard-item">
              <span className="standard-icon">⚡</span>
              <div>
                <strong>AEDB & NEPRA Certified</strong>
                <p>Compliant three-phase grid-tied net metering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Disclaimer & Back to Top */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-copy-text">
            © {new Date().getFullYear()} <strong>Orbit Pakistan</strong>. All rights reserved. Rates are indicative wholesale benchmarks updated regularly.
          </div>
          <div className="footer-bottom-actions">
            <button
              type="button"
              className="footer-top-btn"
              onClick={scrollToTop}
              title="Scroll back to top"
            >
              <span>Back to Top</span>
              <span className="arrow-up-icon">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
