import { HandLandmarks } from './LandmarkMapper';
import { PINCH_THRESHOLD } from '../utils/constants';

export type Gesture = 'open' | 'pinch' | 'fist' | 'point' | 'spread' | 'thumbsUp' | 'unknown';

function dist3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Returns true if fingertip lm is "extended" relative to its corresponding knuckle (lower y = up in image space). */
function isExtended(tipId: number, knuckleId: number, hand: HandLandmarks): boolean {
  return hand[tipId].y < hand[knuckleId].y - 0.02;
}

export function isPinching(hand: HandLandmarks): boolean {
  return dist3(hand[4], hand[8]) < PINCH_THRESHOLD;
}

export function detectGesture(hand: HandLandmarks): Gesture {
  if (!hand || hand.length < 21) return 'unknown';

  const thumbExt  = hand[4].y < hand[2].y;
  const indexExt  = isExtended(8, 6, hand);
  const middleExt = isExtended(12, 10, hand);
  const ringExt   = isExtended(16, 14, hand);
  const pinkyExt  = isExtended(20, 18, hand);

  const extendedCount = [thumbExt, indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  if (isPinching(hand)) return 'pinch';

  if (extendedCount === 0) return 'fist';

  if (indexExt && !middleExt && !ringExt && !pinkyExt) return 'point';

  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) return 'thumbsUp';

  if (extendedCount === 5) {
    // distinguish "spread" from "open" by spread of fingertips
    const span = dist3(hand[4], hand[20]);
    return span > 0.28 ? 'spread' : 'open';
  }

  return 'open';
}

export class GestureDebouncer {
  private buffer: Gesture[] = [];
  private size: number;
  private lastCommitted: Gesture = 'unknown';

  constructor(size = 8) {
    this.size = size;
  }

  push(g: Gesture): Gesture {
    this.buffer.push(g);
    if (this.buffer.length > this.size) this.buffer.shift();
    // commit only when the buffer is uniform
    if (this.buffer.length === this.size && this.buffer.every((x) => x === g)) {
      this.lastCommitted = g;
    }
    return this.lastCommitted;
  }

  reset(): void {
    this.buffer = [];
    this.lastCommitted = 'unknown';
  }
}
