import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ConceptNode, PersonNode } from '@/hooks/useNeuralNetwork';

interface ConceptParticleSystemProps {
  person: PersonNode;
  concept: ConceptNode;
  conceptType: 'dream' | 'value' | 'need' | 'basta';
  isVisible: boolean;
  particleDensity?: number;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export default function ConceptParticleSystem({
  person,
  concept,
  conceptType,
  isVisible,
  particleDensity = 50,
}: ConceptParticleSystemProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Initialize particles
  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      setShouldAnimate(false);
      return;
    }

    setShouldAnimate(true);
    
    // Create initial particles at person position
    const initialParticles: Particle[] = Array.from({ length: particleDensity }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.3;
      const elevation = Math.random() * Math.PI;

      return {
        position: new THREE.Vector3(
          person.position[0] + Math.cos(angle) * radius * Math.sin(elevation),
          person.position[1] + radius * Math.cos(elevation),
          person.position[2] + Math.sin(angle) * radius * Math.sin(elevation)
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.03 + 0.01,
          (Math.random() - 0.5) * 0.02
        ),
        life: Math.random(),
        maxLife: 2 + Math.random() * 2,
        size: 0.02 + Math.random() * 0.03,
      };
    });

    setParticles(initialParticles);
  }, [person.position, concept.position, isVisible, particleDensity]);

  // Particle positions and attributes for rendering
  const positions = useMemo(() => new Float32Array(particleDensity * 3), [particleDensity]);
  const sizes = useMemo(() => new Float32Array(particleDensity), [particleDensity]);
  const colors = useMemo(() => new Float32Array(particleDensity * 3), [particleDensity]);

  const conceptColor = new THREE.Color(concept.color);

  useFrame((state, delta) => {
    if (!particlesRef.current || !shouldAnimate || particles.length === 0) return;

    const personPos = new THREE.Vector3(...person.position);
    const conceptPos = new THREE.Vector3(...concept.position);
    const direction = new THREE.Vector3().subVectors(conceptPos, personPos).normalize();
    const distance = personPos.distanceTo(conceptPos);

    // Update particles
    const updatedParticles = particles.map((particle) => {
      const progress = 1 - particle.life / particle.maxLife;
      
      // Spiral flow pattern
      const spiralAngle = progress * Math.PI * 4 + state.clock.elapsedTime * 2;
      const spiralRadius = Math.sin(progress * Math.PI) * 0.5;
      
      // Calculate target position along path
      const t = progress;
      const currentTarget = new THREE.Vector3().lerpVectors(personPos, conceptPos, t);
      
      // Add spiral offset
      const spiralOffset = new THREE.Vector3(
        Math.cos(spiralAngle) * spiralRadius,
        Math.sin(spiralAngle * 2) * spiralRadius * 0.5,
        Math.sin(spiralAngle) * spiralRadius
      );
      
      // Apply spiral to direction perpendicular to main direction
      const perpendicular = new THREE.Vector3(
        -direction.y,
        direction.x,
        0
      ).normalize();
      spiralOffset.applyAxisAngle(direction, spiralAngle);
      
      particle.position.copy(currentTarget).add(spiralOffset);
      
      // Update velocity towards concept with spiral motion
      const toConcept = new THREE.Vector3().subVectors(conceptPos, particle.position);
      const distanceToConcept = toConcept.length();
      
      if (distanceToConcept > 0.1) {
        toConcept.normalize();
        
        // Add spiral component
        const spiralVelocity = perpendicular.clone().multiplyScalar(
          Math.sin(spiralAngle * 2) * 0.01
        );
        
        particle.velocity.lerp(
          toConcept.multiplyScalar(0.05).add(spiralVelocity),
          0.1
        );
        
        particle.position.add(particle.velocity);
      } else {
        // Coalesce at concept position with slight jitter
        const jitter = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        );
        particle.position.copy(conceptPos).add(jitter);
        particle.velocity.multiplyScalar(0.95);
      }
      
      // Update life
      particle.life += delta;
      
      return particle;
    });

    setParticles(updatedParticles);

    // Update positions array for rendering
    updatedParticles.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      sizes[i] = particle.size * (1 - particle.life / particle.maxLife);
      
      const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
      colors[i * 3] = conceptColor.r * alpha;
      colors[i * 3 + 1] = conceptColor.g * alpha;
      colors[i * 3 + 2] = conceptColor.b * alpha;
    });

    if (particlesRef.current.geometry) {
      particlesRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      particlesRef.current.geometry.setAttribute(
        'size',
        new THREE.BufferAttribute(sizes, 1)
      );
      particlesRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  if (!isVisible || particles.length === 0) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleDensity}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleDensity}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleDensity}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation={true}
        transparent
        vertexColors
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Concept Node Component (the coalesced form)
interface ConceptNode3DProps {
  concept: ConceptNode;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

export function ConceptNode3D({
  concept,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: ConceptNode3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating
      meshRef.current.position.y =
        concept.position[1] + Math.sin(state.clock.elapsedTime + concept.id) * 0.1;
      
      // Pulse when selected/hovered
      const pulse = isSelected ? 1.3 : isHovered ? 1.15 : 1.0;
      meshRef.current.scale.setScalar(
        pulse + Math.sin(state.clock.elapsedTime * 3) * 0.05
      );
    }

    if (materialRef.current) {
      const emissiveIntensity =
        (isSelected ? 0.8 : isHovered ? 0.6 : 0.4) +
        Math.sin(state.clock.elapsedTime * 2) * 0.2;
      materialRef.current.emissiveIntensity = emissiveIntensity;
    }
  });

  return (
    <group position={concept.position}>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[concept.size * 0.3, 16, 16]} />
        <meshBasicMaterial
          color={concept.color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main concept sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[concept.size * 0.2, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color={concept.color}
          emissive={concept.color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}



