import React from 'react';
import './App.css';
import Header from './components/Header';
import SolarCalculator from './components/SolarCalculator';
import PriceTracker from './components/PriceTracker';
import AIChatbot from './components/AIChatbot';
import { AuroraHero } from './components/AuroraHero';
import FAQ from './components/FAQ';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="Main">
        <AuroraHero />
        <div className="Content">
          <SolarCalculator />
          <PriceTracker />
          <AIChatbot />
          <FAQ />
        </div>
      </main>
      <footer className="Footer glass-panel" style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="Footer__inner" style={{ flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Solar Guidance System</span>
            <span className="Footer__dot" aria-hidden="true">•</span>
            <span>Pakistan</span>
          </div>
          {/* <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.55)', fontWeight: 'normal', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}>
            <a href="https://www.consulics.com" target="_blank" rel="noopener noreferrer" style={{ color: '#13ffaa', textDecoration: 'underline' }}>Consulics</a> is an IRS Authorized Form 2290 and Form 8849 e-File provider for truck owners, fleets, and tax professionals. File HVUT online and get your stamped Schedule 1 in minutes.
          </p> */}
        </div>
      </footer>
    </div>
  );
}

export default App;

