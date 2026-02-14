import React, { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Float, Environment, Sparkles, useTexture } from '@react-three/drei';
import { useSpring, animated} from '@react-spring/three';
import * as THREE from 'three';

// --- CONFIGURATION ---
const BOY_COLOR = "#4488ff";
const GIRL_COLOR = "#ff66aa";

// --- COMPONENT: Blob Character ---
function Hugger({ 
  image, 
  color, 
  startX, // Use dynamic start position
  isFinished, 
  energy, 
  isLeft 
}) {
  const mesh = useRef();
  
  // Load texture (handle errors if image missing)
  const texture = useTexture(image);

  // ANIMATION
  const { pos, scale, rotation } = useSpring({
    // Position Logic:
    // If finished: meet in the middle (±0.6).
    // If charging: shake slightly.
    // Default: sit at startX.
    pos: isFinished 
      ? (isLeft ? -0.5 : 0.5) 
      : startX - (energy * 0.01 * (isLeft ? -1 : 1)), 

    scale: isFinished ? [1.3, 0.7, 1.3] : [1, 1, 1], // Squash effect
    rotation: isFinished ? 0 : (energy * 0.5),      // Waddle effect
    config: isFinished 
      ? { mass: 2, tension: 150, friction: 12 } 
      : { mass: 1, tension: 170, friction: 26 }
  });

  useFrame((state) => {
    if (mesh.current && !isFinished) {
      const shake = energy > 0 ? Math.sin(state.clock.elapsedTime * 50) * (energy * 0.002) : 0;
      mesh.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 + shake;
      // Apply the animated X position
      mesh.current.position.x = pos.get() + shake;
    }
  });

  return (
    <animated.group 
      position-x={pos} // React-Spring controls X
      position-y={-1} 
      scale={scale} 
      rotation-z={rotation.to(r => isLeft ? r * 0.2 : -r * 0.2)}
    >
      <group ref={mesh}>
        {/* BODY */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>

        {/* FACE */}
        <mesh position={[isLeft ? 1 : -1, 0.1, 0]} rotation={[0, isLeft ? 1.5 : -1.5, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>

        {/* ARMS */}
        <mesh position={[0, -0.2, 0.9]} rotation={[0.5, 0, 0]}>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.2, -0.9]} rotation={[-0.5, 0, 0]}>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </animated.group>
  );
}

// --- MAIN EXPORT ---
export default function HugDay({ onBack }) {
  const { viewport, camera } = useThree();
  const [energy, setEnergy] = useState(0); 
  const [isPressed, setIsPressed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // --- RESPONSIVE LOGIC ---
  // On mobile (width < 5), reduce distance. On desktop, use wider distance.
  // We clamp the value so they don't go off-screen.
  const responsiveX = Math.min(3, Math.max(1.5, viewport.width / 4));
  
  // Scale down characters slightly on very small screens
  const characterScale = viewport.width < 4 ? 0.8 : 1;

  // Reset Camera
  useEffect(() => {
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // --- INTERACTION ---
  useEffect(() => {
    const handleDown = (e) => {
      if (e.code === 'Space' || e.type === 'touchstart' || e.type === 'mousedown') setIsPressed(true);
    };
    const handleUp = () => setIsPressed(false);

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  useFrame(() => {
    if (isFinished) return;
    if (isPressed) {
      setEnergy((prev) => Math.min(prev + 0.8, 100)); // Charge Speed
    } else {
      setEnergy((prev) => Math.max(prev - 2, 0)); // Drain Speed
    }
    if (energy >= 100 && !isFinished) setIsFinished(true);
  });

  return (
    <group>
      <color attach="background" args={[isFinished ? '#ffaaee' : '#aaccff']} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={isFinished ? 2 : 1} color={isFinished ? "gold" : "white"} />
      <Environment preset={isFinished ? "sunset" : "park"} />

      {/* Particles */}
      {isFinished && (
         <Float speed={2}>
            <Sparkles count={100} scale={[8, 8, 8]} size={10} speed={0.4} opacity={1} color="red" />
            <Sparkles count={50} scale={[10, 10, 10]} size={10} speed={0.2} opacity={0.5} color="gold" />
         </Float>
      )}

      {/* --- CHARACTERS (Responsive Group) --- */}
      <group scale={characterScale}>
          <Hugger 
            image="images/face2.png" // Replace with "/face1.png"
            color={GIRL_COLOR} 
            startX={-responsiveX} // <--- Dynamic X
            isLeft={true} 
            isFinished={isFinished}
            energy={energy}
          />
          
          <Hugger 
            image="images/face1.png" // Replace with "/face2.png"
            color={BOY_COLOR} 
            startX={responsiveX} // <--- Dynamic X
            isLeft={false} 
            isFinished={isFinished}
            energy={energy}
          />
      </group>

      {/* --- UI --- */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div style={{ 
            width: '100%', height: '100%', 
            display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center' 
        }}>
            
            {!isFinished ? (
                // CHARGING METER
                <div style={{ position: 'absolute', top: '20%', width: '100%', textAlign: 'center' }}>
                    <h1 style={{ 
                        fontFamily: 'sans-serif', color: 'white', 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: '1.5rem'
                    }}>
                        Hold Space / Touch Screen
                    </h1>
                    <div style={{ 
                        width: 'min(80%, 300px)', height: '20px', 
                        border: '2px solid white', borderRadius: '15px', 
                        overflow: 'hidden', background: 'rgba(0,0,0,0.3)', margin: '0 auto'
                    }}>
                        <div style={{ 
                            width: `${energy}%`, height: '100%', 
                            background: 'linear-gradient(90deg, #ff0055, #ff99cc)',
                            transition: 'width 0.1s linear'
                        }} />
                    </div>
                </div>
            ) : (
                // VICTORY
                <div style={{ textAlign: 'center', animation: 'popIn 0.5s ease' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 4rem)', // Responsive Text Size
                        color: '#fff', textShadow: '0 4px 10px #ff0055', margin: 0
                    }}>
                        Happy Hug Day!
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', color: '#5c3a21' }}>
                        Distance means nothing when you hug.
                    </p>
                </div>
            )}

            {/* RESPONSIVE BACK BUTTON */}
            <div style={{ 
                position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'auto' 
            }}>
                 <button onClick={onBack} style={{
                     padding: '12px 24px', borderRadius: '30px', 
                     border: isFinished ? '2px solid white' : '2px solid #555',
                     background: isFinished ? '#ff0055' : 'rgba(255,255,255,0.5)', 
                     color: 'white', cursor: 'pointer', fontFamily: 'serif',
                     fontWeight: 'bold', fontSize: '1rem',
                     boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                 }}>
                     {isFinished ? "Continue Journey ➔" : "Go Back"}
                 </button>
            </div>

        </div>
        <style>{`@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
      </Html>

    </group>
  );
}