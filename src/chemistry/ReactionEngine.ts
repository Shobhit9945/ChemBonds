/**
 * Reaction engine — stub for Phase 5.
 * Defines reaction interfaces so the rest of the app can import without breaking.
 * Real bond-breaking/forming animations and electron-flow arrows TODO.
 */
import { Molecule } from './Molecule';

export interface ReactionResult {
  name: string;
  deltaH: number; // kJ/mol, negative = exothermic
  productSmiles: string;
  animationFrames: number;
}

export const KNOWN_REACTIONS = [
  'Acid-base neutralization',
  'SN2 substitution',
  'Alkene addition',
  'Esterification',
  'Combustion',
] as const;

export function tryReaction(_a: Molecule, _b: Molecule): ReactionResult | null {
  // Placeholder — wire up actual logic in Phase 5.
  return null;
}
