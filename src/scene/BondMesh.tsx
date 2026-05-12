import { useMemo } from 'react';
import * as THREE from 'three';
import { Bond } from '../chemistry/Bond';
import { alignCylinder } from '../utils/geometryUtils';

interface Props {
  bond: Bond;
}

export function BondMesh({ bond }: Props) {
  const a = bond.atomA.position;
  const b = bond.atomB.position;
  const { position, quaternion, length } = useMemo(
    () => alignCylinder(a, b),
    // re-run when atom identities change; live position updates handled in MoleculeScene
    [bond.id, a.x, a.y, a.z, b.x, b.y, b.z]
  );

  const offsets: number[] = bond.order === 1 ? [0] : bond.order === 2 ? [-0.06, 0.06] : [-0.1, 0, 0.1];

  // Compute a perpendicular vector to offset double/triple cylinders along.
  const perpendicular = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(b, a).normalize();
    const up = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    return new THREE.Vector3().crossVectors(dir, up).normalize();
  }, [bond.id, a.x, a.y, a.z, b.x, b.y, b.z]);

  return (
    <group>
      {offsets.map((offset, i) => {
        const pos = position.clone().add(perpendicular.clone().multiplyScalar(offset));
        return (
          <mesh
            key={i}
            position={pos.toArray()}
            quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
          >
            <cylinderGeometry args={[0.05, 0.05, length, 12]} />
            <meshStandardMaterial color="#8B949E" roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}
