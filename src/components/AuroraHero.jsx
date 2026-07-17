import { ThreeSolarSystem } from './ThreeSolarSystem';
import './Aurora.css';
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { TiltContainer } from './TiltContainer';

const COLORS_TOP = ["#00d2ff", "#3a7bd5", "#8a2be2", "#4b0082"];

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (typeof this.props.onError === "function") {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export const AuroraHero = () => {
  const color = useMotionValue(COLORS_TOP[0]);
  const [canUseWebGL, setCanUseWebGL] = useState(true);

  useEffect(() => {
    const controls = animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #030712 50%, ${color})`;
  const border = useMotionTemplate`1px solid rgba(255, 255, 255, 0.25)`;
  const boxShadow = useMotionTemplate`0px 1px 1px rgba(0, 0, 0, 0.05), 0px 4px 20px ${color}`;

  return (
    <motion.section
      id="top"
      style={{
        backgroundImage,
      }}
      className="aurora-hero"
    >
      <div className="aurora-hero__overlay" />

      <div className="aurora-hero__bg" aria-hidden="true" style={{ pointerEvents: 'auto' }}>
        {canUseWebGL ? (
          <WebGLErrorBoundary
            fallback={<div className="aurora-hero__bgFallback" />}
            onError={() => setCanUseWebGL(false)}
          >
            <ThreeSolarSystem />
          </WebGLErrorBoundary>
        ) : (
          <div className="aurora-hero__bgFallback" />
        )}
      </div>

      <div className="aurora-hero__inner">
        <div>
          <span className="aurora-hero__badge glass-panel">
            <span style={{color: '#00d2ff'}}>✨</span> Premium Solar Guidance
          </span>
          <h1 className="aurora-hero__title">Build a smarter solar setup, faster.</h1>
          <p className="aurora-hero__subtitle">
            Estimate panels, inverter size, cost, and ROI from your appliances, then compare vendor pricing and ask the AI assistant for guidance.
          </p>

          <div className="hero-actions">
            <motion.a
              href="#calculator"
              className="btn btn--primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.985 }}
              style={{ boxShadow }}
            >
              Get Estimate <FiArrowRight />
            </motion.a>
            <motion.a 
              className="btn btn--secondary glass-panel" 
              href="#tracker"
              style={{ border }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.985 }}
            >
              Track live prices
            </motion.a>
          </div>
        </div>

        {/* 3D Parallax Tilt container for Right Cards */}
        <TiltContainer className="aurora-hero__panel glass-panel" intensity={10} style={{ transformStyle: 'preserve-3d' }}>
          <div className="aurora-hero__cards" style={{ transformStyle: 'preserve-3d' }}>
            <div className="aurora-hero__card glass-panel" style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
              <p className="aurora-hero__cardTitle">🪐 Solar Calculator</p>
              <p className="aurora-hero__cardText">Pick appliances and instantly see recommended panels with buffer.</p>
            </div>
            <div className="aurora-hero__card glass-panel" style={{ transform: 'translateZ(55px)', transformStyle: 'preserve-3d' }}>
              <p className="aurora-hero__cardTitle">🛰️ Price Tracker</p>
              <p className="aurora-hero__cardText">Compare example vendor pricing across cities, wattage, and efficiency.</p>
            </div>
            <div className="aurora-hero__card glass-panel" style={{ transform: 'translateZ(80px)', transformStyle: 'preserve-3d' }}>
              <p className="aurora-hero__cardTitle">👨‍🚀 AI Assistant</p>
              <p className="aurora-hero__cardText">Ask about sizing, net metering, ROI, and practical next steps.</p>
            </div>
          </div>
        </TiltContainer>
      </div>
    </motion.section>
  );
};
