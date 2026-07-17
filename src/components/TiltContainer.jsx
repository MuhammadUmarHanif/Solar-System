import React, { useState, useRef } from 'react';

export const TiltContainer = ({ children, className, style = {}, intensity = 10, ...props }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation angles (x-axis rotation responds to Y movement, y-axis to X movement)
    const rotateX = ((centerY - y) / centerY) * intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
