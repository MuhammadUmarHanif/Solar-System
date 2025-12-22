import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import './Aurora.css';
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: true });
    return !!gl;
  } catch {
    return false;
  }
};

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

  useEffect(() => {
    setCanUseWebGL(isWebGLAvailable());
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid rgba(255, 255, 255, 0.18)`;
  const boxShadow = useMotionTemplate`0px 1px 1px rgba(0, 0, 0, 0.02), 0px 4px 15px ${color}`;

  return (
    <motion.section
      id="top"
      style={{
        backgroundImage,
      }}
      className="aurora-hero"
    >
      <div className="aurora-hero__overlay" />

      <div className="aurora-hero__bg" aria-hidden="true">
        {canUseWebGL ? (
          <WebGLErrorBoundary
            fallback={<div className="aurora-hero__bgFallback" />}
            onError={() => setCanUseWebGL(false)}
          >
            <Canvas style={{ pointerEvents: "none" }}>
              <Stars radius={50} count={2600} factor={4} fade speed={1.8} />
            </Canvas>
          </WebGLErrorBoundary>
        ) : (
          <div className="aurora-hero__bgFallback" />
        )}
      </div>

      <div className="aurora-hero__inner">
        <div>
          <span className="aurora-hero__badge">Solar planning for Pakistan</span>
          <h1 className="aurora-hero__title">Build a smarter solar setup, faster.</h1>
          <p className="aurora-hero__subtitle">
            Estimate panels, inverter size, cost, and ROI from your appliances, then compare vendor pricing and ask the AI assistant for guidance.
          </p>

          <div className="hero-actions">
            <motion.a
              href="#calculator"
              className="btn btn--secondary"
              style={{ border}}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.985 }}
            >
              Get Estimate <FiArrowRight />
            </motion.a>
            <a className="btn btn--secondary" href="#tracker">
              Track live prices
            </a>
          </div>
        </div>

        <div className="aurora-hero__panel">
          <div className="aurora-hero__cards" >
            <div className="aurora-hero__card">
              <p className="aurora-hero__cardTitle">Solar Calculator</p>
              <p className="aurora-hero__cardText">Pick appliances and instantly see recommended panels with buffer.</p>
            </div>
            <div className="aurora-hero__card">
              <p className="aurora-hero__cardTitle">Price Tracker</p>
              <p className="aurora-hero__cardText">Compare example vendor pricing across cities, wattage, and efficiency.</p>
            </div>
            <div className="aurora-hero__card">
              <p className="aurora-hero__cardTitle">AI Assistant</p>
              <p className="aurora-hero__cardText">Ask about sizing, net metering, ROI, and practical next steps.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
