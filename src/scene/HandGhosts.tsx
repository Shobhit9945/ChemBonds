import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TrackedHand } from '../tracking/useHandTracking';
import { landmarkToWorld } from '../tracking/LandmarkMapper';

interface Props {
  handsRef: React.MutableRefObject<TrackedHand[]>;
}

const SKELETON: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

/**
 * Translucent hand silhouettes in 3D space. Renders 2 hands × (21 dots + 24 edges).
 * Uses a fixed buffer of meshes and repositions per frame for zero allocation.
 */
export function HandGhosts({ handsRef }: Props) {
  const dotRefs = useRef<THREE.Mesh[][]>([[], []]);
  const lineRefs = useRef<THREE.Mesh[][]>([[], []]);

  useFrame(() => {
    const hands = handsRef.current;
    for (let h = 0; h < 2; h++) {
      const hand = hands[h];
      const visible = !!hand;
      for (let i = 0; i < 21; i++) {
        const dot = dotRefs.current[h][i];
        if (!dot) continue;
        if (visible) {
          const world = landmarkToWorld(hand.landmarks[i]);
          dot.position.copy(world);
          dot.visible = true;
        } else {
          dot.visible = false;
        }
      }
      for (let i = 0; i < SKELETON.length; i++) {
        const line = lineRefs.current[h][i];
        if (!line) continue;
        if (visible) {
          const [aIdx, bIdx] = SKELETON[i];
          const a = landmarkToWorld(hand.landmarks[aIdx]);
          const b = landmarkToWorld(hand.landmarks[bIdx]);
          const mid = a.clone().add(b).multiplyScalar(0.5);
          const dir = b.clone().sub(a);
          const len = dir.length();
          line.position.copy(mid);
          line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
          line.scale.set(1, len, 1);
          line.visible = true;
        } else {
          line.visible = false;
        }
      }
    }
  });

  return (
    <group>
      {[0, 1].map((h) => (
        <group key={h}>
          {Array.from({ length: 21 }).map((_, i) => (
            <mesh
              key={`d-${h}-${i}`}
              ref={(m) => {
                if (m) dotRefs.current[h][i] = m;
              }}
              visible={false}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={h === 0 ? '#58A6FF' : '#D29922'} transparent opacity={0.55} />
            </mesh>
          ))}
          {SKELETON.map((_, i) => (
            <mesh
              key={`l-${h}-${i}`}
              ref={(m) => {
                if (m) lineRefs.current[h][i] = m;
              }}
              visible={false}
            >
              <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
              <meshBasicMaterial color={h === 0 ? '#58A6FF' : '#D29922'} transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
