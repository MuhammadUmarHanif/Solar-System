import React, { useEffect, useRef, useState } from 'react';
import './OrbitHero.css';
import { useSupplier } from '../context/SupplierContext';

export const OrbitHero = ({ onOpenAuth, currentUser, onLogout }) => {
  const { activeSupplier } = useSupplier() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const lastBtnRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    setAnimClass('intro');

    let started = false;
    let cleanupTimer = null;

    const cleanup = () => {
      setAnimClass('');
    };

    const start = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimClass('intro intro-play');
          cleanupTimer = setTimeout(cleanup, 3000);
        });
      });
    };

    const fontTimer = setTimeout(start, 700);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        clearTimeout(fontTimer);
        start();
      }).catch(() => {
        clearTimeout(fontTimer);
        start();
      });
    }

    return () => {
      clearTimeout(fontTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  // CTA button animationend
  useEffect(() => {
    const btn = lastBtnRef.current;
    if (!btn) return;

    const handleAnimEnd = (e) => {
      if (e.target === btn) {
        setAnimClass('');
      }
    };

    btn.addEventListener('animationend', handleAnimEnd);
    return () => btn.removeEventListener('animationend', handleAnimEnd);
  }, []);

  // Background video playback logic
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    const play = () => {
      if (v.paused) {
        const p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => { });
        }
      }
    };

    play();
    v.addEventListener('canplay', play);

    const handleVisibility = () => {
      if (!document.hidden) play();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const unlock = () => play();
    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    window.addEventListener('scroll', unlock, { passive: true, once: true });

    return () => {
      v.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Mobile menu outside click & Escape key
  useEffect(() => {
    const handleDocClick = (e) => {
      if (rootRef.current && !e.target.closest('.bar')) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleDocClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <section id="top" ref={rootRef} className={`orbit-hero-wrapper ${animClass}`}>
      <div className="orbit-hero-frame">
        <video
          ref={videoRef}
          className="sky"
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0bf7409c-9fa2-4bef-a49d-34903dcc91ad.png"
          src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4b73c700-3112-4c07-bd48-0af2893dff7c.mp4"
        />
        <div className="veil" />

        {/* Header Bar */}
        <header className="bar" data-open={menuOpen ? 'true' : 'false'}>
          <a className="brand" href="#top" aria-label="Orbit Solar — Home">
            <svg className="brand-logo" viewBox="0 0 26.9 16.6">
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="13.25" cy="8.4" r="8.8" fill="#000" />
              <circle cx="13.25" cy="8.4" r="8.1" fill="currentColor" />
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#000" strokeWidth="0.9" strokeDasharray="28.2 28.2" />
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25" strokeDasharray="28.2 28.2" />
            </svg>
            <span className="brand-text">{activeSupplier?.name ? activeSupplier.name.split(' ')[0] : 'Orbit'}</span>
          </a>

          <nav className="links" aria-label="Primary">
            <a href="#top">Overview</a>
            <a href="#calculator">Calculator</a>
            <a href="#tracker">Price Tracker</a>
            <a href="#chatbot">AI Assistant</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="actions">
            <a className="btn solid header-cta-btn" href="#calculator">
              Get Estimate
            </a>
            {currentUser && (
              <button type="button" className="btn ghost header-auth-btn" onClick={onLogout}>
                Logout
              </button>
            )}

            <button
              className="menu"
              id="menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-sheet"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <svg viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M0 1h20M0 7h20M0 13h20" />
              </svg>
            </button>

            <nav className="sheet" id="menu-sheet" aria-label="Menu">
              <a href="#top" onClick={() => setMenuOpen(false)}>Overview</a>
              <a href="#calculator" onClick={() => setMenuOpen(false)}>Solar Calculator</a>
              <a href="#tracker" onClick={() => setMenuOpen(false)}>Price Tracker</a>
              <a href="#chatbot" onClick={() => setMenuOpen(false)}>AI Assistant</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
              {currentUser && (
                <button
                  type="button"
                  className="btn ghost"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                >
                  Logout ({currentUser.name})
                </button>
              )}
              <a
                className="btn solid"
                href="#calculator"
                onClick={() => setMenuOpen(false)}
                style={{ width: '100%', marginTop: '12px', textAlign: 'center' }}
              >
                Get Estimate
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Content Screen */}
        <div className="screen">
          <main className="hero">
            {/* Pill with SS2 text: Premium Solar Guidance */}
            <a className="pill" href="#calculator">
              <span className="chip">✨</span>
              <span className="pill-label">Premium Solar Guidance</span>
              <svg className="pill-arrow" viewBox="0 0 9.5 8" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0.7 4H8.8M5.6 0.75 8.85 4 5.6 7.25" />
              </svg>
            </a>

            {/* Headline with SS2 text: Build a smarter solar setup, faster. */}
            <h1>
              <span className="ln"><span className="ln-i">Build a smarter solar</span></span>
              <span className="ln"><span className="ln-i gradient-sub">setup, faster.</span></span>
            </h1>

            {/* Subtitle with verified turnkey messaging */}
            <p>
              Accurately calculate your required solar panels, inverter capacity, turnkey net metering costs, and ROI — backed by certified EPC engineering and smart AI assistance.
            </p>

            {/* CTA Buttons with SS2 text: Get Estimate & Track live prices */}
            <div className="cta">
              <a className="btn solid cta-estimate" href="#calculator">
                Get Estimate <span className="cta-arrow" aria-hidden="true">→</span>
              </a>
              <a ref={lastBtnRef} className="btn ghost cta-tracker" href="#tracker">
                Track live prices
              </a>
            </div>
          </main>
        </div>

        {/* Subtle scroll down indicator */}
        <a href="#calculator" className="orbit-scroll-hint" aria-label="Scroll to tools">
          <span className="scroll-hint-text">Scroll to explore tools</span>
          <svg className="scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default OrbitHero;
