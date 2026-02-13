import React, { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Float, Cloud, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- ASSETS: Heart Shape ---
const heartShape = new THREE.Shape();
const x = 0, y = 0;
heartShape.moveTo(x + 0.5, y + 0.5);
heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

// --- COMPONENT: The Target Heart ---
function TargetHeart({ hitCount, lastHitTime }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      // 1. Permanent Growth: Grows slightly with every hit (capped at 2x size)
      const permanentSize = 1.5 + Math.min(hitCount * 0.05, 1.5);

      // 2. Impact "Thump": Calculates time since last hit
      // If hit recently, add a sudden burst of scale
      const timeSinceHit = state.clock.elapsedTime - lastHitTime;
      const thump = Math.max(0, 0.5 - timeSinceHit * 2); // Quick decay pulse

      // 3. Resting Heartbeat
      const heartbeat = Math.sin(state.clock.elapsedTime * 3) * 0.05;

      // Apply Scale
      const totalScale = permanentSize + thump + heartbeat;
      mesh.current.scale.setScalar(totalScale);

      // 4. Color Flash on Hit
      const flash = Math.max(0, 1 - timeSinceHit * 5); // Flash lasts 0.2s
      mesh.current.material.emissiveIntensity = 0.5 + flash * 2;
    }
  });

  return (
    <group position={[0, 0, -10]}>
      <mesh ref={mesh} rotation={[0, 0, Math.PI]}>
        <extrudeGeometry args={[heartShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1 }]} />
        <meshStandardMaterial 
            color="#ff0055" 
            emissive="#ff0022"
            emissiveIntensity={0.5} 
            roughness={0.2}
            metalness={0.8}
        />
      </mesh>
      
      {/* Background Glow */}
      <pointLight distance={7} intensity={3} color="#ff0055" />
    </group>
  );
}

// --- COMPONENT: Flying Kiss Projectile ---
function FlyingKiss({ id, startPos, onHit }) {
  const ref = useRef();
  
  // Target is the Heart at (0, 0, -10)
  const targetZ = -10;
  const speed = 0.4; // How fast it flies

  useFrame(() => {
    if (ref.current) {
      // 1. Move Forward along Z
      ref.current.position.z -= speed;
      
      // 2. Aim at Center (0,0) logic
      // We calculate how far we are from the target Z
      const distanceRemaining = ref.current.position.z - targetZ;
      const totalDistance = startPos[2] - targetZ;
      const progress = 1 - (distanceRemaining / totalDistance);

      // Lerp X and Y towards 0 based on progress
      ref.current.position.x = THREE.MathUtils.lerp(startPos[0], 0, progress * 1.1); // 1.1 ensures it hits center slightly early
      ref.current.position.y = THREE.MathUtils.lerp(startPos[1], 0, progress * 1.1);

      // 3. Hit Detection
      // When it gets very close to the heart Z position
      if (ref.current.position.z < -9) {
        onHit(id);
      }
    }
  });

  return (
    <group ref={ref} position={startPos}>
      <Text fontSize={1.5} color="#ff0055">💋</Text>
      <Sparkles count={5} scale={1} size={10} speed={0} color="gold" />
    </group>
  );
}

// --- COMPONENT: Tunnel Environment ---
function Tunnel() {
  const group = useRef();
  const { viewport } = useThree();
  const sideX = viewport.width < 5 ? 2.5 : 5;

  useFrame(() => {
    if (group.current) {
        group.current.position.z += 0.1;
        if (group.current.position.z > 10) group.current.position.z = 0;
    }
  });

  return (
    <group ref={group}>
        <Cloud position={[-sideX, 2, -10]} opacity={0.4} speed={0.1} segments={5} />
        <Cloud position={[sideX, -2, -15]} opacity={0.4} speed={0.1} segments={5} />
        <Cloud position={[-sideX, -2, -20]} opacity={0.4} speed={0.1} segments={5} />
        <Cloud position={[sideX, 2, -5]} opacity={0.4} speed={0.1} segments={5} />
    </group>
  );
}

// --- MAIN EXPORT ---
export default function KissDay({ onBack }) {
  const { viewport, camera, clock } = useThree();
  const [kisses, setKisses] = useState([]);
  const [hitCount, setHitCount] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, -10);
  }, [camera]);

  const spawnKiss = (e) => {
    // 1. Get click/touch position normalized (-1 to 1)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    // Use random X spread if exact touch is tricky, or map correctly
    // Here we map click X to scene X width
    const xRatio = (clientX / window.innerWidth) * 2 - 1;
    const startX = xRatio * (viewport.width / 2);
    const startY = -3; // Start from bottom

    const newKiss = {
      id: Math.random(),
      position: [startX, startY, 4] // Start near camera
    };
    
    setKisses((prev) => [...prev, newKiss]);
  };

  const handleHit = (id) => {
    setHitCount(prev => prev + 1);
    setLastHitTime(clock.elapsedTime); // Record time for "Thump" animation
    setKisses((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <group>
      <color attach="background" args={['#220011']} />
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} />
      
      <Tunnel />
      
      {/* Target Heart receives hit data to animate */}
      <TargetHeart hitCount={hitCount} lastHitTime={lastHitTime} />

      {/* Kisses fly towards the heart */}
      {kisses.map((kiss) => (
        <FlyingKiss 
            key={kiss.id} 
            id={kiss.id} 
            startPos={kiss.position} 
            onHit={handleHit} 
        />
      ))}

      {/* UI Interaction Layer */}
      <Html fullscreen>
        <div 
            style={{ 
                width: '100%', height: '100%', 
                cursor: 'pointer', touchAction: 'none' 
            }}
            onPointerDown={spawnKiss}
        >
            {/* Instruction Text */}
            <div style={{ 
                position: 'absolute', top: '15%', width: '100%', 
                textAlign: 'center', pointerEvents: 'none' 
            }}>
                <h1 style={{ 
                    fontFamily: 'serif', color: '#ff0055', 
                    fontSize: 'clamp(2rem, 6vw, 3rem)', 
                    textShadow: '0 0 10px white', margin: 0,
                    opacity: 0.9
                }}>
                    Sending Love...
                </h1>
                <p style={{ color: 'white', opacity: 0.7 }}>Tap screen to send kisses</p>
            </div>

            {/* Back Button */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'auto' }}>
                 <button onClick={(e) => { e.stopPropagation(); onBack(); }} style={{
                     padding: '12px 24px', borderRadius: '30px', 
                     border: '2px solid #ff0055',
                     background: 'rgba(255,255,255,0.8)', 
                     color: '#ff0055', cursor: 'pointer', fontFamily: 'serif',
                     fontWeight: 'bold', fontSize: '1rem',
                     boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                 }}>
                     Go Back
                 </button>
            </div>
        </div>
      </Html>

    </group>
  );
}