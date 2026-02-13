import React, { useMemo, useRef , useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Text, Float, Line, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURATION ---
const LINE_POINTS = [
  new THREE.Vector3(0, 5, -4),   // Start (Just inside door)
  new THREE.Vector3(0, 2, -15),  // Rose Day
  new THREE.Vector3(-4, 2, -20), // Propose Day
  new THREE.Vector3(3, 2, -30),  // Chocolate Day
  new THREE.Vector3(-3, 2.5, -45), // Teddy Day
  new THREE.Vector3(2, 3, -55),  // Promise Day
  new THREE.Vector3(0, 3, -65),  // Hug Day
  new THREE.Vector3(-2, 3, -70), // Kiss Day
  new THREE.Vector3(0, 3.5, -80) // Valentine's Day
];

// Create the smooth curve
const CURVE = new THREE.CatmullRomCurve3(LINE_POINTS, false, 'catmullrom', 0.5);

// --- COMPONENT: Camera Handler (Moves camera on scroll) ---
function ScrollHandler() {
  const scroll = useScroll();
  const { camera } = useThree();
  
  useFrame(() => {
    // 1. Get point on curve based on scroll offset (0 to 1)
    // We limit the range slightly so we don't fall off the end
    const point = CURVE.getPointAt(scroll.offset * 0.95);
    
    // 2. Get a point slightly ahead to look at (tangent)
    const lookAtPoint = CURVE.getPointAt(Math.min(scroll.offset * 0.95 + 0.05, 1));

    // 3. Move camera
    camera.position.copy(point);
    camera.lookAt(lookAtPoint);
  });
  return null;
}

// --- COMPONENT: Visual Path (The glowing line) ---
function PathLine() {
  const points = useMemo(() => CURVE.getPoints(100), []);
  return (
    <group>
      {/* The visible glowing line */}
      <Line 
        points={points} 
        color="#b9096f" 
        lineWidth={3} 
        opacity={0.4} 
        transparent 
      />
      {/* Sparkles following the path */}
      {points.map((p, i) => i % 5 === 0 && (
         <Sparkles key={i} position={p} count={5} scale={3} size={4} color="gold" />
      ))}
    </group>
  );
}

// --- COMPONENT: Day Checkpoint ---
function Checkpoint({ position, label, onClick }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    // Rotate the orb slightly
    useFrame((state, delta) => {
        if(meshRef.current) {
            meshRef.current.rotation.y += delta;
            meshRef.current.rotation.z += delta * 0.5;
        }
    });

    // Change cursor only when hovering the ORB
    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setHovered(false);
        document.body.style.cursor = 'auto';
    };

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={position}>
                {/* 1. The Text (Not Clickable, purely visual) */}
                <Text 
                    position={[0, 1.2, 0]} 
                    fontSize={0.8} 
                    color="#ffd700" 
                    anchorX="center" 
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                    toneMapped={false}
                >
                    {label}
                </Text>
                
                {/* 2. The Interactive Orb */}
                <group 
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    scale={hovered ? 1.5 : 1} // Scale up on hover
                >
                    {/* The Visible Glowing Sphere */}
                    <mesh ref={meshRef}>
                        <icosahedronGeometry args={[0.3, 2]} />
                        <meshStandardMaterial 
                            color={hovered ? "#00ffff" : "#ff0055"} 
                            emissive={hovered ? "#00ffff" : "#ff0055"} 
                            emissiveIntensity={hovered ? 5 : 2} 
                            roughness={0.2}
                            metalness={1}
                        />
                    </mesh>

                    {/* The Invisible Hit Box (Larger area for easier clicking) */}
                    <mesh visible={false}>
                        <sphereGeometry args={[0.8, 16, 16]} />
                        <meshBasicMaterial />
                    </mesh>
                </group>

                {/* 3. Outer Ring (Decorative) */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.45, 32]} />
                    <meshBasicMaterial color="white" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </Float>
    );
}

// --- MAIN HUB WORLD COMPONENT ---
export default function HubWorld({ onEnterDay }) {
  const days = [
    "Start", "Rose Day", "Propose Day", "Chocolate Day", 
    "Teddy Day", "Promise Day", "Hug Day", "Kiss Day", "Valentine's Day"
  ];

  return (
    <ScrollControls pages={8} damping={0.3}>
      <ScrollHandler />
      <PathLine />

      {LINE_POINTS.map((pos, i) => {
          if (i === 0) return null; // Skip "Start" point
          
          return (
            <Checkpoint 
                key={i} 
                position={[pos.x + 1.5, pos.y, pos.z]} 
                label={days[i]} 
                onClick={() => onEnterDay(i - 1)} 
            />
          );
      })}
    </ScrollControls>
  );
}