import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export function CyberOrb({ wireframe, metalness, roughness }) {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.5;
      innerRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group>
        {/* Outer Icosahedron Lattice */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2, 2]} />
          <meshStandardMaterial
            color="#6366f1"
            wireframe={wireframe}
            metalness={metalness ?? 0.8}
            roughness={roughness ?? 0.2}
            emissive="#4338ca"
            emissiveIntensity={wireframe ? 0.8 : 0.2}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            wireframe={wireframe}
            metalness={0.9}
            roughness={0.1}
            emissive="#06b6d4"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Orbiting Particles */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[3, 0.03, 16, 100]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[3.4, 0.02, 16, 100]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

export function TorusKnotPreset({ wireframe, metalness, roughness }) {
  const knotRef = useRef();

  useFrame((state, delta) => {
    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.2;
      knotRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1}>
      <mesh ref={knotRef} castShadow receiveShadow>
        <torusKnotGeometry args={[1.5, 0.45, 128, 32, 2, 3]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={roughness ?? 0.15}
          metalness={metalness ?? 0.9}
          wireframe={wireframe}
        />
      </mesh>
    </Float>
  );
}

export function MonolithPreset({ wireframe, metalness, roughness }) {
  const monolithRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (monolithRef.current) {
      monolithRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.6;
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
      <group>
        <mesh ref={monolithRef} castShadow receiveShadow>
          <boxGeometry args={[1.2, 3.2, 0.4]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={roughness ?? 0.1}
            metalness={metalness ?? 0.95}
            wireframe={wireframe}
          />
        </mesh>

        {/* Energy Halo */}
        <mesh ref={ringRef} position={[0, 0, 0]}>
          <torusGeometry args={[2.2, 0.05, 16, 64]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={1}
            wireframe={wireframe}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function QuantumCorePreset({ wireframe, metalness, roughness }) {
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1.2}>
      <group ref={coreRef}>
        <mesh>
          <dodecahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial
            color="#ec4899"
            roughness={roughness ?? 0.2}
            metalness={metalness ?? 0.85}
            wireframe={wireframe}
          />
        </mesh>
        <mesh scale={0.7}>
          <dodecahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.7}
            wireframe={wireframe}
          />
        </mesh>
      </group>
    </Float>
  );
}
