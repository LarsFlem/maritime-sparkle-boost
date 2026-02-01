import { useRef, Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Ship, Anchor, Waves } from 'lucide-react';

// Ship hull component
const ShipHull = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle bobbing motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main hull */}
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3, 0.6, 1]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hull front taper */}
      <mesh position={[1.8, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.5, 0.8, 4]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bridge/superstructure */}
      <mesh position={[-0.5, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.7]} />
        <meshStandardMaterial color="#2d4a6f" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Bridge windows */}
      <mesh position={[-0.5, 0.35, 0.36]}>
        <boxGeometry args={[1, 0.3, 0.02]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Funnel */}
      <mesh position={[-0.8, 0.7, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Mast */}
      <mesh position={[0.3, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Radar dome */}
      <mesh position={[0.3, 1.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* Deck equipment */}
      <mesh position={[0.8, -0.05, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Crane */}
      <group position={[1.2, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

// Animated water plane
const WaterPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <MeshDistortMaterial
        color="#0369a1"
        speed={2}
        distort={0.15}
        radius={1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

// Floating particles around the ship
const Particles = () => {
  const points = useRef<THREE.Points>(null);
  
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#60a5fa" transparent opacity={0.6} />
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#3b82f6" />
      
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.2}
      >
        <ShipHull />
      </Float>
      
      <WaterPlane />
      <Particles />
      
      {/* OrbitControls for mouse interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
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

  // Handle WebGL context loss recovery
  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL context lost, attempting recovery...');
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored');
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
      {/* Drag hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground border border-primary/20">
        🖱️ Dra for å rotere
      </div>
      
      <Canvas
        key={key}
        camera={{ position: [4, 2, 5], fov: 45 }}
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
