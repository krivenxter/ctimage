import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject, TransformMode } from '../types';

interface SceneProps {
  objects: SceneObject[];
  onUpdateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  bgColor: string;
  transformMode: TransformMode;
}

const COLORS = {
  cyan: '#19BCE5',
  purple: '#DB6EEE',
  silver: '#C0C0C0',
  white: '#FFFFFF',
  'purple-frosted': '#E0B0FF',
  'cyan-frosted': '#B2EBF2',
  graphite: '#1F282C',
  beige: '#F1EEE4',
  'light-blue': '#E0F7FA',
  'light-purple': '#F3E5F5',
  'dark-graphite': '#141B1E',
};

function ObjectMesh({ obj, isSelected, onSelect, onUpdate, transformMode }: { 
  obj: SceneObject; 
  isSelected: boolean; 
  onSelect: () => void;
  onUpdate: (updates: Partial<SceneObject>) => void;
  transformMode: TransformMode;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const getColor = () => {
    return COLORS[obj.color as keyof typeof COLORS] || COLORS.white;
  };

  const isFrosted = obj.color === 'purple-frosted' || obj.color === 'cyan-frosted';

  return (
    <>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <capsuleGeometry args={[0.4, 0.8, 4, 12]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={isFrosted ? 0.1 : 0.7} 
          roughness={isFrosted ? 0.1 : 0.2} 
          transparent={isFrosted}
          opacity={isFrosted ? 0.6 : 1}
          emissive={getColor()}
          emissiveIntensity={isFrosted ? 0.5 : 0.2}
        />
      </mesh>
      {isSelected && (
        <TransformControls
          object={meshRef.current as any}
          mode={transformMode}
          onMouseUp={() => {
            if (meshRef.current) {
              const { position, rotation, scale } = meshRef.current;
              onUpdate({
                position: [position.x, position.y, position.z],
                rotation: [rotation.x, rotation.y, rotation.z],
                scale: scale.x,
              });
            }
          }}
        />
      )}
    </>
  );
}

function Frame() {
  return (
    <group>
      {/* Visual Frame Bounds */}
      <lineSegments position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(8, 8, 8)]} />
        <lineBasicMaterial color="#19BCE5" opacity={0.2} transparent />
      </lineSegments>
    </group>
  );
}

export default function Scene({ objects, onUpdateObject, selectedId, onSelect, bgColor, transformMode }: SceneProps) {
  const bgHex = COLORS[bgColor as keyof typeof COLORS] || '#FFFFFF';

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ backgroundColor: bgHex }}>
      <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={30} />
        <OrbitControls 
          makeDefault 
          enableRotate={false} 
          enablePan={false}
          enableZoom={false}
        />
        
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={1} />
        <Environment preset="studio" />
        
        <group onPointerMissed={() => onSelect(null)}>
          <Frame />
          {objects.map((obj) => (
            <ObjectMesh 
              key={obj.id} 
              obj={obj} 
              isSelected={selectedId === obj.id}
              onSelect={() => onSelect(obj.id)}
              onUpdate={(updates) => onUpdateObject(obj.id, updates)}
              transformMode={transformMode}
            />
          ))}
        </group>

        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={10} />
      </Canvas>
      
      {/* 1:1 Frame Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="aspect-square h-[80%] border-2 border-brand-blue/30 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}
