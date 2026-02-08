import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Html, 
  Environment, 
  Sparkles, 
  Float ,
  ContactShadows,
  useTexture,
  useGLTF 
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// --- COMPONENT: Responsive Camera Adjuster ---
// Adjusts camera distance based on screen width (Mobile vs Desktop)
function ResponsiveCamera() {
  const { camera, size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
    // Move camera back on mobile to fit the door in frame
    const targetZ = isMobile ? 14 : 10;
    camera.position.lerp(new THREE.Vector3(0, 2, targetZ), 0.05);
    camera.lookAt(0, 3, 0); // Look at the center of the door
  });
  return null;
}

// --- COMPONENT: The Door & Enter Button ---
function HeroDoor() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // 1. Load both separate textures
  const archTexture = useTexture('/arch.png');
  const leftDoorTex = useTexture('/leftdoor.png');
  const rightDoorTex = useTexture('/rightdoor.png');

  const leftDoor = useRef();
  const rightDoor = useRef();

  const toggleDoor = () => setIsOpen(!isOpen);

  useFrame(() => {
    const targetRotation = isOpen ? Math.PI / 1.5 : 0;
    leftDoor.current.rotation.y = THREE.MathUtils.lerp(leftDoor.current.rotation.y, targetRotation, 0.05);
    rightDoor.current.rotation.y = THREE.MathUtils.lerp(rightDoor.current.rotation.y, -targetRotation, 0.05);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* THE ARCHWAY */}
      <mesh position={[0, 3, -0.1]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={archTexture} transparent={true} alphaTest={0.5} />
      </mesh>

      {/* LEFT DOOR - Pivots at x: -2 */}
      <group position={[-2.2, 3, -0.2]} ref={leftDoor}>
        <mesh position={[1, 0, 0]}>
          <planeGeometry args={[2.9, 6.4]} />
          <meshStandardMaterial map={leftDoorTex} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>

      {/* RIGHT DOOR - Pivots at x: 2 */}
      <group position={[2.3, 3, -0.2]} ref={rightDoor}>
        <mesh position={[-1, 0, 0]}>
          <planeGeometry args={[2.8, 6]} />
          <meshStandardMaterial map={rightDoorTex} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>

      {/* INTERACTIVE BUTTON */}
      <group 
        position={[0, 3, 0.5]} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={toggleDoor}
      >
        <mesh>
          <ringGeometry args={[0.6, 0.7, 10]} />
          {/* <meshBasicMaterial color={hovered ? "cyan" : "gold"} toneMapped={false} /> */}
        </mesh>
        <Text
          fontSize={0.25}
          color={hovered ? "cyan" : "gold"}
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {isOpen ? "CLOSE" : "ENTER"}
        </Text>
      </group>
    </group>
  );
}


function BigTreeModel({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/tree_gn.glb');
  
  // Memoize the clone so it doesn't re-calculate every frame
  const clone = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}

// Preload the model once outside the component for better performance
useGLTF.preload('/tree_gn.glb');

function PinkTreeModel({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/tree.glb');
  
  // Memoize the clone so it doesn't re-calculate every frame
  const clone = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}

// Preload the model once outside the component for better performance
useGLTF.preload('/tree.glb');

function TreeModel({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/tree (1).glb');
  
  // Memoize the clone so it doesn't re-calculate every frame
  const clone = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}

// Preload the model once outside the component for better performance
useGLTF.preload('/tree (1).glb');

function PlantsModel({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/plants.glb');
  
  // Memoize the clone so it doesn't re-calculate every frame
  const clone = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}

// Preload the model once outside the component for better performance
useGLTF.preload('/plants.glb');

function SmallPlantsModel({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/small_folliage_plant.glb');
  
  // Memoize the clone so it doesn't re-calculate every frame
  const clone = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive 
      object={clone} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}

// Preload the model once outside the component for better performance
useGLTF.preload('/small_folliage_plant.glb');

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <div style={{  backgroundColor: '#2f0081' }}>
      {/* Shadows enabled. 
        dpr={[1, 2]} caps pixel ratio for performance on high-res mobile screens.
      */}
      <Canvas style={{ background: 'linear-gradient(to bottom, #3c0176, #2d0060, #120031, black,black,black,black)', width: '100vw',
    height: '100vh' }} gl={{ alpha: true, antialias: true }}  shadows camera={{ position: [0, 2, 12], fov: 50 }} dpr={[1, 2]}>
        <ResponsiveCamera />

        

        {/* THE HERO LIGHT: Warm light emanating from the door */}
        <pointLight 
            position={[0, 3, 1]} 
            intensity={10} // High intensity for the glow
            color="#ffffff" 
            distance={15} 
            castShadow 
            shadow-mapSize={[1024, 1024]} // Better shadow quality
        />
        {/* Rim light from above to catch edges of trees */}
        <directionalLight position={[0, 10, -5]} intensity={1} color="#5577ff" />


        {/* 2. SCENE CONTENT */}
        <HeroDoor />
        <Suspense fallback={null}>
          <BigTreeModel position={[-9, 2.5, -3.5]} scale={0.35} rotation={[0, 1, 0]} />
          <BigTreeModel position={[8.5, 1.5, -2]} scale={0.35} rotation={[0, 1, 0]} />
          
{/* <MoonModel position={[9, 2.5, 3.5]} scale={0.3} rotation={[0, 1, 0]}/> */}

          <PinkTreeModel position={[4, 1, -2]} scale={40} rotation={[0, 6, 0]} />
          <PinkTreeModel position={[-4, -0.5, 2]} scale={35} rotation={[0, 1, 0]} />
          <PinkTreeModel position={[2.5, -0.5, -5]} scale={35} rotation={[0, 1, 0]} />
<PinkTreeModel position={[-2.5, -0.5, -4]} scale={35} rotation={[0, 1, 0]} />


          <TreeModel position={[-5, -2.5, 5]} scale={0.01} rotation={[0, 1, 0]} />
          <TreeModel position={[6, -1.5, 4]} scale={0.007} rotation={[0, 1, 0]} />

          <PlantsModel position={[-3, -0.1, 3]} scale={0.002} rotation={[0, 1, 0]} />
          <PlantsModel position={[3.5, 1.2, -1]} scale={0.002} rotation={[0, 1, 0]} />
          <PlantsModel position={[2.6, 1.4, -1]} scale={0.0013} rotation={[0, 1, 0]} />
          <PlantsModel position={[-2.8, 0.12, -2.5]} scale={0.002} rotation={[0, 1, 0]} />

          <SmallPlantsModel position={[7, 1, -1]} scale={0.7} rotation={[0, 1, 0]} />
        </Suspense>
        
       
        {/* 3. THE "LIFE" (Butterflies/Fireflies) */}
        {/* Float makes them gently Bob up and down */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            {/* Sparkles component is much faster than individual meshes */}
            <Sparkles 
                count={150} 
                scale={[10, 10, 10]} // The area they cover
                size={4} 
                speed={0.4} 
                opacity={0.7}
                color="gold"
            />
             {/* Add another layer for varied colors */}
            <Sparkles 
                count={50} 
                scale={[12, 8, 12]}
                size={6} 
                speed={0.2} 
                opacity={0.5}
                color="cyan"
            />
        </Float>


        {/* 4. POST PROCESSING (Making it glow) */}
        <EffectComposer disableNormalPass>
            {/* Bloom makes the light source and the "ENTER" text glow */}
            <Bloom 
                luminanceThreshold={1} // Only very bright things glow
                intensity={1.5} 
                levels={9} 
                mipmapBlur 
            />
            {/* Vignette darkens the corners to focus on the door */}
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Temporary controls for debugging - remove for final site */}
        {/* <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI/3} /> */}
      </Canvas>
    </div>
  );
}