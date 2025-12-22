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
      <footer className="Footer">
        <div className="Footer__inner">
          <span>Solar Guidance System</span>
          <span className="Footer__dot" aria-hidden="true">•</span>
          <span>Pakistan</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
