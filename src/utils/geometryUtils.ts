import * as THREE from 'three';

export function midpoint(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  return a.clone().add(b).multiplyScalar(0.5);
}

export function alignCylinder(
  from: THREE.Vector3,
  to: THREE.Vector3
): { position: THREE.Vector3; quaternion: THREE.Quaternion; length: number } {
  const dir = to.clone().sub(from);
  const length = dir.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { position: midpoint(from, to), quaternion, length };
}
