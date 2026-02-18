import { useRef, Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Ship, Anchor, Waves } from 'lucide-react';

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

      {/* Hull bottom */}
      <mesh position={[0, -0.35, 0]} scale={[0.8, 0.15, 4.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0d1b2a" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Waterline red stripe */}
      <mesh position={[0, -0.2, 0]} scale={[0.88, 0.05, 5.0]}>
        <boxGeometry args={[1, 1, 1]} />
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

      {/* ====== W2W GANGWAY TOWER (CENTER) ====== */}
      <group ref={gangwayRef} position={[0, 0, 0]}>
        {/* Tower base */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.35, 0.65, 0.35]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Tower upper section */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.3, 0.35, 0.3]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Tower top platform */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.38, 0.04, 0.38]} />
          <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Gangway arm extending to starboard */}
        <mesh position={[0.55, 0.95, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.8, 0.06, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Gangway walkway */}
        <mesh position={[0.55, 0.9, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.75, 0.02, 0.15]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Gangway railings */}
        {[0.07, -0.07].map((z, i) => (
          <mesh key={`gr-${i}`} position={[0.55, 0.98, z]} rotation={[0, 0, -0.15]}>
            <boxGeometry args={[0.75, 0.02, 0.008]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}

        {/* Elevator shaft markings */}
        {[0.3, 0.5, 0.7, 0.9].map((y, i) => (
          <mesh key={`elev-${i}`} position={[0.18, y, 0]}>
            <boxGeometry args={[0.01, 0.04, 0.25]} />
            <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ====== CRANE (near gangway tower) ====== */}
      <group position={[-0.2, 0.22, -0.4]}>
        {/* Crane pedestal */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.24, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Crane house */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Crane boom */}
        <mesh position={[0.15, 0.42, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.03, 0.55, 0.04]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Crane tip */}
        <mesh position={[0.38, 0.58, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.04]} />
          <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Cable */}
        <mesh position={[0.38, 0.45, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.25, 4]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
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
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
      <planeGeometry args={[18, 18, 64, 64]} />
      <MeshDistortMaterial
        color="#0a3d62"
        speed={1.2}
        distort={0.1}
        radius={1}
        transparent
        opacity={0.75}
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
    <Anchor className="w-8 h-8 text-primary/60 mt-2" />
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
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
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
    <div className="w-full h-full min-h-[400px] relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground border border-primary/20">
        🖱️ Dra for å rotere
      </div>

      <Canvas
        key={key}
        camera={{ position: [3.5, 2.5, 4.5], fov: 38 }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
        onError={() => setHasError(true)}
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
  );
};

export default Ship3D;
