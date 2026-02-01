import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Ship hull component
const ShipHull = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
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
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms = {
        ...((meshRef.current.material as THREE.ShaderMaterial).uniforms || {}),
      };
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
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

// Loading fallback
const Loader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#3b82f6" wireframe />
  </mesh>
);

// Main component
const Ship3D = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [4, 2, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#60a5fa" />
          <pointLight position={[0, 2, 0]} intensity={0.5} color="#3b82f6" />
          
          <Float
            speed={1.5}
            rotationIntensity={0.2}
            floatIntensity={0.3}
          >
            <ShipHull />
          </Float>
          
          <WaterPlane />
          <Particles />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Ship3D;
