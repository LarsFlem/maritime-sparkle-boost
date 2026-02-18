import { useRef, Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Ship, Anchor, Waves } from 'lucide-react';

// Realistic ship hull using a lathe/extrude approach
const ShipHull = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.008;
    }
  });

  // Create hull shape using ExtrudeGeometry for a more realistic form
  const hullShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Top deck outline (top view)
    shape.moveTo(0, 0);
    shape.lineTo(0.45, 0);
    shape.bezierCurveTo(0.48, 0.3, 0.48, 0.6, 0.45, 0.9);
    shape.bezierCurveTo(0.42, 1.2, 0.35, 1.8, 0.15, 2.4);
    shape.bezierCurveTo(0.05, 2.7, 0, 2.85, 0, 2.85);
    // Mirror
    shape.lineTo(0, 2.85);
    shape.bezierCurveTo(0, 2.85, -0.05, 2.7, -0.15, 2.4);
    shape.bezierCurveTo(-0.35, 1.8, -0.42, 1.2, -0.45, 0.9);
    shape.bezierCurveTo(-0.48, 0.6, -0.48, 0.3, -0.45, 0);
    shape.lineTo(0, 0);
    return shape;
  }, []);

  const hullExtrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    bevelSegments: 3,
  }), []);

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 2, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Main hull body */}
      <mesh position={[0, -0.2, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[hullShape, hullExtrudeSettings]} />
        <meshStandardMaterial color="#1a2d4a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hull bottom keel - darker */}
      <mesh position={[0, -0.38, 0]} scale={[0.85, 0.12, 2.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Waterline stripe */}
      <mesh position={[0, -0.25, 0]} scale={[0.92, 0.04, 2.7]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Deck surface */}
      <mesh position={[0, 0.14, 0]} scale={[0.82, 0.03, 2.4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B7355" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* ===== Superstructure / Bridge ===== */}
      {/* Level 1 - main structure */}
      <mesh position={[0, 0.32, -0.7]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.4} roughness={0.5} />
      </mesh>
      
      {/* Level 2 - bridge */}
      <mesh position={[0, 0.54, -0.7]}>
        <boxGeometry args={[0.55, 0.2, 0.65]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Level 3 - wheelhouse */}
      <mesh position={[0, 0.72, -0.7]}>
        <boxGeometry args={[0.45, 0.16, 0.5]} />
        <meshStandardMaterial color="#f5f5f5" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Bridge windows - front */}
      <mesh position={[0, 0.56, -0.37]}>
        <boxGeometry args={[0.48, 0.12, 0.01]} />
        <meshStandardMaterial color="#1e90ff" emissive="#1e70d0" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Bridge windows - sides */}
      <mesh position={[0.276, 0.56, -0.7]}>
        <boxGeometry args={[0.01, 0.12, 0.55]} />
        <meshStandardMaterial color="#1e90ff" emissive="#1e70d0" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.276, 0.56, -0.7]}>
        <boxGeometry args={[0.01, 0.12, 0.55]} />
        <meshStandardMaterial color="#1e90ff" emissive="#1e70d0" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ===== Funnel / Exhaust ===== */}
      <mesh position={[0, 0.65, -1.0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.35, 8]} />
        <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Funnel stripe */}
      <mesh position={[0, 0.72, -1.0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.06, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Funnel top */}
      <mesh position={[0, 0.83, -1.0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ===== Mast & Radar ===== */}
      <mesh position={[0, 1.0, -0.7]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Radar dish */}
      <mesh position={[0, 1.2, -0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.002, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 1.3, -0.7]}>
        <cylinderGeometry args={[0.005, 0.005, 0.15, 4]} />
        <meshStandardMaterial color="#999999" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ===== Containers on deck ===== */}
      {/* Row 1 */}
      {[-0.15, 0.15].map((x, i) => (
        <group key={`row1-${i}`}>
          <mesh position={[x, 0.26, 0.3]}>
            <boxGeometry args={[0.25, 0.18, 0.4]} />
            <meshStandardMaterial color={i === 0 ? "#2563eb" : "#dc2626"} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[x, 0.26, 0.75]}>
            <boxGeometry args={[0.25, 0.18, 0.4]} />
            <meshStandardMaterial color={i === 0 ? "#16a34a" : "#eab308"} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Row 2 - stacked */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={`row2-${i}`} position={[x, 0.43, 0.5]}>
          <boxGeometry args={[0.25, 0.17, 0.38]} />
          <meshStandardMaterial color={i === 0 ? "#9333ea" : "#ea580c"} metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* ===== Bow details ===== */}
      {/* Bow bulb */}
      <mesh position={[0, -0.32, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1a2d4a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ===== Deck railings (simplified) ===== */}
      {[0.4, -0.4].map((x, i) => (
        <mesh key={`rail-${i}`} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.01, 0.08, 2.6]} />
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* ===== Crane ===== */}
      <group position={[0.2, 0.14, -0.2]}>
        {/* Crane base */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Crane arm */}
        <mesh position={[0, 0.26, 0.2]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.5]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* ===== Lifeboat ===== */}
      {[0.32, -0.32].map((x, i) => (
        <mesh key={`lifeboat-${i}`} position={[x, 0.28, -0.5]} rotation={[0, 0, x > 0 ? -0.1 : 0.1]}>
          <capsuleGeometry args={[0.03, 0.12, 4, 8]} />
          <meshStandardMaterial color="#ff6600" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      {/* Navigation lights */}
      <mesh position={[0.42, 0.18, 1.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.42, 0.18, 1.1]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

// Animated water plane
const WaterPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[15, 15, 48, 48]} />
      <MeshDistortMaterial
        color="#0c4a6e"
        speed={1.5}
        distort={0.12}
        radius={1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

// Floating particles around the ship (sea spray / mist)
const Particles = () => {
  const points = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const particleCount = 80;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 2 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#87ceeb" transparent opacity={0.4} />
    </points>
  );
};

// Loading fallback inside Canvas
const Loader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#3b82f6" wireframe />
  </mesh>
);

// 2D Fallback component when WebGL is not available
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

// Check if WebGL is available
const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

// 3D Scene component
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-3, 4, -5]} intensity={0.4} color="#87ceeb" />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#ffd700" />
      <hemisphereLight args={['#87ceeb', '#0c4a6e', 0.3]} />
      
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
        <ShipHull />
      </Float>
      
      <WaterPlane />
      <Particles />
      
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#0c1929', 8, 20]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
};

// Main component
const Ship3D = () => {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
    };
    const handleContextRestored = () => {
      setKey(prev => prev + 1);
    };
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
        camera={{ position: [3, 2.5, 4], fov: 40 }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
        onError={() => setHasError(true)}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
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
