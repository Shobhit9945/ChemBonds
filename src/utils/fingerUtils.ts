import { FINGERTIP_IDS } from './constants';

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export const FINGER_NAMES: FingerName[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

export function fingerIndexFor(handIndex: 0 | 1, fingerWithinHand: 0 | 1 | 2 | 3 | 4): number {
  return handIndex * 5 + fingerWithinHand;
}

export function fingertipLandmarkId(fingerWithinHand: 0 | 1 | 2 | 3 | 4): number {
  return FINGERTIP_IDS[fingerWithinHand];
}
