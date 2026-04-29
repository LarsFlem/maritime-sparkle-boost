import { useRef, Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Ship, Waves } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

// SOV Hull - Ulstein X-BOW inspired design (bridge forward, open deck aft)
const SOVHull = () => {
  const groupRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Mesh>(null);
  const gangwayRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.005;
    }
    // Rotate radar
    if (radarRef.current) {
      radarRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
    // Slight gangway sway
    if (gangwayRef.current) {
      gangwayRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
    }
  });

  // X-BOW hull shape - inverted bow profile
  const hullShape = useMemo(() => {
    const shape = new THREE.Shape();
    // SOV hull - wider beam, X-BOW front
    shape.moveTo(0, -2.2); // stern
    shape.lineTo(0.42, -2.2);
    shape.bezierCurveTo(0.44, -2.0, 0.44, -1.5, 0.44, -1.0);
    shape.bezierCurveTo(0.44, 0, 0.44, 1.0, 0.42, 1.5);
    // X-BOW taper - sharper, more vertical bow
    shape.bezierCurveTo(0.38, 1.8, 0.28, 2.2, 0.12, 2.6);
    shape.bezierCurveTo(0.04, 2.8, 0, 2.9, 0, 2.9);
    // Mirror side
    shape.bezierCurveTo(0, 2.9, -0.04, 2.8, -0.12, 2.6);
    shape.bezierCurveTo(-0.28, 2.2, -0.38, 1.8, -0.42, 1.5);
    shape.bezierCurveTo(-0.44, 1.0, -0.44, 0, -0.44, -1.0);
    shape.bezierCurveTo(-0.44, -1.5, -0.44, -2.0, -0.42, -2.2);
    shape.lineTo(0, -2.2);
    return shape;
  }, []);

  const hullExtrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.06,
    bevelSegments: 4,
  }), []);

  const hullColor = "#1e3045";
  const superstructureColor = "#e6e9ed";
  const superstructureAccent = "#d1d5db";
  const windowColor = "#1e88e5";
  const deckColor = "#6b7280";

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 2, 0]} scale={[1.0, 1.0, 1.0]}>

      {/* ====== MAIN HULL ====== */}
      <mesh position={[0, -0.15, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[hullShape, hullExtrudeSettings]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Boot-top waterline band — extruded from the same hull profile, scaled
          slightly outward in the beam so it shows as a clean stripe that
          tapers to nothing at the bow tip. */}
      <mesh position={[0, -0.13, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.025, 1, 1]}>
        <extrudeGeometry args={[hullShape, { steps: 1, depth: 0.04, bevelEnabled: false }]} />
        <meshStandardMaterial color="#b91c1c" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Deck surface */}
      <mesh position={[0, 0.22, 0]} scale={[0.82, 0.02, 4.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={deckColor} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* ====== SUPERSTRUCTURE / BRIDGE (FORWARD) ====== */}
      {/* SOV has bridge at front - main accommodation block */}
      
      {/* Accommodation block - Level 1 */}
      <mesh position={[0, 0.4, 1.4]}>
        <boxGeometry args={[0.72, 0.32, 1.2]} />
        <meshStandardMaterial color={superstructureColor} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Accommodation block - Level 2 */}
      <mesh position={[0, 0.68, 1.45]}>
        <boxGeometry args={[0.68, 0.26, 1.1]} />
        <meshStandardMaterial color={superstructureColor} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Bridge deck - Level 3 (wider view) */}
      <mesh position={[0, 0.92, 1.5]}>
        <boxGeometry args={[0.72, 0.22, 0.9]} />
        <meshStandardMaterial color={superstructureAccent} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Bridge top / wheelhouse - Level 4 */}
      <mesh position={[0, 1.1, 1.55]}>
        <boxGeometry args={[0.6, 0.16, 0.65]} />
        <meshStandardMaterial color="#f0f2f5" metalness={0.35} roughness={0.45} />
      </mesh>

      {/* ===== Bridge windows - panoramic ===== */}
      {/* Front windows */}
      <mesh position={[0, 0.95, 1.96]}>
        <boxGeometry args={[0.62, 0.14, 0.01]} />
        <meshStandardMaterial color={windowColor} emissive="#1565c0" emissiveIntensity={0.35} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Bridge top front windows */}
      <mesh position={[0, 1.12, 1.88]}>
        <boxGeometry args={[0.5, 0.1, 0.01]} />
        <meshStandardMaterial color={windowColor} emissive="#1565c0" emissiveIntensity={0.35} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Side windows - rows */}
      {[0.365, -0.365].map((x, i) => (
        <group key={`windows-${i}`}>
          {/* Level 2 windows */}
          {[1.2, 1.4, 1.6, 1.8].map((z, j) => (
            <mesh key={`w2-${j}`} position={[x, 0.68, z]}>
              <boxGeometry args={[0.01, 0.1, 0.12]} />
              <meshStandardMaterial color={windowColor} emissive="#1565c0" emissiveIntensity={0.2} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Level 1 windows */}
          {[1.0, 1.2, 1.4, 1.6, 1.8].map((z, j) => (
            <mesh key={`w1-${j}`} position={[x, 0.42, z]}>
              <boxGeometry args={[0.01, 0.08, 0.1]} />
              <meshStandardMaterial color={windowColor} emissive="#1565c0" emissiveIntensity={0.15} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Bridge side windows */}
          <mesh position={[x, 0.95, 1.5]}>
            <boxGeometry args={[0.01, 0.14, 0.7]} />
            <meshStandardMaterial color={windowColor} emissive="#1565c0" emissiveIntensity={0.3} metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* ===== MAST & RADAR on top of bridge ===== */}
      <mesh position={[0, 1.35, 1.55]}>
        <cylinderGeometry args={[0.015, 0.02, 0.35, 6]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Radar spinning dish */}
      <mesh ref={radarRef} position={[0, 1.5, 1.55]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.008, 0.25, 0.04]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Second radar */}
      <mesh position={[0, 1.42, 1.55]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
        <boxGeometry args={[0.006, 0.18, 0.03]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Antenna array */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={`ant-${i}`} position={[x, 1.58, 1.55]}>
          <cylinderGeometry args={[0.003, 0.003, 0.12, 4]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* ====== W2W MOTION-COMPENSATED GANGWAY ====== */}
      <group ref={gangwayRef} position={[0, 0, 0.1]}>
        {/* Base turntable */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.05, 10]} />
          <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Lower tower — tapered cylinder */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.13, 0.19, 0.52, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Upper tower box */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.22, 0.3, 0.22]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Slewing ring */}
        <mesh position={[0, 1.07, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.06, 10]} />
          <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Inner arm section (starboard / local +X) */}
        <mesh position={[0.28, 1.03, 0]}>
          <boxGeometry args={[0.42, 0.1, 0.13]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Outer telescoping arm */}
        <mesh position={[0.65, 1.0, 0]}>
          <boxGeometry args={[0.38, 0.08, 0.1]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.45} roughness={0.45} />
        </mesh>
        {/* Landing platform at tip */}
        <mesh position={[0.88, 0.96, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.22]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Walkway grating */}
        <mesh position={[0.55, 0.94, 0]}>
          <boxGeometry args={[0.66, 0.015, 0.1]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.25} roughness={0.75} />
        </mesh>
        {/* Handrails */}
        {[0.05, -0.05].map((z, i) => (
          <mesh key={`gangrail-${i}`} position={[0.55, 1.01, z]}>
            <boxGeometry args={[0.66, 0.012, 0.007]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {/* Hydraulic lift cylinders */}
        {[0.07, -0.07].map((z, i) => (
          <mesh key={`hyd-${i}`} position={[0.12, 0.82, z]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.012, 0.015, 0.35, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.75} roughness={0.25} />
          </mesh>
        ))}
        {/* Tower diagonal braces */}
        {[0.1, -0.1].map((z, i) => (
          <mesh key={`brace-${i}`} position={[0.08, 0.68, z]} rotation={[0, 0, -0.28]}>
            <boxGeometry args={[0.01, 0.32, 0.01]} />
            <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* ====== OFFSHORE KNUCKLE-BOOM CRANE ====== */}
      <group position={[-0.1, 0.22, -0.45]}>
        {/* Pedestal */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.3, 10]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.55} roughness={0.38} />
        </mesh>
        {/* Slewing ring */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.085, 0.075, 0.05, 10]} />
          <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Crane house */}
        <mesh position={[0, 0.43, 0]}>
          <boxGeometry args={[0.17, 0.17, 0.22]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Counterweight at rear */}
        <mesh position={[-0.15, 0.43, 0]}>
          <boxGeometry args={[0.12, 0.14, 0.1]} />
          <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.45} />
        </mesh>
        {/* Lower boom — angled up at ~57° from horizontal */}
        <mesh position={[0.18, 0.67, 0]} rotation={[0, 0, -0.96]}>
          <boxGeometry args={[0.04, 0.52, 0.04]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Knuckle joint sphere */}
        <mesh position={[0.39, 0.83, 0]}>
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshStandardMaterial color="#d97706" metalness={0.65} roughness={0.3} />
        </mesh>
        {/* Upper boom — nearly horizontal, slight downslope */}
        <mesh position={[0.68, 0.80, 0]} rotation={[0, 0, -(Math.PI / 2 + 0.1)]}>
          <boxGeometry args={[0.035, 0.58, 0.035]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Luffing hydraulic cylinder */}
        <mesh position={[0.08, 0.58, 0.07]} rotation={[0, 0, -0.68]}>
          <cylinderGeometry args={[0.013, 0.016, 0.36, 6]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Hoist wire */}
        <mesh position={[0.97, 0.65, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.28, 4]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Hook block */}
        <mesh position={[0.97, 0.50, 0]}>
          <boxGeometry args={[0.046, 0.07, 0.032]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ====== OPEN AFT DECK ====== */}
      {/* Deck markings / helideck-style pad area */}
      <mesh position={[0, 0.235, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshStandardMaterial color="#cccccc" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Deck equipment / cargo area markings */}
      <mesh position={[0, 0.233, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="#555e68" metalness={0.2} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Stern roller / A-frame */}
      <mesh position={[0, 0.4, -2.2]}>
        <boxGeometry args={[0.5, 0.35, 0.06]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
      </mesh>
      {[0.22, -0.22].map((x, i) => (
        <mesh key={`aframe-${i}`} position={[x, 0.4, -2.15]}>
          <boxGeometry args={[0.04, 0.35, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Aft deck small equipment boxes */}
      {[
        { pos: [0.25, 0.28, -1.2] as [number, number, number], size: [0.15, 0.1, 0.15] as [number, number, number], c: "#4b5563" },
        { pos: [-0.25, 0.28, -1.3] as [number, number, number], size: [0.12, 0.08, 0.18] as [number, number, number], c: "#374151" },
        { pos: [0.2, 0.28, -1.7] as [number, number, number], size: [0.1, 0.12, 0.1] as [number, number, number], c: "#4b5563" },
      ].map((item, i) => (
        <mesh key={`equip-${i}`} position={item.pos}>
          <boxGeometry args={item.size} />
          <meshStandardMaterial color={item.c} metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* ====== MOORING BOLLARDS ====== */}
      {[
        [0.3, 0.27, 2.3] as [number, number, number],
        [-0.3, 0.27, 2.3] as [number, number, number],
        [0.3, 0.27, -1.85] as [number, number, number],
        [-0.3, 0.27, -1.85] as [number, number, number],
      ].map((pos, i) => (
        <group key={`bollard-${i}`} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.035, 0.08, 8]} />
            <meshStandardMaterial color="#555e68" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.045, 0.03, 0.04, 8]} />
            <meshStandardMaterial color="#555e68" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Forward deck mooring winch */}
      <group position={[0, 0.24, 2.05]}>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.18, 0.08, 0.12]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 10]} />
          <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Aft towing/mooring winch */}
      <group position={[0, 0.24, -1.9]}>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.22, 0.09, 0.15]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.13, 10]} />
          <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Hawse pipes at bow */}
      {[0.18, -0.18].map((x, i) => (
        <mesh key={`hawse-${i}`} position={[x, -0.04, 2.52]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.032, 0.065, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      {/* HVAC unit on accommodation roof */}
      <mesh position={[0, 0.82, 1.25]}>
        <boxGeometry args={[0.26, 0.07, 0.14]} />
        <meshStandardMaterial color="#cccccc" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.08, 0.88, 1.3]}>
        <cylinderGeometry args={[0.016, 0.016, 0.04, 6]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ====== FUNNELS (exhaust) aft of superstructure ====== */}
      {[0.15, -0.15].map((x, i) => (
        <group key={`funnel-${i}`}>
          <mesh position={[x, 0.55, 0.65]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 8]} />
            <meshStandardMaterial color={superstructureColor} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[x, 0.68, 0.65]}>
            <cylinderGeometry args={[0.042, 0.04, 0.04, 8]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ====== DECK RAILINGS ====== */}
      {[0.42, -0.42].map((x, i) => (
        <group key={`railing-${i}`}>
          {/* Main railing */}
          <mesh position={[x, 0.28, -0.5]}>
            <boxGeometry args={[0.008, 0.06, 3.2]} />
            <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Railing posts */}
          {[-2.0, -1.5, -1.0, -0.5, 0, 0.5].map((z, j) => (
            <mesh key={`post-${j}`} position={[x, 0.26, z]}>
              <cylinderGeometry args={[0.004, 0.004, 0.08, 4]} />
              <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ====== LIFEBOATS ====== */}
      {[0.38, -0.38].map((x, i) => (
        <group key={`lifeboat-${i}`}>
          <mesh position={[x, 0.4, 0.9]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
            <capsuleGeometry args={[0.035, 0.14, 4, 8]} />
            <meshStandardMaterial color="#ff6600" metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Davit */}
          <mesh position={[x * 0.95, 0.5, 0.9]}>
            <boxGeometry args={[0.02, 0.15, 0.02]} />
            <meshStandardMaterial color="#999999" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ====== NAVIGATION LIGHTS ====== */}
      <mesh position={[0.44, 0.26, 2.0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.44, 0.26, 2.0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      {/* Masthead light */}
      <mesh position={[0, 1.6, 1.55]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      {/* Stern light */}
      <mesh position={[0, 0.3, -2.25]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>

      {/* ====== COMPANY STRIPE on hull ====== */}
      <mesh position={[0.445, 0.05, 1.0]}>
        <boxGeometry args={[0.005, 0.12, 0.8]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-0.445, 0.05, 1.0]}>
        <boxGeometry args={[0.005, 0.12, 0.8]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
};

// Animated ocean with better look
const WaterPlane = () => {
  const materialRef = useRef<any>(null);
  const [opacity, setOpacity] = useState(0);

  useFrame((_, delta) => {
    if (opacity < 0.75) {
      setOpacity(prev => Math.min(prev + delta * 0.3, 0.75));
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
      <circleGeometry args={[14, 128]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#0a3d62"
        speed={1.2}
        distort={0.1}
        radius={1}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

// Sea spray particles
const Particles = () => {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 1.5 - 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a3c4dc" transparent opacity={0.35} />
    </points>
  );
};

const Loader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#3b82f6" wireframe />
  </mesh>
);

const Ship2DFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
    <div className="relative">
      <Ship className="w-32 h-32 text-primary animate-pulse" />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        <Waves className="w-6 h-6 text-accent animate-bounce" style={{ animationDelay: '0s' }} />
        <Waves className="w-6 h-6 text-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
        <Waves className="w-6 h-6 text-accent animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
    <p className="mt-4 text-muted-foreground text-sm">Maritime Automation</p>
  </div>
);

const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#ffffff" castShadow />
      <directionalLight position={[-4, 5, -6]} intensity={0.35} color="#87ceeb" />
      <pointLight position={[0, 4, 3]} intensity={0.25} color="#ffeedd" />
      <hemisphereLight args={['#87ceeb', '#0a3d62', 0.35]} />

      <Float speed={1.0} rotationIntensity={0.03} floatIntensity={0.1}>
        <SOVHull />
      </Float>

      <WaterPlane />
      <Particles />

      <fog attach="fog" args={['#0c1929', 10, 22]} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  );
};

const Ship3D = () => {
  const { t } = useLanguage();
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  const [inView, setInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  // Pause the rAF loop when the canvas scrolls offscreen so we don't
  // burn GPU on hidden frames.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '100px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => { event.preventDefault(); };
    const handleContextRestored = () => { setKey(prev => prev + 1); };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  if (!webGLSupported || hasError) {
    return <Ship2DFallback />;
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative flex items-center justify-center">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground border border-primary/20">
        {t('ship3d.rotateHint')}
      </div>

      <div
        className="relative w-full aspect-square max-w-[600px] max-h-[600px] rounded-full overflow-hidden"
        style={{
          mask: 'radial-gradient(circle at center, black 40%, transparent 70%)',
          WebkitMask: 'radial-gradient(circle at center, black 40%, transparent 70%)',
        }}
      >
        <Canvas
          key={key}
          frameloop={inView ? 'always' : 'demand'}
          camera={{ position: [5, 3.5, 6.5], fov: 38 }}
          style={{ background: 'transparent' }}
          onCreated={handleCreated}
          onError={() => setHasError(true)}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
          }}
        >
          <Suspense fallback={<Loader />}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Ship3D;
