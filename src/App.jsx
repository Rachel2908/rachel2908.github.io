import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Sparkles, Float, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HubWorld from './HubWorld';
import RoseDay from './RoseDay'; 
import ProposeDay from './ProposeDay'; // <--- IMPORT THIS
import ChocolateDay from './ChocolateDay';
import TeddyDay from './TeddyDay'; // <--- IMPORT THIS
import PromiseDay from './PromiseDay'; // <--- IMPORT THIS
import HugDay from './HugDay';
import KissDay from './KissDay';
import ValentineDay from './ValentinesDay';
import {arch} from '../public/images/arch.png';
import {leftdoor} from '../public/images/leftdoor.png';
import {rightdoor} from '../public/images/rightdoor.png';

// ... [Keep CameraFlythrough, HeroDoor, ModelWrapper components EXACTLY as they are] ...
// (I am omitting them here to save space, but DO NOT delete them from your file)

// --- COMPONENT: Camera Flythrough ---
function CameraFlythrough({ start }) {
  const { camera } = useThree();
  const targetPosition = new THREE.Vector3(0, 2, -5); 
  const lookAtPosition = new THREE.Vector3(0, 2, -10); 

  useFrame((state, delta) => {
    if (start) {
      camera.position.lerp(targetPosition, 2 * delta);
      camera.lookAt(lookAtPosition);
    }
  });
  return null;
}

// --- COMPONENT: Hero Door ---
function HeroDoor({ onEnter, isOpen }) {
  const [hovered, setHovered] = useState(false);
  const archTexture = useTexture(`{import.meta.env.BASE_URL}images/arch.png`);
  const leftDoorTex = useTexture(`{import.meta.env.BASE_URL}images/leftdoor.png`);
  const rightDoorTex = useTexture(`{import.meta.env.BASE_URL}images/rightdoor.png`);
  const leftDoor = useRef();
  const rightDoor = useRef()

  useFrame(() => {
    const targetRotation = isOpen ? Math.PI / 1.5 : 0;
    if(leftDoor.current && rightDoor.current) {
        leftDoor.current.rotation.y = THREE.MathUtils.lerp(leftDoor.current.rotation.y, targetRotation, 0.05);
        rightDoor.current.rotation.y = THREE.MathUtils.lerp(rightDoor.current.rotation.y, -targetRotation, 0.05);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.8, -0.1]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={archTexture} transparent={true} alphaTest={0.5} />
      </mesh>
      <group position={[-2.2, 0.8, -0.2]} ref={leftDoor}>
        <mesh position={[1, 0, 0]}>
          <planeGeometry args={[2.9, 6.4]} />
          <meshStandardMaterial map={leftDoorTex} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>
      <group position={[2.3, 0.8, -0.2]} ref={rightDoor}>
        <mesh position={[-1, 0, 0]}>
          <planeGeometry args={[2.8, 6]} />
          <meshStandardMaterial map={rightDoorTex} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>
      {!isOpen && (
        <group 
            position={[0, 0, 0.5]} 
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onEnter}
        >
            <mesh position={[0, 0, 0]} scale={[1.4, 0.8, 1]}>
                <circleGeometry args={[0.6, 64]} />
                <meshBasicMaterial color="#644504" transparent={true} opacity={0.1} toneMapped={false} />
            </mesh>
            <Text
                position={[0, 0, 0.1]} 
                fontSize={0.25} 
                color={hovered ? "#521e86" : "gold"}
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                toneMapped={false}
            >
                ENTER
            </Text>
            <mesh visible={false} scale={[1.4, 0.8, 1]}>
                <circleGeometry args={[0.7]} />
            </mesh>
        </group>
      )}
    </group>
  );
}

// --- MODEL WRAPPER ---
useGLTF.preload('3d/tree_gn.glb');
useGLTF.preload('3d/tree.glb');
useGLTF.preload('3d/tree (1).glb');
useGLTF.preload('3d/plants.glb');
useGLTF.preload('3d/small_folliage_plant.glb');

function ModelWrapper({ path, position, scale, rotation }) {
  const { scene } = useGLTF(path);
  const clone = React.useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} position={position} scale={scale} rotation={rotation} />;
}


// --- MAIN APP ---
export default function App() {
  const [stage, setStage] = useState('start'); // 'start', 'flying', 'hub', 'rose', 'propose'

  const handleEnter = () => {
    setStage('flying');
    setTimeout(() => {
      setStage('hub');
    }, 2000);
  };

  const backgrounds = {
    start: 'linear-gradient(to bottom, #3c0176, #2d0060, #120031, black)',
    flying: 'linear-gradient(to bottom, #3c0176, #2d0060, #120031, black)',
    hub: 'linear-gradient(to bottom, #1a0033, #0d001a, black)',
    rose: 'linear-gradient(to bottom, #4a0404, #2a0202, black)', // Deep Red
    propose: 'linear-gradient(to bottom, #051020, #020814, black)', // Midnight Blue
    chocolate: 'linear-gradient(to bottom, #3d1d11,#1a0b05, #1a0b05,black, black)', // Warm Brown
    hug: 'linear-gradient(to bottom, #2e474a, #162525, #162525, #162525,black, black)', // Hug Teal
    kiss: 'linear-gradient(to bottom, #180130, #0a021a,#1a0202, black, black)', // Kiss Red
  };

  // Helper to determine if we should show backgrund trees
  // Hide trees if we are in a specific game mode
  const showBackground = stage !== 'rose' && stage !== 'propose' && stage !== 'chocolate' && stage !== 'teddy' && stage !== 'promise' && stage !== 'hug' && stage !== 'kiss' && stage !== 'valentine';

  return (
    <div style={{ 
      background: backgrounds[stage] || 'black', 
      width: '100vw', 
      height: '100vh',
      transition: 'background 1.5s ease' // Smooth transition between days!
    }}>
      <Canvas 
        gl={{ alpha: true, antialias: true }}  
        shadows 
        camera={{ position: [0, 2, 12], fov: 50 }} 
        dpr={[1, 2]}
      >
        <fog attach="fog" args={['#050208', 5, 30]} />
        
        {/* CAMERA LOGIC */}
        <CameraFlythrough start={stage === 'flying'} />

        {/* LIGHTING */}
        <pointLight position={[0, 3, 1]} intensity={10} color="#ffffff" distance={15} castShadow />
        <directionalLight position={[0, 10, -5]} intensity={1} color="#5577ff" />

        {/* --- STAGE 1: DOOR --- */}
        {(stage === 'start' || stage === 'flying') && (
            <HeroDoor onEnter={handleEnter} isOpen={stage === 'flying'} />
        )}
        
        {/* --- STAGE 2: HUB WORLD --- */}
        {stage === 'hub' && (
            <HubWorld 
                onEnterDay={(dayIndex) => {
                    if (dayIndex === 0) setStage('rose');
                    if (dayIndex === 1) setStage('propose'); // <--- ADDED PROPOSE DAY LINK
                    if(dayIndex === 2) setStage('chocolate'); // <--- ADDED CHOCOLATE DAY LINK
                    if(dayIndex === 3) setStage('teddy');
                    if(dayIndex === 4) setStage('promise');
                    if(dayIndex === 5) setStage('hug');
                    if(dayIndex === 6) setStage('kiss');
                    if(dayIndex === 7) setStage('valentine');
                }} 
            />
        )}

        {/* --- STAGE 3: ROSE DAY --- */}
        {stage === 'rose' && (
            <RoseDay onBack={() => setStage('hub')} />
        )}

        {/* --- STAGE 4: PROPOSE DAY --- */}
        {stage === 'propose' && (
            <ProposeDay onBack={() => setStage('hub')} />
        )}
       {/* --- STAGE 5: CHOCOLATE DAY --- */}
{stage === 'chocolate' && (
    <Suspense fallback={null}> 
        <ChocolateDay onBack={() => setStage('hub')} />
    </Suspense>
)}
        {/* --- STAGE 6: TEDDY DAY --- */}
        {stage === 'teddy' && (
            <TeddyDay onBack={() => setStage('hub')} />
        )}
        {/* --- STAGE 7: PROMISE DAY --- */}
        {stage === 'promise' && (
            <PromiseDay onBack={() => setStage('hub')} />
        )}
        {/* --- STAGE 8: HUG DAY --- */}
        {stage === 'hug' && (
            <HugDay onBack={() => setStage('hub')} />
        )}
        {/* --- STAGE 9: KISS DAY --- */}
        {stage === 'kiss' && (
            <KissDay onBack={() => setStage('hub')} />
        )}
        {/* --- STAGE 10: VALENTINE'S DAY --- */}
        {stage === 'valentine' && (
            <ValentineDay onBack={() => setStage('hub')} />
        )}

        
        {/* --- BACKGROUND TREES --- */}
        {showBackground && (
          <Suspense fallback={null}>
            <ModelWrapper path='3d/tree_gn.glb' position={[-9, 0, 0]} scale={0.35} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/tree.glb' position={[4, -3.5, -2]} scale={40} rotation={[0, 6, 0]} />
            <ModelWrapper path='3d/tree_gn.glb' position={[9, -2, -2]} scale={0.35} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/tree.glb' position={[-4, -3, -3]} scale={30} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/tree.glb' position={[5, -2, -5]} scale={35} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/tree.glb' position={[-10, -2.5, -4]} scale={35} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/tree (1).glb' position={[-6, -4, 5]} scale={0.01} rotation={[0, 0, 0]} />
            <ModelWrapper path='3d/tree (1).glb' position={[7, -3.5, 4]} scale={0.007} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/plants.glb' position={[-4.5, -2.5, -2]} scale={0.002} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/plants.glb' position={[2.8, -3, -1]} scale={0.002} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/plants.glb' position={[3.8, -2, -1]} scale={0.0013} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/plants.glb' position={[-2.8, -2.4, -2.5]} scale={0.001} rotation={[0, 1, 0]} />
            <ModelWrapper path='3d/small_folliage_plant.glb' position={[7, 1, -1]} scale={0.7} rotation={[0, 1, 0]} />
          </Suspense>
        )}
        
        {/* PARTICLES */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sparkles count={150} scale={[10, 10, 10]} size={4} speed={0.4} opacity={0.7} color="gold" />
            <Sparkles count={50} scale={[12, 8, 12]} size={6} speed={0.2} opacity={0.5} color="cyan" />
        </Float>

        {/* POST PROCESSING */}
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} intensity={1.5} levels={9} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
        
      </Canvas>
    </div>
  );
}
