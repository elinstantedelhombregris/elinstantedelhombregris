import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CrossConnection, PersonNode, ConceptNode } from '@/hooks/useNeuralNetwork';

interface EnergyFlowProps {
  connection: CrossConnection;
  fromPerson: PersonNode;
  toPerson: PersonNode;
  fromConcept: ConceptNode;
  toConcept: ConceptNode;
  isVisible: boolean;
}

export default function EnergyFlow({
  connection,
  fromPerson,
  toPerson,
  fromConcept,
  toConcept,
  isVisible,
}: EnergyFlowProps) {
  const lineRef = useRef<THREE.Line>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  if (!isVisible) return null;

  const fromPos = new THREE.Vector3(...fromConcept.position);
  const toPos = new THREE.Vector3(...toConcept.position);
  const distance = fromPos.distanceTo(toPos);

  // Create curved path using quadratic bezier
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3()
      .addVectors(fromPos, toPos)
      .multiplyScalar(0.5);
    
    // Elevate the midpoint for a curved path
    const direction = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
    const perpendicular = new THREE.Vector3(
      -direction.y,
      direction.x,
      0
    ).normalize();
    
    midPoint.add(perpendicular.multiplyScalar(distance * 0.3));
    midPoint.y += distance * 0.2; // Add elevation

    return new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
  }, [fromPos, toPos, distance]);

  // Generate points along the curve
  const curvePoints = useMemo(() => curve.getPoints(50), [curve]);
  
  const positions = useMemo(
    () => new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z])),
    [curvePoints]
  );

  // Particle system for energy flow
  const particleCount = 20;
  const particlePositions = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );
  const particleColors = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );

  const fromColor = new THREE.Color(fromConcept.color);
  const toColor = new THREE.Color(toConcept.color);

  useFrame((state) => {
    // Animate particles along the curve
    const time = state.clock.elapsedTime;
    const speed = 2; // Particles per second

    for (let i = 0; i < particleCount; i++) {
      const t = ((time * speed + i / particleCount) % 1);
      const point = curve.getPoint(t);
      
      particlePositions[i * 3] = point.x;
      particlePositions[i * 3 + 1] = point.y;
      particlePositions[i * 3 + 2] = point.z;

      // Color gradient from source to target
      const color = fromColor.clone().lerp(toColor, t);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    if (particlesRef.current?.geometry) {
      particlesRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
      );
      particlesRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(particleColors, 3)
      );
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }

    // Pulse wave animation
    const pulseWave = (time * 1.5) % 2;
    if (pulseRef.current) {
      const progress = pulseWave < 1 ? pulseWave : 2 - pulseWave;
      const t = progress;
      const pulsePoint = curve.getPoint(t);
      pulseRef.current.position.copy(pulsePoint);
      
      const scale = Math.sin(progress * Math.PI) * connection.strength * 0.5;
      pulseRef.current.scale.setScalar(scale + 0.3);
    }
  });

  const lineOpacity = connection.strength * 0.6;
  const lineWidth = Math.max(0.5, connection.strength * 3);

  return (
    <group>
      {/* Main connection line */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={curvePoints.length}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={fromConcept.color}
          transparent
          opacity={lineOpacity}
          linewidth={lineWidth}
        />
      </line>

      {/* Gradient line (fade effect) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={curvePoints.length}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={lineOpacity * 0.3}
          linewidth={lineWidth * 0.5}
        />
      </line>

      {/* Traveling particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          sizeAttenuation={true}
          transparent
          vertexColors
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Pulse wave traveling along the line */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={fromConcept.color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow halos at connection points */}
      <mesh position={fromPos}>
        <ringGeometry args={[0.2, 0.4, 32]} />
        <meshBasicMaterial
          color={fromConcept.color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={toPos}>
        <ringGeometry args={[0.2, 0.4, 32]} />
        <meshBasicMaterial
          color={toConcept.color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}



