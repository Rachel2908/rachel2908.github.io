import React, { useState, useEffect, useRef } from 'react';
import { useThree} from '@react-three/fiber';
import { Html, Float, Environment, Sparkles, ContactShadows, Text} from '@react-three/drei';
import { useSpring, animated} from '@react-spring/three';
import * as THREE from 'three';

// Define Heart Shape geometry outside to avoid re-calculation
const heartShape = new THREE.Shape();
const x = 0, y = 0;
heartShape.moveTo(x + 0.5, y + 0.5);
heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

// --- COMPONENT: Procedural Teddy Bear ---
function TeddyBear({ color, isHugging }) {
  const group = useRef();
  
  // ANIMATION SPRINGS
  const { armRotation, bodyLean, armOpen, heartScale } = useSpring({
    armRotation: isHugging ? 2.5 : 0, // Arms raise up
    armOpen: isHugging ? 0.5 : 0,     // Arms spread wide
    bodyLean: isHugging ? 0.5 : 0,    // Bear leans forward
    heartScale: isHugging ? 1 : 0,    // Heart pops out
    config: { mass: 5, tension: 100, friction: 50 } // Slow and smooth
  });

  return (
    <animated.group 
        ref={group} 
        position={[0, -1, 0]} 
        scale={1.5} 
        rotation-x={bodyLean} // Lean forward when hugging
    >
      {/* 1. BODY */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* --- THE GLOWING HEART ON HUG --- */}
      <animated.mesh
        position={[0.2, 1.4, 1]}
        rotation={[0,0, Math.PI]}
        scale={heartScale.to(s => [s * 0.4, s * 0.4, s * 0.4])}
        >
          <extrudeGeometry args={[heartShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 }]} />
          <meshStandardMaterial 
            color="#ff0055"
            emissive="#f387ab"
            emmissiveIntensity={1}
            toneMapped={false} // Glow effect
          />  
      </animated.mesh>

      {/* 2. HEAD */}
      <group position={[0, 1.8, 0]}>
        <mesh>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        
        {/* Ears */}
        <mesh position={[-0.6, 0.6, 0]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.6, 0.6, 0]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color={color} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.25, 0.1, 0.7]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="black" roughness={0.1} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.7]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="black" roughness={0.1} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.2, 0.7]} scale={[1, 0.8, 0.5]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#ffdec2" />
        </mesh>
        <mesh position={[0, -0.1, 0.85]}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* 3. ARMS (Fixed Position & Animation) */}
      {/* Left Arm */}
      <animated.group 
        position={[-0.9, 0.3, 0.4]} 
        rotation-z={armRotation.to(r => -r * 0.5)} // Raise Up
        rotation-y={armOpen.to(r => -r)}            // Open Wide
      >
        <mesh rotation={[0, 0, 0.5]}>
            <capsuleGeometry args={[0.25, 0.9, 4, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
      </animated.group>

      {/* Right Arm */}
      <animated.group 
        position={[0.9, 0.3, 0.4]} 
        rotation-z={armRotation.to(r => r * 0.5)} // Raise Up
        rotation-y={armOpen.to(r => r)}           // Open Wide
      >
        <mesh rotation={[0, 0, -0.5]}>
            <capsuleGeometry args={[0.25, 0.9, 4, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
      </animated.group>

      {/* 4. LEGS */}
      <mesh position={[-0.5, -0.5, 0.6]} rotation={[1.5, 0, -0.2]}>
         <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
         <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.5, -0.5, 0.6]} rotation={[1.5, 0, 0.2]}>
         <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
         <meshStandardMaterial color={color} />
      </mesh>

    </animated.group>
  );
}

// --- COMPONENT: UI Overlay ---
function CustomizeUI({ setColor, onHug, isFinished }) {
  const colors = [
    { name: 'Brown', hex: '#8b4513' },
    { name: 'Pink', hex: '#ff99cc' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Gold', hex: '#ffd700' },
  ];

  return (
    <Html fullscreen style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* HEADER */}
      <h1 style={{ 
          color: 'white', fontFamily: 'serif', marginTop: '50px',
          textShadow: '0 0 10px #ff0055', textAlign: 'center' 
      }}>
        {isFinished ? "Sent with a Hug!" : "Customize Your Teddy"}
      </h1>

      {/* COLOR PICKER (Bottom) */}
      {!isFinished && (
        <div style={{ 
            position: 'absolute', bottom: '120px', 
            display: 'flex', gap: '20px', pointerEvents: 'auto' 
        }}>
            {colors.map((c) => (
                <button 
                    key={c.name}
                    onClick={() => setColor(c.hex)}
                    style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: c.hex, border: '3px solid white', cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            ))}
        </div>
      )}

      {/* HUG BUTTON */}
      {!isFinished && (
          <button 
            onClick={onHug}
            style={{
                position: 'absolute', bottom: '40px', pointerEvents: 'auto',
                padding: '15px 40px', fontSize: '1.5rem', borderRadius: '30px',
                background: '#ff0055', color: 'white', border: 'none', cursor: 'pointer',
                fontFamily: 'serif', boxShadow: '0 0 20px #ff0055'
            }}
          >
            Send Hug ❤️
          </button>
      )}

      {/* VICTORY MESSAGE */}
      {isFinished && (
          <div style={{ 
              position: 'absolute', top: '20%', 
              background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '15px',
              textAlign: 'center', boxShadow: '0 0 30px gold',
              animation: 'popIn 0.5s ease'
          }}>
              <h1 style={{ color: '#ff0055', margin: 0 }}>Happy Teddy Day!</h1>
              <p style={{ color: '#5c3a21', fontSize: '1.2rem' }}>Here is a warm hug for you.</p>
          </div>
      )}
      
      <style>{`@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>

    </Html>
  );
}

// --- MAIN EXPORT ---
export default function TeddyDay({ onBack }) {
  const { camera } = useThree();
  const [bearColor, setBearColor] = useState('#8b4513'); 
  const [isHugging, setIsHugging] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 1. Reset Camera closer
  useEffect(() => {
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const handleHug = () => {
    setIsHugging(true);
    // Increased wait time to 3 seconds so the slow hug finishes
    setTimeout(() => {
        setIsFinished(true);
    }, 3000); 
  };

  return (
    <group>
      <color attach="background" args={['#ffeff5']} />
      <Environment preset="studio" />
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 10, 5]} intensity={1} angle={0.5} penumbra={1} />

      {/* Floating Particles */}
      <Sparkles count={50} scale={[10, 10, 10]} size={5} speed={0.5} opacity={0.5} color="pink" />

      {/* The Bear */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
         <TeddyBear color={bearColor} isHugging={isHugging} />
      </Float>

      {/* Floor Shadow */}
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="purple" />

      <CustomizeUI 
        setColor={setBearColor} 
        onHug={handleHug} 
        isFinished={isFinished} 
      />

      {/* --- RESPONSIVE BOTTOM-RIGHT BACK BUTTON --- */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
         <div style={{ 
             position: 'absolute', 
             bottom: '20px', 
             right: '20px', 
             pointerEvents: 'auto' // Enable clicking
         }}>
             <button onClick={onBack} style={{
                 padding: '10px 20px', 
                 borderRadius: '20px', 
                 border: '2px solid #ff0055',
                 background: 'rgba(255,255,255,0.8)', 
                 color: '#ff0055', 
                 cursor: 'pointer', 
                 fontFamily: 'serif',
                 fontWeight: 'bold',
                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
             }}>
                 {isFinished ? "Continue Journey ➔" : "Go Back"}
             </button>
         </div>
      </Html>

    </group>
  );
}