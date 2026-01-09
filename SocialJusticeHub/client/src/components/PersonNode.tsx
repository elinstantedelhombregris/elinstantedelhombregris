import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { PersonNode as PersonNodeType } from '@/hooks/useNeuralNetwork';

interface PersonNodeProps {
  person: PersonNodeType;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

export default function PersonNode({
  person,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: PersonNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  // Create geometric shape (octahedron - 8 faces)
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.6, 0), []);

  useFrame((state) => {
    if (meshRef.current) {
      // Breathing/pulsing effect
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      const baseScale = isSelected ? 1.3 : isHovered ? 1.15 : 1.0;
      meshRef.current.scale.setScalar(baseScale * pulse);

      // Slow rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    if (auraRef.current) {
      // Pulsing aura
      const auraPulse = 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      auraRef.current.scale.setScalar(auraPulse);
      
      const opacity = (isSelected ? 0.4 : isHovered ? 0.3 : 0.2) + 
                      Math.sin(state.clock.elapsedTime * 4) * 0.1;
      if (auraRef.current.material instanceof THREE.MeshBasicMaterial) {
        auraRef.current.material.opacity = Math.max(0.1, Math.min(0.5, opacity));
      }
    }

    if (materialRef.current) {
      // Emissive intensity pulsing
      const emissiveIntensity = (isSelected ? 0.8 : isHovered ? 0.6 : 0.4) +
                                Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
      materialRef.current.emissiveIntensity = emissiveIntensity;
    }
  });

  const personColor = '#8b5cf6'; // Purple for people

  return (
    <group ref={groupRef} position={person.position}>
      {/* Outer aura glow */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={personColor}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Middle glow layer */}
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial
          color={personColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Main geometric shape */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <meshStandardMaterial
          ref={materialRef}
          color={personColor}
          emissive={personColor}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Name label */}
      {(isSelected || isHovered) && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          maxWidth={4}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {person.name}
        </Text>
      )}

      {/* Username label (smaller) */}
      {(isSelected || isHovered) && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.12}
          color="#a78bfa"
          maxWidth={4}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          @{person.username}
        </Text>
      )}
    </group>
  );
}



