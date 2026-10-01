import React, { useEffect, useRef, useState } from 'react';
import './OrbitLanding.css';

export const OrbitLanding = ({ onExplore }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const lastBtnRef = useRef(null);

  // 8. Entrance animation
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

  // Last CTA button animationend listener
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

  // 10. Background video playback logic
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    const play = () => {
      if (v.paused) {
        const p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
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

  // 9. Mobile menu outside click & Escape key
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
    <div ref={rootRef} className={`orbit-root ${animClass}`}>
      <div className="frame">
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

        <header className="bar" data-open={menuOpen ? 'true' : 'false'}>
          <a className="brand" href="#top" aria-label="Orbit — home">
            <svg className="brand-logo" viewBox="0 0 26.9 16.6">
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="13.25" cy="8.4" r="8.8" fill="#000" />
              <circle cx="13.25" cy="8.4" r="8.1" fill="currentColor" />
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#000" strokeWidth="0.9" strokeDasharray="28.2 28.2" />
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25" strokeDasharray="28.2 28.2" />
            </svg>
            <span className="brand-text">Orbit</span>
          </a>

          <nav className="links" aria-label="Primary">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <a href="#blog">Blog</a>
          </nav>

          <div className="actions">
            <a className="btn ghost" href="#try" onClick={onExplore}>Try for free</a>
            <a className="btn solid" href="#demo" onClick={onExplore}>Get a demo</a>
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
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
              <a href="#blog" onClick={() => setMenuOpen(false)}>Blog</a>
              <a className="btn solid" href="#demo" onClick={() => { setMenuOpen(false); if (onExplore) onExplore(); }}>
                Get a demo
              </a>
            </nav>
          </div>
        </header>

        <div className="screen">
          <main className="hero">
            <a className="pill" href="#new">
              <span className="chip">New</span>
              <span className="pill-label">Go beyond the ordinary</span>
              <svg className="pill-arrow" viewBox="0 0 9.5 8" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0.7 4H8.8M5.6 0.75 8.85 4 5.6 7.25" />
              </svg>
            </a>

            <h1>
              <span className="ln"><span className="ln-i">See beyond now</span></span>
              <span className="ln"><span class="ln-i">Explore the stars</span></span>
            </h1>

            <p>Everything you need to discover, understand, and explore what is out there.</p>

            <div className="cta">
              <a className="btn ghost" href="#try" onClick={onExplore}>Try for free</a>
              <a ref={lastBtnRef} className="btn solid" href="#explore" onClick={onExplore}>Explore</a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrbitLanding;
