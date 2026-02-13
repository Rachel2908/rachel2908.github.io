import React, { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Image, Float, Sparkles, Environment, Stars, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
// Import Animation Hooks
import { useSpring, animated, config } from '@react-spring/three';

// --- CONFIGURATION: YOUR MEMORIES ---
const MEMORIES = [
  "/images/1.jpg", 
  "/images/7.jpg", 
  "/images/3.jpg", 
  "/images/4.jpg", 
  "/images/5.jpg", 
  "/images/2.jpg", 
];

// --- COMPONENT: Firework Explosion ---
function Firework({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      // Pulse scale
      const scale = 1 + Math.sin(t * 10 + position[0]) * 0.2;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Sparkles count={100} scale={[4, 4, 4]} size={10} speed={2} opacity={1} color={color} />
      <Sparkles count={50} scale={[6, 6, 6]} size={20} speed={0.5} opacity={0.5} color="white" />
    </group>
  );
}

// --- COMPONENT: Celebration Scene ---
function Celebration() {
  const { viewport } = useThree();
  const textScale = viewport.width < 5 ? 0.6 : 1;

  return (
    <group position={[0, 5, 0]}>
      <Float speed={2} floatIntensity={1}>
          <group scale={textScale}>
            <Text 
                fontSize={1.5} 
                color="#ff0055" 
                anchorX="center" 
                anchorY="middle"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                outlineWidth={0.05}
                outlineColor="#ffffff"
            >
                HAPPY VALENTINE'S DAY!
            </Text>
            <Text 
                position={[0, -1.5, 0]}
                fontSize={0.8} 
                color="gold" 
                anchorX="center" 
                anchorY="middle"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            >
                I Love You Forever ❤️
            </Text>
          </group>
      </Float>

      <Firework position={[-4, 2, -2]} color="red" />
      <Firework position={[4, 3, -1]} color="gold" />
      <Firework position={[-3, -1, 1]} color="purple" />
      <Firework position={[3, -2, 2]} color="cyan" />
      <Firework position={[0, 4, -3]} color="#ff0055" />
    </group>
  );
}

// --- COMPONENT: Procedural Gazebo ---
function Gazebo() {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.1; 
    }
  });

  return (
    <group ref={group} position={[0, -2.5, 0]}>
       <mesh rotation={[-Math.PI / 1, 0, 0]} receiveShadow>
         <cylinderGeometry args={[4, 4, 0.2, 32]} />
         <meshStandardMaterial color="#f0e6d2" roughness={0.5} />
       </mesh>
       {[0, 1, 2, 3, 4, 5].map((i) => {
         const angle = (i / 6) * Math.PI * 2;
         return (
           <mesh key={i} position={[Math.cos(angle) * 3, 2, Math.sin(angle) * 3]}>
             <cylinderGeometry args={[0.1, 0.15, 4, 16]} />
             <meshStandardMaterial color="#fff" />
           </mesh>
         );
       })}
       <mesh position={[0, 4.5, 0]}>
         <coneGeometry args={[4.5, 2, 32]} />
         <meshStandardMaterial color="#ff0055" roughness={0.3} />
       </mesh>
    </group>
  );
}

// --- COMPONENT: Floating Memory (ANIMATED) ---
function FloatingMemory({ url, targetPosition, targetRotation, isCelebrated }) {
  // ANIMATION LOGIC:
  // We use useSpring to smoothly transition between current and target props
  const { pos, rot, opacity } = useSpring({
    pos: targetPosition,      // Move to target
    rot: targetRotation,      // Rotate to target
    opacity: isCelebrated ? 0.8 : 1, // Slight fade
    config: config.molasses   // Slow, heavy, dreamy movement
  });

  return (
    // We reduce float intensity when they are in gallery mode so they don't drift too much
    <Float speed={isCelebrated ? 0.5 : 2} rotationIntensity={0.1} floatIntensity={0.2}>
      
      {/* animated.group handles the Position/Rotation spring physics */}
      <animated.group position={pos} rotation={rot}>
        
        {/* Frame */}
        <mesh position={[0, 0, -0.05]}>
           <boxGeometry args={[1.6, 2.1, 0.1]} />
           <animated.meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
        </mesh>
        
        {/* Photo */}
        <Image url={url} scale={[1.5, 2]} transparent opacity={0.95} />
      
      </animated.group>
    </Float>
  );
}

// --- COMPONENT: Love Letter Button ---
function LoveLetterButton({ onClick }) {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
       mesh.current.rotation.y += 0.01;
       mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group onClick={onClick} position={[0, -1, -2]}>
       <Float speed={4} floatIntensity={2}>
           <mesh ref={mesh}>
              <extrudeGeometry args={[(() => {
                  const shape = new THREE.Shape();
                  const x = 0, y = 0;
                  shape.moveTo(x + 0.5, y + 0.5);
                  shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
                  shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
                  shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
                  shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
                  shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
                  shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
                  return shape;
              })(), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1 }]} />
              <meshStandardMaterial color="#ff0055" emissive="#ff0022" emissiveIntensity={0.5} />
           </mesh>
           <Html position={[0, -1.2, 0]} center pointerEvents="none">
             <div style={{ color: 'white', fontFamily: 'serif', fontSize: '1.2rem', textShadow: '0 0 5px black', whiteSpace: 'nowrap' }}>
               Click Me ❤️
             </div>
           </Html>
       </Float>
       <pointLight distance={3} intensity={2} color="red" />
    </group>
  );
}

// --- MAIN EXPORT ---
export default function ValentineDay({ onBack }) {
  const { camera, viewport } = useThree();
  const [isOpen, setIsOpen] = useState(false);
  const [isCelebrated, setIsCelebrated] = useState(false);
  
  const audioRef = useRef(new Audio('/love.mp3')); 

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
    audio.loop = true;
    audio.currentTime = 17; // Cut first 17s

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.log("Audio play failed (user interaction needed):", e));
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // --- CAMERA MOVEMENT ---
  useEffect(() => {
    // Zoom out slightly when celebrating to see the side photos
    const baseZ = viewport.width < 5 ? 14 : 9;
    const zPos = isCelebrated ? baseZ + 4 : baseZ; 
    const yPos = isCelebrated ? 3 : (viewport.width < 5 ? 3 : 2);
    
    camera.position.set(0, yPos, zPos);
    camera.lookAt(0, isCelebrated ? 4 : 0, 0);
  }, [camera, viewport.width, isCelebrated]);

  const handleYes = () => {
    setIsOpen(false);
    setIsCelebrated(true);
  };

  return (
    <group>
      <color attach="background" args={['#100010']} />
      
      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Sparkles count={200} scale={[10, 10, 10]} size={5} speed={0.5} opacity={0.5} color="gold" />
      <ambientLight intensity={0.2} />
      
      <OrbitControls 
          enableZoom={false} 
          enablePan={false}  
          autoRotate={!isOpen} 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3} 
      />

      <Gazebo />

      {/* --- MEMORY RENDERING LOGIC --- */}
      {!isOpen && MEMORIES.map((url, i) => {
         // 1. SPIRAL (Center)
         const angle = (i / MEMORIES.length) * Math.PI * 2;
         const radius = viewport.width < 5 ? 2.8 : 3.5; 
         const spiralY = -1.5 + (i * 0.8);
         const spiralPos = [Math.cos(angle) * radius, spiralY, Math.sin(angle) * radius];
         const spiralRot = [0, -angle, 0];

         // 2. GALLERY (Sides)
         const isLeft = i % 2 === 0;
         // Push further out on desktop, closer on mobile
         const xDist = viewport.width < 5 ? 4.5 : 7; 
         const xOffset = isLeft ? -xDist : xDist; 
         const yOffset = 0 + ((i % 3) * 2.5); // Spread vertical
         const sidePos = [xOffset, yOffset, 0];
         const sideRot = [0, isLeft ? Math.PI / 3 : -Math.PI / 3, 0];

         // 3. Select Target
         const targetPos = isCelebrated ? sidePos : spiralPos;
         const targetRot = isCelebrated ? sideRot : spiralRot;

         const targetScale = isCelebrated ? 2 : 1; // Enlarge in gallery

         return (
            <FloatingMemory 
                key={i} 
                url={url} 
                targetPosition={targetPos}
                targetRotation={targetRot}
                isCelebrated={isCelebrated}
                targetScale={targetScale}
            />
         );
      })}

      {!isOpen && !isCelebrated && <LoveLetterButton onClick={() => setIsOpen(true)} />}

      {isCelebrated && <Celebration />}

      {isOpen && (
        <Html fullscreen style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div className="letter-container" style={{
                pointerEvents: 'auto',
                background: 'rgba(255, 250, 240, 0.46)',
                padding: '40px', 
                borderRadius: '10px',
                width: 'min(90%, 600px)',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 0 50px rgba(255, 0, 85, 0.5)',
                textAlign: 'center', 
                fontFamily: 'serif',
                position: 'relative', 
                animation: 'fadeIn 1s ease'
            }}>
                <button onClick={() => setIsOpen(false)} style={{
                        position: 'absolute', top: '10px', right: '15px',
                        background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#555'
                    }}>✖</button>

                <h1 style={{ color: '#ff0055', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '20px', lineHeight: '1.2' }}>
                    To My Valentine
                </h1>
                
                <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', lineHeight: '1.6', color: '#333', marginBottom: '30px' }}>
                    Every line of code I wrote for this, I wrote thinking of you.<br/><br/>
                    You are the CSS to my HTML,<br/>
                    The Logic to my Controller,<br/>
                    The Heart of my Life.<br/><br/>
                    I love you more than words (or code) can say.
                </p>

                <h2 style={{ fontFamily: 'cursive', color: '#8b0000', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '30px' }}>
                    Will you be my Valentine?
                </h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <button onClick={handleYes} style={{
                        padding: '12px 30px', background: '#ff0055', color: 'white',
                        border: 'none', borderRadius: '50px', fontSize: '1.2rem', cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(255,0,85,0.3)'
                    }}>YES!</button>
                    
                    <button onClick={() => setIsOpen(false)} style={{
                         padding: '12px 30px', background: '#ddd', color: '#555',
                         border: 'none', borderRadius: '50px', fontSize: '1.2rem', cursor: 'pointer'
                    }}>Replay Journey</button>
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </Html>
      )}

      {!isOpen && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
           <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'auto' }}>
               <button onClick={onBack} style={{
                   padding: '10px 20px', borderRadius: '20px', 
                   border: '1px solid white', background: 'rgba(0,0,0,0.5)', 
                   color: 'white', cursor: 'pointer'
               }}>Go Back</button>
           </div>
        </Html>
      )}

    </group>
  );
}