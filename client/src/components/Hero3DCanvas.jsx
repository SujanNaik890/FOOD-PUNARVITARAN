import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

function PulsingEarth() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#164B38"
          roughness={0.2}
          metalness={0.1}
          distort={0.25}
          speed={1.5}
        />
      </Sphere>
      {/* Decorative Halo Ring */}
      <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshStandardMaterial color="#F28B45" opacity={0.6} transparent side={2} />
      </mesh>
    </Float>
  );
}

export function Hero3DCanvas() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-[350px] md:h-[450px] flex items-center justify-center bg-radial from-[#164B38]/10 to-transparent rounded-full border border-[#DDE9DC]">
        <div className="w-48 h-48 rounded-full bg-[#164B38] flex items-center justify-center text-white shadow-2xl relative animate-pulse">
          <div className="text-center p-4">
            <span className="font-serif-heading text-3xl font-bold text-[#F28B45]">FP</span>
            <div className="text-[11px] uppercase tracking-widest mt-1 opacity-80">Food Punarvitaran</div>
          </div>
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#F28B45]/50 animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="w-full h-[450px] md:h-[550px] relative">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          onError={() => setHasError(true)}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, -5]} color="#F28B45" intensity={1} />
          <PulsingEarth />
        </Canvas>
      </div>
    );
  } catch (err) {
    return (
      <div className="w-full h-[350px] md:h-[450px] flex items-center justify-center bg-[#DDE9DC]/20 rounded-full">
        <div className="w-48 h-48 rounded-full bg-[#164B38] flex items-center justify-center text-white">
          <span className="font-serif-heading text-2xl font-bold">FP</span>
        </div>
      </div>
    );
  }
}

