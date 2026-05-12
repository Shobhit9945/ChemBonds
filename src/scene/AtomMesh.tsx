import { useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { Atom } from '../chemistry/Atom';

interface Props {
  atom: Atom;
  isInspected: boolean;
  isGhost: boolean;
  showLabel: boolean;
}

export function AtomMesh({ atom, isInspected, isGhost, showLabel }: Props) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Position updates happen via a parent <group ref> in MoleculeScene's useFrame.
  // For simplicity here we let the parent set position via prop on each render of this comp
  // when triggered by the store revision. Per-frame movement is handled in MoleculeScene.

  return (
    <group position={atom.position.toArray()} ref={ref as any}>
      <mesh castShadow>
        <sphereGeometry args={[atom.radius * 1.4, 24, 24]} />
        <meshStandardMaterial
          color={atom.color}
          roughness={0.35}
          metalness={0.15}
          emissive={atom.color}
          emissiveIntensity={isGhost ? 0.05 : atom.isFull ? 0.3 : 0.18}
          transparent
          opacity={isGhost ? 0.35 : 1}
        />
      </mesh>

      {atom.isFull && (
        <mesh ref={ringRef}>
          <torusGeometry args={[atom.radius * 1.8, 0.015, 8, 32]} />
          <meshBasicMaterial color="#F85149" />
        </mesh>
      )}

      {isInspected && (
        <mesh ref={haloRef}>
          <sphereGeometry args={[atom.radius * 1.9, 24, 24]} />
          <meshBasicMaterial color="#58A6FF" transparent opacity={0.18} />
        </mesh>
      )}

      {showLabel && !isGhost && (
        <Billboard>
          <Text
            position={[0, atom.radius * 2.2, 0]}
            fontSize={0.18}
            color="#E6EDF3"
            anchorX="center"
            anchorY="middle"
          >
            {atom.element}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
