import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { Atom } from '../chemistry/Atom';

interface Props {
  atom: Atom;
  isInspected: boolean;
  isGhost: boolean;
  showLabel: boolean;
}

/**
 * Renders a single atom. The atom's `position` Vector3 is mutated in place by
 * the engine's `useFrame` (in MoleculeScene). We sync the rendered group ref
 * to that vector each frame so the atom follows the user's fingertip without
 * triggering React re-renders.
 */
export function AtomMesh({ atom, isInspected, isGhost, showLabel }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(atom.position);
    }
  });

  return (
    <group ref={groupRef}>
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
        <mesh>
          <torusGeometry args={[atom.radius * 1.8, 0.015, 8, 32]} />
          <meshBasicMaterial color="#F85149" />
        </mesh>
      )}

      {isInspected && (
        <mesh>
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
