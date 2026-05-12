import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Bond } from '../chemistry/Bond';

interface Props {
  bond: Bond;
}

// Module-level scratch — useFrame callbacks run sequentially, so it's safe to share.
const _dir = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _pos = new THREE.Vector3();
const _upY = new THREE.Vector3(0, 1, 0);
const _upX = new THREE.Vector3(1, 0, 0);

/**
 * Renders a chemical bond as 1–3 parallel cylinders. The whole transform —
 * length, orientation, and perpendicular offset for double/triple bonds —
 * is recomputed each frame from the live atom positions.
 */
export function BondMesh({ bond }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);

  const offsets = useMemo<number[]>(
    () => (bond.order === 1 ? [0] : bond.order === 2 ? [-0.06, 0.06] : [-0.1, 0, 0.1]),
    [bond.order]
  );

  useFrame(() => {
    const a = bond.atomA.position;
    const b = bond.atomB.position;
    _dir.subVectors(b, a);
    const length = _dir.length();
    if (length < 1e-4) {
      for (const m of meshRefs.current) if (m) m.visible = false;
      return;
    }
    _dir.divideScalar(length); // normalize in place
    const up = Math.abs(_dir.y) < 0.9 ? _upY : _upX;
    _perp.crossVectors(_dir, up).normalize();
    _mid.copy(a).add(b).multiplyScalar(0.5);
    _quat.setFromUnitVectors(_upY, _dir);

    for (let i = 0; i < offsets.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      _pos.copy(_mid).addScaledVector(_perp, offsets[i]);
      mesh.position.copy(_pos);
      mesh.quaternion.copy(_quat);
      mesh.scale.set(1, length, 1);
      mesh.visible = true;
    }
  });

  return (
    <group>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
        >
          {/* Unit-length cylinder; useFrame scales Y to actual bond length. */}
          <cylinderGeometry args={[0.05, 0.05, 1, 12]} />
          <meshStandardMaterial color="#8B949E" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
