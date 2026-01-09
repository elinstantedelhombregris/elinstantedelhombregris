import React, { Suspense, useState, useCallback, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeuralNetwork, type PersonNode, type ConceptNode, type CrossConnection } from '@/hooks/useNeuralNetwork';
import { Eye, Heart, AlertCircle, Zap, Loader2, Users } from 'lucide-react';
import NeuralNetworkControls from './NeuralNetworkControls';
import PersonNodeComponent from './PersonNode';
import ConceptParticleSystem, { ConceptNode3D } from './ConceptParticleSystem';
import EnergyFlow from './EnergyFlow';
import NodeDetailPanel from './NodeDetailPanel';

// Scene component with dramatic effects
function Scene({
  people,
  crossConnections,
  activeLayers,
  selectedPersonId,
  selectedConceptId,
  hoveredPersonId,
  hoveredConceptId,
  onPersonClick,
  onConceptClick,
  onPersonHover,
  onConceptHover,
  onHoverOut,
  particleDensity,
  showParticles,
}: {
  people: PersonNode[];
  crossConnections: CrossConnection[];
  activeLayers: Set<string>;
  selectedPersonId: number | null;
  selectedConceptId: number | null;
  hoveredPersonId: number | null;
  hoveredConceptId: number | null;
  onPersonClick: (id: number) => void;
  onConceptClick: (personId: number, conceptId: number) => void;
  onPersonHover: (id: number) => void;
  onConceptHover: (personId: number, conceptId: number) => void;
  onHoverOut: () => void;
  particleDensity: number;
  showParticles: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Create maps for quick lookup
  const conceptMap = useMemo(() => {
    const map = new Map<number, { personId: number; concept: ConceptNode; type: string }>();
    people.forEach(person => {
      Object.entries(person.concepts).forEach(([type, concepts]) => {
        concepts.forEach(concept => {
          map.set(concept.id, { personId: person.id, concept, type });
        });
      });
    });
    return map;
  }, [people]);

  // Filter visible concepts by active layers
  const visiblePeople = useMemo(() => {
    return people.map(person => ({
      ...person,
      concepts: {
        dreams: activeLayers.has('dream') ? person.concepts.dreams : [],
        values: activeLayers.has('value') ? person.concepts.values : [],
        needs: activeLayers.has('need') ? person.concepts.needs : [],
        basta: activeLayers.has('basta') ? person.concepts.basta : [],
      },
    }));
  }, [people, activeLayers]);

  // Filter visible connections
  const visibleConnections = useMemo(() => {
    return crossConnections.filter(conn => {
      const fromData = conceptMap.get(conn.from.conceptId);
      const toData = conceptMap.get(conn.to.conceptId);
      if (!fromData || !toData) return false;
      return activeLayers.has(fromData.type) && activeLayers.has(toData.type);
    });
  }, [crossConnections, conceptMap, activeLayers]);

  // Ambient camera rotation
  useFrame((state) => {
    if (controlsRef.current && !selectedPersonId && !hoveredPersonId) {
      // Subtle auto-rotation
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    } else {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
      
      {/* Dramatic lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <spotLight
        position={[0, 15, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        castShadow
      />

      {/* Atmospheric particles */}
      <AtmosphericParticles />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={40}
        autoRotate={false}
        enablePan={true}
      />

      {/* Render all people */}
      {visiblePeople.map((person) => {
        const allConcepts = [
          ...person.concepts.dreams,
          ...person.concepts.values,
          ...person.concepts.needs,
          ...person.concepts.basta,
        ];

        return (
          <React.Fragment key={person.id}>
            {/* Person node */}
            <PersonNodeComponent
              person={person}
              isSelected={selectedPersonId === person.id}
              isHovered={hoveredPersonId === person.id}
              onClick={() => onPersonClick(person.id)}
              onPointerOver={() => onPersonHover(person.id)}
              onPointerOut={onHoverOut}
            />

            {/* Concept nodes and particle systems */}
            {person.concepts.dreams.map((concept) => (
              <React.Fragment key={concept.id}>
                {showParticles && (
                  <ConceptParticleSystem
                    person={person}
                    concept={concept}
                    conceptType="dream"
                    isVisible={activeLayers.has('dream')}
                    particleDensity={particleDensity}
                  />
                )}
                <ConceptNode3D
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isHovered={hoveredConceptId === concept.id}
                  onClick={() => onConceptClick(person.id, concept.id)}
                  onPointerOver={() => onConceptHover(person.id, concept.id)}
                  onPointerOut={onHoverOut}
                />
              </React.Fragment>
            ))}

            {person.concepts.values.map((concept) => (
              <React.Fragment key={concept.id}>
                {showParticles && (
                  <ConceptParticleSystem
                    person={person}
                    concept={concept}
                    conceptType="value"
                    isVisible={activeLayers.has('value')}
                    particleDensity={particleDensity}
                  />
                )}
                <ConceptNode3D
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isHovered={hoveredConceptId === concept.id}
                  onClick={() => onConceptClick(person.id, concept.id)}
                  onPointerOver={() => onConceptHover(person.id, concept.id)}
                  onPointerOut={onHoverOut}
                />
              </React.Fragment>
            ))}

            {person.concepts.needs.map((concept) => (
              <React.Fragment key={concept.id}>
                {showParticles && (
                  <ConceptParticleSystem
                    person={person}
                    concept={concept}
                    conceptType="need"
                    isVisible={activeLayers.has('need')}
                    particleDensity={particleDensity}
                  />
                )}
                <ConceptNode3D
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isHovered={hoveredConceptId === concept.id}
                  onClick={() => onConceptClick(person.id, concept.id)}
                  onPointerOver={() => onConceptHover(person.id, concept.id)}
                  onPointerOut={onHoverOut}
                />
              </React.Fragment>
            ))}

            {person.concepts.basta.map((concept) => (
              <React.Fragment key={concept.id}>
                {showParticles && (
                  <ConceptParticleSystem
                    person={person}
                    concept={concept}
                    conceptType="basta"
                    isVisible={activeLayers.has('basta')}
                    particleDensity={particleDensity}
                  />
                )}
                <ConceptNode3D
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isHovered={hoveredConceptId === concept.id}
                  onClick={() => onConceptClick(person.id, concept.id)}
                  onPointerOver={() => onConceptHover(person.id, concept.id)}
                  onPointerOut={onHoverOut}
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}

      {/* Render cross-connections */}
      {visibleConnections.map((connection, idx) => {
        const fromData = conceptMap.get(connection.from.conceptId);
        const toData = conceptMap.get(connection.to.conceptId);
        if (!fromData || !toData) return null;

        const fromPerson = people.find(p => p.id === connection.from.personId);
        const toPerson = people.find(p => p.id === connection.to.personId);
        if (!fromPerson || !toPerson) return null;

        return (
          <EnergyFlow
            key={`${connection.from.conceptId}-${connection.to.conceptId}-${idx}`}
            connection={connection}
            fromPerson={fromPerson}
            toPerson={toPerson}
            fromConcept={fromData.concept}
            toConcept={toData.concept}
            isVisible={true}
          />
        );
      })}
    </>
  );
}

// Atmospheric particles component
function AtmosphericParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40;
      pos[i + 1] = (Math.random() - 0.5) * 40;
      pos[i + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + positions[i - 1]) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation={true}
        color="#ffffff"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main Component
export default function NeuralNetwork3D() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(['dream', 'value', 'need', 'basta'])
  );
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  const [hoveredPersonId, setHoveredPersonId] = useState<number | null>(null);
  const [hoveredConceptId, setHoveredConceptId] = useState<number | null>(null);
  const [minSimilarity, setMinSimilarity] = useState(0.3);
  const [maxConnections, setMaxConnections] = useState(10);
  const [particleDensity, setParticleDensity] = useState(30);
  const [showParticles, setShowParticles] = useState(true);

  const { data, isLoading, error } = useNeuralNetwork(
    minSimilarity,
    maxConnections
  );

  const toggleLayer = useCallback((layer: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  // Find selected concept/node for detail panel
  const selectedConceptData = useMemo(() => {
    if (!selectedConceptId || !data) return null;
    
    for (const person of data.people) {
      const allConcepts = [
        ...person.concepts.dreams.map(c => ({ ...c, type: 'dream' as const })),
        ...person.concepts.values.map(c => ({ ...c, type: 'value' as const })),
        ...person.concepts.needs.map(c => ({ ...c, type: 'need' as const })),
        ...person.concepts.basta.map(c => ({ ...c, type: 'basta' as const })),
      ];
      
      const concept = allConcepts.find(c => c.id === selectedConceptId);
      if (concept) {
        return {
          id: concept.id,
          type: concept.type,
          text: concept.text,
          position: concept.position,
          color: concept.color,
          size: concept.size,
          personId: person.id,
        };
      }
    }
    return null;
  }, [selectedConceptId, data]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          setSelectedPersonId(null);
          setSelectedConceptId(null);
          break;
        case '1':
          toggleLayer('dream');
          break;
        case '2':
          toggleLayer('value');
          break;
        case '3':
          toggleLayer('need');
          break;
        case '4':
          toggleLayer('basta');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleLayer]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Cargando red neuronal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl">
        <div className="text-center text-red-400 p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-semibold text-lg">Error al cargar la red neuronal</p>
          <p className="text-sm text-red-300 mt-2 max-w-md">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalConcepts = data.people.reduce(
    (sum, person) =>
      sum +
      person.concepts.dreams.length +
      person.concepts.values.length +
      person.concepts.needs.length +
      person.concepts.basta.length,
    0
  );

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden border border-white/10">
      {/* Help Tooltip */}
      <div className="hidden md:block absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-lg rounded-lg p-2 text-xs text-white/60 border border-white/10">
        <p className="mb-1">Atajos: ESC (cerrar), 1-4 (capas)</p>
        <p>Click en persona o concepto para detalles</p>
      </div>

      {/* Controls Panel */}
      <NeuralNetworkControls
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        minSimilarity={minSimilarity}
        maxConnections={maxConnections}
        onMinSimilarityChange={setMinSimilarity}
        onMaxConnectionsChange={setMaxConnections}
        nodeCount={totalConcepts}
        edgeCount={data.crossConnections.length}
        particleDensity={particleDensity}
        onParticleDensityChange={setParticleDensity}
        showParticles={showParticles}
        onShowParticlesChange={setShowParticles}
      />

      {/* 3D Canvas */}
      <Canvas>
        <Suspense fallback={null}>
          <Scene
            people={data.people}
            crossConnections={data.crossConnections}
            activeLayers={activeLayers}
            selectedPersonId={selectedPersonId}
            selectedConceptId={selectedConceptId}
            hoveredPersonId={hoveredPersonId}
            hoveredConceptId={hoveredConceptId}
            onPersonClick={setSelectedPersonId}
            onConceptClick={(personId, conceptId) => {
              setSelectedConceptId(conceptId);
              setSelectedPersonId(personId);
            }}
            onPersonHover={setHoveredPersonId}
            onConceptHover={(personId, conceptId) => {
              setHoveredConceptId(conceptId);
              setHoveredPersonId(personId);
            }}
            onHoverOut={() => {
              setHoveredPersonId(null);
              setHoveredConceptId(null);
            }}
            particleDensity={particleDensity}
            showParticles={showParticles}
          />
        </Suspense>
      </Canvas>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedConceptData && (
          <NodeDetailPanel
            node={selectedConceptData}
            onClose={() => {
              setSelectedConceptId(null);
              setSelectedPersonId(null);
            }}
            similarNodes={[]} // Will be populated later
          />
        )}
      </AnimatePresence>
    </div>
  );
}
