import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html, Float, Sparkles, Environment, Torus } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

// --- ASSETS: PROCEDURAL CANDIES (Placeholders for 3D Models) ---
// If you have GLBs, replace these meshes with <primitive object={scene} />

const HeartShape = (props) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const x = 0, y = 0;
    s.moveTo(x + 0.5, y + 0.5);
    s.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    s.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    s.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    s.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    s.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    s.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    return s;
  }, []);

  return (
    <mesh {...props} rotation={[0, 0, Math.PI]} scale={0.5}>
      <extrudeGeometry args={[shape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1 }]} />
      <meshStandardMaterial color="#ff0055" roughness={0.2} metalness={0.5} />
    </mesh>
  );
};

const Truffle = (props) => (
  <mesh {...props}>
    <dodecahedronGeometry args={[0.4, 0]} />
    <meshStandardMaterial color="#5c3a21" roughness={0.6} />
  </mesh>
);

const BitterBerry = (props) => (
  <mesh {...props}>
    <icosahedronGeometry args={[0.4, 1]} />
    {/* Wireframe makes it look spiky/dangerous */}
    <meshStandardMaterial color="#4b0082" wireframe /> 
  </mesh>
);

// --- COMPONENT: Falling Object ---
function FallingItem({ id, type, position, onCaught, onMiss }) {
  const rigidRef = useRef();
  const [caught, setCaught] = useState(false);

  // Remove if it falls too far (Missed)
  useFrame(() => {
    if (rigidRef.current) {
      const y = rigidRef.current.translation().y;
      if (y < -6) onMiss(id);
    }
  });

  return (
    <RigidBody 
      ref={rigidRef} 
      position={position} 
      colliders="hull" 
      restitution={0.5} // Bounciness
      sensor // Detect collision but don't physically block the basket
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject && other.rigidBodyObject.name === "basket") {
          if (!caught) {
            setCaught(true);
            onCaught(id, type);
          }
        }
      }}
    >
      {type === 'heart' && <HeartShape />}
      {type === 'truffle' && <Truffle />}
      {type === 'berry' && <BitterBerry />}
    </RigidBody>
  );
}

// --- COMPONENT: The Basket (Player) ---
function Basket() {
  const { viewport, mouse } = useThree();
  const api = useRef();

  useFrame((state) => {
    // Map mouse X (-1 to 1) to viewport width
    const x = (state.mouse.x * viewport.width) / 2;
    // Keep Y fixed at bottom
    if (api.current) {
      api.current.setNextKinematicTranslation({ x: x, y: -3.5, z: 0 });
    }
  });

  return (
    <RigidBody 
      ref={api} 
      type="kinematicPosition" 
      colliders={false} 
      name="basket"
    >
      {/* The Visual Basket */}
      <group>
        <Torus args={[0.8, 0.1, 16, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="gold" />
        </Torus>
        <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.5, 1, 32]} />
            <meshStandardMaterial color="#8b4513" transparent opacity={0.8} />
        </mesh>
      </group>
      
      {/* The invisible collider that catches items */}
      <CuboidCollider args={[1, 0.5, 1]} sensor />
    </RigidBody>
  );
}

// --- COMPONENT: Game Manager (Spawns items) ---
function GameManager({ onScoreUpdate, isGameActive }) {
  const { viewport } = useThree();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9);
      // Random X position within screen width
      const x = (Math.random() - 0.5) * viewport.width * 0.8;
      
      // Determine type (20% berry, 30% heart, 50% truffle)
      const rand = Math.random();
      let type = 'truffle';
      if (rand > 0.8) type = 'berry';
      else if (rand > 0.5) type = 'heart';

      setItems((prev) => [...prev, { id, type, position: [x, 6, 0] }]);
    }, 800); // Spawn every 800ms

    return () => clearInterval(interval);
  }, [viewport, isGameActive]);

  const handleCatch = (id, type) => {
    // Remove item from scene
    setItems((prev) => prev.filter((i) => i.id !== id));
    // Update score
    onScoreUpdate(type);
  };

  const handleMiss = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <>
      {items.map((item) => (
        <FallingItem 
          key={item.id} 
          {...item} 
          onCaught={handleCatch} 
          onMiss={handleMiss} 
        />
      ))}
    </>
  );
}

// --- MAIN EXPORT ---
export default function ChocolateDay({ onBack }) {
    const {camera} = useThree();
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const [message, setMessage] = useState("Catch the Hearts!");

    useEffect(() => {
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
    }, [camera]);

 const handleScore = (type) => {
  if (gameState === 'won') return;

  let newScore = score;
  if (type === 'heart') {
    newScore = Math.min(score + 1, 10);
    setMessage("Sweet! +1");
    // Check victory immediately here instead of useEffect
    if (newScore >= 10) setGameState('won'); 
  } else if (type === 'berry') {
    newScore = Math.max(0, score - 2);
    setMessage("Ouch! Bitter! -2");
  } else if (type === 'truffle') {
    setMessage("Yum!");
  }
  setScore(newScore);
};
  return (
    <group>
      <Environment preset="city" />
      <ambientLight intensity={1} />
      <pointLight position={[5, 5, 5]} intensity={2}/>

      {/* BACKGROUND PARTICLES */}
      <Sparkles count={100} scale={[10, 10, 10]} size={4} speed={0.2} opacity={0.5} color="brown" />

      {/* PHYSICS WORLD */}
      <Physics gravity={[0, -5, 0]}>
        <Basket />
        <GameManager 
            isGameActive={gameState === 'playing'} 
            onScoreUpdate={handleScore} 
        />
      </Physics>

      {/* UI OVERLAY */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div style={{ 
            width: '100%', height: '100%', 
            display: 'flex', flexDirection: 'column', 
            justifyContent: 'space-between', padding: '20px' 
        }}>
            
            {/* TOP BAR: SCORE */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ 
                    fontFamily: 'serif', color: '#5c3a21', 
                    textShadow: '0 0 5px white', margin: 0 
                }}>
                    Chocolate Day
                </h1>
                
                {/* SWEETNESS METER */}
                <div style={{ 
                    width: '300px', height: '20px', 
                    background: 'rgba(255,255,255,0.5)', 
                    borderRadius: '10px', marginTop: '10px',
                    border: '2px solid #5c3a21', overflow: 'hidden'
                }}>
                    <div style={{ 
                        width: `${(score / 10) * 100}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #ff9a9e 0%, #ff0055 100%)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                <p style={{ color: '#5c3a21', fontWeight: 'bold' }}>{message}</p>
            </div>

                        {/* VICTORY SCREEN */}
            {gameState === 'won' && (
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center', pointerEvents: 'auto',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '40px', borderRadius: '20px',
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                }}>
                    <h1 style={{ fontSize: '3rem', color: '#ff0055', margin: '0' }}>
                        Sweet Victory! 🍫
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#5c3a21', marginBottom: '20px' }}>
                        You've filled the sweetness meter!
                    </p>
                    <button 
                        onClick={onBack}
                        style={{
                            padding: '10px 30px', fontSize: '1.2rem',
                            background: '#5c3a21', color: 'white',
                            border: 'none', borderRadius: '50px', cursor: 'pointer'
                        }}
                    >
                        Continue Journey
                    </button>
                </div>
            )}

            {/* BOTTOM BAR: BACK BUTTON (ONLY IF NOT WON) */}
            {gameState !== 'won' && (
                <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
                    <button 
                        onClick={onBack}
                        style={{
                            background: 'none', border: '1px solid #5c3a21',
                            color: '#5c3a21', padding: '5px 15px', borderRadius: '20px',
                            cursor: 'pointer', marginBottom: '20px'
                        }}
                    >
                        ← Go Back
                    </button>
                </div>
            )}
        </div>
      </Html>
    </group>
  );
}
