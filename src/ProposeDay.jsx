import React, { useState, useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import { 
  Text, 
  useGLTF, 
  MeshTransmissionMaterial, 
  Environment, 
  Float, 
  Sparkles, 
  useAnimations,
  Html,
  MeshDistortMaterial
} from '@react-three/drei';
import { useSpring, config, animated } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

// --- COMPONENT: Magical Water ---
// function LakeWater() {
//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
//       <planeGeometry args={[100, 100, 64, 64]} />
//       {/* MeshDistortMaterial creates the rippling liquid effect */}
//       <MeshDistortMaterial
//         color="#004c8b"
//         speed={2}
//         distort={0.8}
//         radius={1}
//         roughness={0.5}
//         metalness={0.8}
//       />
//     </mesh>
//   );
// }

function LakeWater() {
    const { scene, animations } = useGLTF('/3d/wave-v1.glb');
    const { actions } = useAnimations(animations, scene);
    const waveRef = useRef();

    // 1. Play the animation on mount
    useEffect(() => {
    const animationNames = Object.keys(actions);
    if (actions && animationNames.length > 0) {
        const action = actions[animationNames[0]];
        
        // Use the built-in method instead of direct assignment
        action.setEffectiveTimeScale(0.3); 
        
        // Optional: Ensure it transitions smoothly
        action.fadeIn(0.4).play();
    }
}, [actions]);

    return (
        <primitive 
            ref={waveRef} 
            object={scene} 
            // 2. Hard-set a lower position. If 0 is top, try -5 or -10
            position={[0, -8, 0]} 
            scale={[2, 2, 2]} 
        />
    );
}

useGLTF.preload('/3d/wave-v1.glb');

// --- COMPONENT: The Bottle & Cork ---
function MessageBottle({ onOpen, isOpen }) {
  const { viewport } = useThree();
  // Responsive Scale: smaller on mobile
  const scale = Math.min(viewport.width * 0.15, 1); 

  // --- CORK LOGIC ---
  // We use react-spring to handle the cork's position physics
  const [{ position }, api] = useSpring(() => ({
    position: [0, 1.6, 0], 
    config: { mass: 1, tension: 170, friction: 26 }
  }));

  // useDrag hook to handle mouse/touch interaction
  const bind = useDrag(({ offset: [, y], down, velocity: [, vy] }) => {
    // If dragging, follow mouse Y. If released (down=false), check if pulled enough
    
    // Threshold to open: Pulling UP (negative Y in 2D, but we map to 3D)
    const isPulledOut = y < -100; // Dragged up significantly

    if (down) {
      // While dragging, move cork up (clamp so it doesn't go down into bottle)
      api.start({ position: [0, 1.6 + Math.max(0, -y * 0.01), 0] });
    } else {
      if (isPulledOut && !isOpen) {
        // SUCCESS: Pop the cork!
        api.start({ position: [0, 8, 0], config: { velocity: vy } }); // Fly away
        onOpen();
      } else if (!isOpen) {
        // FAILURE: Snap back to bottle
        api.start({ position: [0, 1.6, 0] });
      }
    }
  }, { from: () => [0, position.get()[1] * -100] });

  // --- PAPER SCROLL LOGIC ---
  const { paperY, paperScale } = useSpring({
    paperY: isOpen ? 2 : 0,
    paperScale: isOpen ? 1 : 0,
    config: config.molasses,
    delay: 500 // Wait for cork to fly before paper moves
  });

  return (
    <group scale={scale}>
      
      {/* 1. GLASS BOTTLE BODY */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        {/* <MeshTransmissionMaterial 
          backside 
          thickness={0.5} 
          roughness={0} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.4} 
          color="#8ecdf7" 
        /> */}
        <meshPhongMaterial 
    color="#915205" 
    transparent={true} 
    opacity={0.5} // Adjust for how see-through you want it
    shininess={10} // Low value reduces "plastic" highlights
  />
      </mesh>
      {/* Bottle Neck */}
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.5, 32]} />
        {/* <MeshTransmissionMaterial 
          backside 
          thickness={0.5} 
          roughness={0} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.4} 
          color="#aaddff" 
        /> */}
        <meshPhongMaterial 
    color="#a98c68" 
    transparent={true} 
    opacity={0.5} // Adjust for how see-through you want it
    shininess={10} // Low value reduces "plastic" highlights
  />
      </mesh>

      {/* 2. THE CORK (Draggable) */}
      <animated.mesh {...bind()} position={position}>
        <cylinderGeometry args={[0.25, 0.2, 0.4, 32]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.9} />
      </animated.mesh>

      {/* 3. THE SCROLL (Hidden Inside) */}
      <animated.group position-y={paperY} scale={paperScale}>
         {/* Rolled Paper Mesh */}
         <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.1, 0.1, 1.5, 32]} />
            <meshStandardMaterial color="#fdf4dc" />
         </mesh>
      </animated.group>

    </group>
  );
}

// --- COMPONENT: The UI (Question + Runaway Button) ---
function ProposeUI({ visible, onYes }) {
  const [noBtnPosition, setNoBtnPosition] = useState({ top: '60%', left: '60%' });
  
  if (!visible) return null;

  const moveButton = () => {
    const randomX = Math.random() * 80 + 10; // 10% to 90%
    const randomY = Math.random() * 80 + 10;
    setNoBtnPosition({ top: `${randomY}%`, left: `${randomX}%` });
  };

  return (
    <Html fullscreen style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="scroll-container" style={{
        width: 'min(90%, 500px)',
        height: 'min(80%, 600px)',
        background: 'url("/images/paper.jpg")', // Old paper texture
        backgroundSize: 'cover',
        borderRadius: '10px',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'serif',
        pointerEvents: 'auto', // Re-enable clicks
        animation: 'fadeIn 1s ease-out'
      }}>
        <h2 style={{ color: '#5c3a21', fontSize: '2rem', marginBottom: '20px' }}>
          My Dearest...
        </h2>
        <p style={{ color: '#3e2714', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px' }}>
          In a world of variables, you are my only constant. <br/>
          My love for you grows exponentially every day.
        </p>
        <h1 style={{ color: '#8b0000', fontSize: '2.5rem', marginBottom: '40px' }}>
          Will you be mine?
        </h1>

        <div style={{ position: 'relative', width: '100%', height: '100px' }}>
          {/* YES BUTTON */}
          <button 
            onClick={onYes}
            style={{
              position: 'absolute',
              top: '50%', left: '30%', transform: 'translate(-50%, -50%)',
              padding: '15px 40px', fontSize: '1.5rem',
              background: '#59ff00', color: 'white', border: 'none', borderRadius: '50px',
              cursor: 'pointer', boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)'
            }}
          >
            YES!
          </button>

          {/* NO BUTTON (RUNS AWAY) */}
          <button 
            onMouseEnter={moveButton}
            onClick={moveButton} // For mobile touch
            style={{
              position: 'absolute',
              top: noBtnPosition.top, left: noBtnPosition.left, transform: 'translate(-50%, -50%)',
              padding: '15px 40px', fontSize: '1.5rem',
              background: '#de1600', color: 'white', border: 'none', borderRadius: '50px',
              cursor: 'pointer', transition: 'top 0.2s, left 0.2s' // Smooth movement
            }}
          >
            No
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Html>
  );
}

// --- MAIN EXPORT ---
export default function ProposeDay({ onBack }) {
      const { camera, viewport } = useThree();
  const [isOpen, setIsOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [sheSaidYes, setSheSaidYes] = useState(false);
const responsiveMainFont = Math.max(0.3, Math.min(viewport.width * 0.08, 0.3));
  // Initial Camera Setup
  useEffect(() => {
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const handleOpen = () => {
    setIsOpen(true);
    // Show letter after cork flies off and scroll animates up
    setTimeout(() => {
        setShowLetter(true);
    }, 1500);
  };

  return (
    <group>
      <color attach="background" args={['#051020']} />
      <Environment preset="night" />
      
      {/* Lights */}
      <pointLight position={[5, 10, 5]} intensity={5} color="#24abff" />
      <pointLight position={[-5, 5, -5]} intensity={2} color="#ff0088" />
      <ambientLight intensity={0.4} />

      {/* Instructions */}
      {!isOpen && (
        <Html position={[0, 3, 0]} center>
          <div style={{ 
            color: 'white', textShadow: '0 0 10px cyan', fontFamily: 'sans-serif', 
            fontSize: '1.5rem', pointerEvents: 'none', width: '300px', textAlign: 'center' 
          }}>
            Pull the cork to open...
          </div>
        </Html>
      )}

      {/* The Floating Bottle */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <MessageBottle onOpen={handleOpen} isOpen={isOpen} />
      </Float>

      {/* The Lake */}
      <LakeWater />

      {/* Particles */}
      <Sparkles count={100} scale={[10, 5, 10]} size={6} speed={0.4} opacity={0.5} color="#44ffaa" />

      {/* The UI Overlay */}
      <ProposeUI visible={showLetter && !sheSaidYes} onYes={() => setSheSaidYes(true)} />

      {/* SUCCESS STATE */}
      {sheSaidYes && (
        <>
            <Sparkles count={250} scale={[10, 10, 10]} size={6} speed={1} color="gold" alphaTest={0.5} />
            <Html center>
                <div style={{ 
                    color: 'gold', fontSize: '4rem', fontFamily: 'serif', 
                    textShadow: '0 0 20px #ff0055', textAlign: 'center' 
                }}>
                    He said YES! ❤️ <br/>
                    <span style={{
            fontSize: 'min(4vw, 1.8rem)', // Increased size
            color: 'white',
            whiteSpace: 'nowrap', // Forces text to stay on one line
            display: 'block',     // Keeps it below the "YES" text
            marginTop: '10px'
          }}>
              You are my forever.
          </span>
                </div>
            </Html>
        </>
      )}

      {/* Back Button */}
      <group 
            position={[0, -1.8, 1]} 
            onClick={(e) => { e.stopPropagation(); onBack(); }} 
            onPointerOver={() => document.body.style.cursor='pointer'} 
            onPointerOut={() => document.body.style.cursor='auto'}
      >
          <Text fontSize={responsiveMainFont} color="white">
              {sheSaidYes ? "Continue Journey ->" : "Go Back"}
          </Text>
          <mesh position={[0, 0, 0]}>
              <planeGeometry args={[4, 1]} />
              <meshBasicMaterial transparent opacity={0} /> 
          </mesh>
      </group>
    </group>
  );
}