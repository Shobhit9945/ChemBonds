import * as THREE from 'three';
import { WORLD_SCALE, DEPTH_SCALE, LANDMARK_SMOOTHING, LANDMARK_DEADZONE } from '../utils/constants';

export interface Landmark {
  x: number; // 0..1
  y: number; // 0..1
  z: number; // approx, relative to wrist
}

export type HandLandmarks = Landmark[];

/** Convert a normalized MediaPipe landmark to Three.js world coordinates. */
export function landmarkToWorld(lm: Landmark): THREE.Vector3 {
  const x = (0.5 - lm.x) * WORLD_SCALE; // mirror horizontally + center
  const y = (0.5 - lm.y) * WORLD_SCALE; // flip Y (image-space → world-space)
  const z = -lm.z * DEPTH_SCALE;
  return new THREE.Vector3(x, y, z);
}

/** Smooth landmarks frame-to-frame using EMA + deadzone. */
export class LandmarkSmoother {
  private prev = new Map<string, Landmark>();

  smooth(key: string, current: Landmark): Landmark {
    const previous = this.prev.get(key);
    if (!previous) {
      this.prev.set(key, { ...current });
      return current;
    }
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const dz = current.z - previous.z;
    if (Math.hypot(dx, dy, dz) < LANDMARK_DEADZONE) {
      return previous;
    }
    const a = LANDMARK_SMOOTHING;
    const smoothed: Landmark = {
      x: previous.x * a + current.x * (1 - a),
      y: previous.y * a + current.y * (1 - a),
      z: previous.z * a + current.z * (1 - a),
    };
    this.prev.set(key, smoothed);
    return smoothed;
  }

  reset(): void {
    this.prev.clear();
  }
}
