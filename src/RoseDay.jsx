import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sparkles, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- COMPONENT: The Rose Model with "Bud" Logic ---
function RoseModel({ bloomProgress, onClick }) {
  const { scene } = useGLTF('/3d/rose.glb'); 
  const roseRef = useRef();

  // Clone the scene
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (roseRef.current) {
      // 1. ANIME: Smoothly interpolate the current bloom state
      // We use a "lerp" helper to make the movement smooth, not choppy
      
      // Calculate target scales based on bloom progress (0.0 to 1.0)
      // BUD STATE (0%): Very thin (0.1), slightly short (0.5)
      // BLOOM STATE (100%): Full size (1.0, 1.0)
      const targetScaleX = 0.2 + (bloomProgress * 2.9); // Ends at 2.0
const targetScaleY = 0.5 + (bloomProgress * 2.5); // Ends at 2.0
const targetScaleZ = 0.1 + (bloomProgress * 2.9); // Ends at 2.0
      // Apply smoothness
      roseRef.current.scale.x = THREE.MathUtils.lerp(roseRef.current.scale.x, targetScaleX, delta * 2);
      roseRef.current.scale.y = THREE.MathUtils.lerp(roseRef.current.scale.y, targetScaleY, delta * 2);
      roseRef.current.scale.z = THREE.MathUtils.lerp(roseRef.current.scale.z, targetScaleZ, delta * 2);

      // 2. ROTATION: Spin faster when small, slow down when fully bloomed
      // If bloom is 0, spin speed is 2. If bloom is 1, spin speed is 0.5
      const spinSpeed = 2 - (bloomProgress * 1.5);
      roseRef.current.rotation.y += delta * spinSpeed;

      // 3. BOBBING: Gentle floating
      roseRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 - 2.5; // -0.5 to center it
    }
  });

  return (
    <primitive 
      ref={roseRef}
      object={clone} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      // Initial Scale (Start as a tiny bud)
      scale={[0.1, 0.5, 0.1]} 
      position={[0, -0.5, 0]} 
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    />
  );
}

// Preload
useGLTF.preload('/3d/rose.glb');

// --- COMPONENT: Particles ---
function PetalExplosion() {
    return (
        <group>
            {/* Red Petals */}
            <Sparkles count={100} scale={[4, 3, 5]} size={3} speed={0.4} opacity={1} color="#b375d1" />
            {/* Golden Magic Dust */}
            <Sparkles count={80} scale={[4, 3, 5]} size={5} speed={0.3} opacity={0.5} color="#d175c0" />
        </group>
    )
}

// --- MAIN EXPORT ---
export default function RoseDay({ onBack }) {
  const { camera, viewport } = useThree(); 
  const [bloom, setBloom] = useState(0); 
  const [isFinished, setIsFinished] = useState(false);

  // --- RESPONSIVE VALUES ---
  // Font scales based on screen width (clamped for readability)
  const responsiveMainFont = Math.max(0.3, Math.min(viewport.width * 0.08, 0.6));
  const responsiveButtonFont = Math.max(0.1, Math.min(viewport.width * 0.03, 0.2));

  // Position for the Back Button (Bottom-Right corner with margin)
  // viewport.width / 2 is the right edge; viewport.height / 2 is the bottom edge.
  const buttonX = viewport.width / 2 - (viewport.width * 0.18); 
  const buttonY = -viewport.height / 2 + (viewport.height * 0.15);

  useEffect(() => {
    camera.position.set(0, 0, 5); 
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const handleClick = () => {
    if (isFinished) return;
    const newBloom = Math.min(bloom + 0.2, 1);
    setBloom(newBloom);
    if (newBloom >= 0.95) setIsFinished(true);
  };

  return (
    <group>
        {/* SET BACKGROUND TO BLACK */}
        <color attach="background" args={['#000000']} />
        
        <Environment preset="sunset" />
        <pointLight position={[2, 3, 2]} intensity={20} color="#ffaaee" />
        <ambientLight intensity={0.5} />

        {/* RESPONSIVE TEXT: Positioned relative to screen top */}
        <Text 
            position={[0, viewport.height * 0.3, 0]} 
            fontSize={responsiveMainFont} 
            color={isFinished ? "#c5889c" : "white"}
            anchorX="center" 
            anchorY="middle"
            maxWidth={viewport.width * 0.8}
            textAlign="center"
        >
            {isFinished ? "Happy Rose Day" : "Tap the bud to make it bloom"}
        </Text>
        
        {isFinished && <PetalExplosion />}

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            <RoseModel bloomProgress={bloom} onClick={handleClick} />
        </Float>

        {/* RESPONSIVE BACK BUTTON: Positioned in bottom-right */}
        <group 
            position={[buttonX, buttonY, 1]} 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            onPointerOver={() => (document.body.style.cursor='pointer')} 
            onPointerOut={() => (document.body.style.cursor='auto')}
        >
            <Text fontSize={responsiveButtonFont} color="white">
                {isFinished ? "Continue Journey ->" : "Go Back"}
            </Text>
            <mesh>
                <planeGeometry args={[viewport.width * 0.3, viewport.height * 0.1]} />
                <meshBasicMaterial transparent opacity={0} /> 
            </mesh>
        </group>
    </group>
  );
}
