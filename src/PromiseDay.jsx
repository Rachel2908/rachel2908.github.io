import React, { useState,useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Float, Stars, Line, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURATION: THE PROMISES & SHAPE ---
const PROMISES = [
  "Start the Journey",
  "I promise to always hold you when things go wrong.",
  "I promise to always listen, even when you're silent.",
  "I promise to honor the versions of you that you haven't even met yet.",
  "I promise to let you have the last bite, even if it’s my favorite.",
  "I promise to protect your peace as if it were my own.",
  "I promise to love you, infinitely. ∞"
];

// Heart Shape Coordinates (Normalized)
const HEART_POINTS = [
  new THREE.Vector3(0, -2.5, 0),  // 0: Bottom Tip (Start)
  new THREE.Vector3(-2, -0.5, 0), // 1: Left Low
  new THREE.Vector3(-2, 1.5, 0),  // 2: Left High
  new THREE.Vector3(0, 0.5, 0),   // 3: Center Dip
  new THREE.Vector3(2, 1.5, 0),   // 4: Right High
  new THREE.Vector3(2, -0.5, 0),  // 5: Right Low
  new THREE.Vector3(0, -2.5, 0),  // 6: Back to Start (Loop)
];

// --- COMPONENT: Individual Star ---
function StarNode({ position, isActive, isConnected, onClick}) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (mesh.current) {
      // Pulse animation if active (waiting to be clicked)
      if (isActive && !isConnected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
        mesh.current.scale.set(scale, scale, scale);
      } else {
        mesh.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Interactive Mesh */}
      <mesh 
        ref={mesh}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color={isActive || isConnected ? "#00ffff" : "#444444"} 
          emissive={isActive || isConnected ? "#00ffff" : "#000000"}
          emissiveIntensity={isActive ? 3 : isConnected ? 1 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* Halo Glow for Active Star */}
      {isActive && (
        <mesh scale={[2, 2, 2]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#a6b9b9" transparent opacity={0.2} />
        </mesh>
      )}

      {/* Hover Cursor Logic */}
      <Html>
        <div style={{
          width: '1px', height: '1px',
          cursor: hovered && isActive ? 'pointer' : 'auto'
        }} />
      </Html>
    </group>
  );
}

// --- COMPONENT: The Constellation Logic ---
function Constellation({ onPromiseReveal, onFinish }) {
  const [connectedIndex, setConnectedIndex] = useState(0); // How many stars connected
  
  // Create line points based on how many stars are connected
  const linePoints = useMemo(() => {
    return HEART_POINTS.slice(0, connectedIndex + 1);
  }, [connectedIndex]);

  const handleStarClick = (index) => {
    // Only allow clicking the NEXT star in the sequence
    if (index === connectedIndex + 1) {
      setConnectedIndex(index);
      onPromiseReveal(index);
      
      // Check if finished (last point reached)
      if (index === HEART_POINTS.length - 1) {
        onFinish();
      }
    } else if (index === 0 && connectedIndex === 0) {
        // Handle start case
        setConnectedIndex(0);
        // onPromiseReveal(0); 
    }
  };

  return (
    <group>
      {/* Draw Lines between connected points */}
      {connectedIndex > 0 && (
        <Line 
          points={linePoints}       // Array of Vector3
          color="#6edada"                   
          lineWidth={3}                     
          opacity={0.8}
          transparent
        />
      )}

      {/* Render Stars */}
      {HEART_POINTS.map((pos, i) => {
        // A star is active if it is the NEXT one to click
        // Or if it's the first one and nothing has started
        const isNext = i === connectedIndex + 1;
        const isConnected = i <= connectedIndex;
        
        // Don't render the last star (duplicate of first) until the very end logic requires it
        // Actually, we do render it, so the user clicks it to close the loop.
        
        return (
          <StarNode 
            key={i}
            index={i}
            position={pos}
            isActive={isNext}
            isConnected={isConnected}
            onClick={() => handleStarClick(i)}
          />
        );
      })}
    </group>
  );
}

// --- MAIN EXPORT ---
export default function PromiseDay({ onBack }) {
  const { camera, viewport } = useThree();
  const [currentPromise, setCurrentPromise] = useState("Tap the glowing star to begin...");
  const [isFinished, setIsFinished] = useState(false);

  // Responsive Scale: Shrink constellation on mobile
  const responsiveScale = viewport.width < 5 ? 0.6 : 1;

  // 1. Reset Camera closer
   useEffect(() => {
     camera.position.set(0, 0, 7);
     camera.lookAt(0, 0, 0);
   }, [camera]);

  const handleReveal = (index) => {
    if (PROMISES[index]) {
      setCurrentPromise(PROMISES[index]);
    }
  };

  return (
    <group>
      {/* Dark Night Sky Environment */}
      <color attach="background" args={['#02020a']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={[10, 10, 10]} size={2} speed={0.2} opacity={0.5} color="cyan" />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 5]} intensity={1} color="#00ffff" distance={10} />

      {/* Instructions / Promise Text */}
      <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none', width: '300px', textAlign: 'center' }}>
        <div style={{
           color: '#aef9f9', 
           fontFamily: 'serif', 
           fontSize: isFinished ? '2rem' : '1.5rem',
           textShadow: '0 0 10px #b3c0c0',
           transition: 'all 0.5s ease',
           opacity: 1
        }}>
           {currentPromise}
        </div>
      </Html>

      {/* The Game */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group scale={responsiveScale}>
            <Constellation 
                onPromiseReveal={handleReveal} 
                onFinish={() => {
                    setIsFinished(true);
                    setCurrentPromise("Happy Promise Day! 🩵");
                }} 
            />
        </group>
      </Float>

      {/* Completed Effect: Big Glowing Heart */}
      {isFinished && (
        <mesh position={[0, 0, -1]} scale={responsiveScale}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="#000510" transparent opacity={0.0} /> 
            {/* Just a placeholder, maybe add fireworks or particles here later */}
        </mesh>
      )}

      {/* Back Button (Bottom Right) */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
         <div style={{ 
             position: 'absolute', 
             bottom: '20px', 
             right: '20px', 
             pointerEvents: 'auto'
         }}>
             <button onClick={onBack} style={{
                 padding: '12px 24px', 
                 borderRadius: '30px', 
                 border: '2px solid #00ffff',
                 background: 'rgba(0, 20, 40, 0.8)', 
                 color: '#00ffff', 
                 cursor: 'pointer', 
                 fontFamily: 'serif',
                 fontSize: '1.1rem',
                 fontWeight: 'bold',
                 boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                 transition: 'all 0.3s ease'
             }}
             onMouseOver={(e) => {
                e.currentTarget.style.background = '#00ffff';
                e.currentTarget.style.color = '#000000';
             }}
             onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0, 20, 40, 0.8)';
                e.currentTarget.style.color = '#00ffff';
             }}
             >
                 {isFinished ? "Continue Journey ➔" : "Go Back"}
             </button>
         </div>
      </Html>

    </group>
  );
}