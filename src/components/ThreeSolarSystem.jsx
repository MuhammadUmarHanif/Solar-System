import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Ring } from '@react-three/drei';
import * as THREE from 'three';

const Planet = ({ radius, size, color, speed, children, offset = 0 }) => {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Revolve around sun
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t * speed + offset) * radius;
      groupRef.current.position.z = Math.sin(t * speed + offset) * radius;
      // Rotate on own axis
      groupRef.current.rotation.y += 0.015;
    }
  });

  return (
    <>
      {/* Color-coordinated Orbital Path */}
      {radius > 0 && (
        <Ring args={[radius - 0.03, radius + 0.03, 128]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={color} opacity={0.12} transparent side={THREE.DoubleSide} />
        </Ring>
      )}
      
      {/* Planet Group */}
      <group ref={groupRef}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.5} 
            metalness={0.7} 
            emissive={color}
            emissiveIntensity={0.08}
          />
        </mesh>
        {children}
      </group>
    </>
  );
};

const AsteroidBelt = ({ count = 350, innerRadius = 20, outerRadius = 22.5 }) => {
  const pointsRef = useRef();
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.4; // Small vertical variation
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [count, innerRadius, outerRadius]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0008; // Orbiting the sun slowly
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5b4fc"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.4}
      />
    </points>
  );
};

const SolarSystemScene = () => {
  const sunRef = useRef();
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.004;
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      
      {/* The Sun - Gorgeous physics material with strong emissive glow */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial 
          color="#ffb700" 
          emissive="#ff4500" 
          emissiveIntensity={2.0} 
          roughness={0.1}
          metalness={0.2}
        />
        <pointLight intensity={350} distance={220} decay={1.4} color="#ffedd5" castShadow />
      </mesh>
      
      {/* Sun inner glow */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Outer corona glow */}
      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Planets */}
      <Planet radius={6} size={0.3} color="#9ca3af" speed={0.8} /> {/* Mercury */}
      <Planet radius={9} size={0.5} color="#fbbf24" speed={0.6} offset={2} /> {/* Venus */}
      <Planet radius={13} size={0.65} color="#3b82f6" speed={0.4} offset={4}> {/* Earth */}
        {/* Moon */}
        <Planet radius={1.1} size={0.15} color="#e5e7eb" speed={2} offset={0} />
      </Planet>
      <Planet radius={17} size={0.42} color="#ef4444" speed={0.3} offset={1} /> {/* Mars */}
      
      {/* Asteroid Belt */}
      <AsteroidBelt count={400} />
      
      <Planet radius={24} size={1.4} color="#f97316" speed={0.15} offset={3} /> {/* Jupiter */}
      
      <Planet radius={31} size={1.1} color="#fcd34d" speed={0.1} offset={5}> {/* Saturn */}
        {/* Saturn Rings */}
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[1.5, 2.4, 64]} />
          <meshStandardMaterial color="#d97706" transparent opacity={0.7} side={THREE.DoubleSide} roughness={0.6} />
        </mesh>
        {/* Faint outer ring */}
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[2.5, 2.9, 64]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </Planet>

      <Planet radius={38} size={0.8} color="#22d3ee" speed={0.06} offset={0}> {/* Uranus */}
         {/* Uranus Rings (faint) */}
         <mesh rotation={[Math.PI / 1.6, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 64]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </Planet>
      
      <Planet radius={44} size={0.72} color="#6366f1" speed={0.04} offset={2} /> {/* Neptune */}
    </>
  );
};

export const ThreeSolarSystem = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 26, 46], fov: 45 }} shadows>
        {/* Deep space background matching the premium theme */}
        <color attach="background" args={['#030712']} />
        
        {/* Milky way stars */}
        <Stars radius={150} depth={50} count={9000} factor={6} saturation={0.6} fade speed={1.2} />
        
        <SolarSystemScene />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={90}
          minDistance={12}
          maxPolarAngle={Math.PI / 1.4} 
        />
      </Canvas>
    </div>
  );
};
