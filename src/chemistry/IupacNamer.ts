import { Atom } from './Atom';
import { Molecule } from './Molecule';

/**
 * Strict-scope IUPAC namer. Handles only:
 *   - common small molecules by exact formula match (H2O, CO2, NH3 ...)
 *   - straight-chain alkanes (CnH2n+2), n=1..10
 *   - straight-chain alkenes (one C=C), n=2..10
 *   - straight-chain alkynes (one C#C), n=2..10
 *   - alcohols (single -OH on alkane)
 * Anything else: returns null, caller should display SMILES + "Too complex to name".
 */

const ALKANE_ROOTS = [
  '', 'meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec',
];

function commonName(formula: string): string | null {
  const common: Record<string, string> = {
    'H2O': 'Water',
    'CO2': 'Carbon dioxide',
    'CO': 'Carbon monoxide',
    'NH3': 'Ammonia',
    'CH4': 'Methane',
    'O2': 'Oxygen',
    'N2': 'Nitrogen',
    'H2': 'Hydrogen',
    'HCl': 'Hydrogen chloride',
    'HF': 'Hydrogen fluoride',
    'HBr': 'Hydrogen bromide',
    'H2S': 'Hydrogen sulfide',
    'CH2O': 'Formaldehyde',
  };
  return common[formula] ?? null;
}

interface CompositionStats {
  C: number;
  H: number;
  O: number;
  N: number;
  halogen: number;
  doubleBonds: number;
  tripleBonds: number;
  totalAtoms: number;
  hasRing: boolean;
}

function statsFor(molecule: Molecule, component: Atom[]): CompositionStats {
  let C = 0, H = 0, O = 0, N = 0, halogen = 0;
  const halogens = new Set(['F', 'Cl', 'Br']);
  for (const a of component) {
    if (a.element === 'C') C++;
    else if (a.element === 'H') H++;
    else if (a.element === 'O') O++;
    else if (a.element === 'N') N++;
    else if (halogens.has(a.element)) halogen++;
  }
  // bonds within the component
  const bondSet = new Set<string>();
  for (const a of component) for (const b of a.bonds) bondSet.add(b.id);
  let doubleBonds = 0, tripleBonds = 0;
  for (const id of bondSet) {
    const bond = molecule.bonds.get(id)!;
    if (bond.order === 2) doubleBonds++;
    if (bond.order === 3) tripleBonds++;
  }
  // cycle detection: edges > nodes - 1 means a ring exists
  const hasRing = bondSet.size > component.length - 1;
  return {
    C, H, O, N, halogen,
    doubleBonds, tripleBonds,
    totalAtoms: component.length,
    hasRing,
  };
}

export function nameMolecule(molecule: Molecule, seed: Atom): string | null {
  const component = molecule.componentOf(seed);
  const formula = molecule.formula(seed);
  const common = commonName(formula);
  if (common) return common;

  const s = statsFor(molecule, component);
  if (s.hasRing) return null;
  if (s.N > 0 || s.halogen > 0) return null;
  if (s.C === 0) return null;
  if (s.C > 10) return null;

  // Alcohol: CnH(2n+2)O with exactly one -OH
  if (s.O === 1 && s.doubleBonds === 0 && s.tripleBonds === 0 && s.H === 2 * s.C + 2) {
    const root = ALKANE_ROOTS[s.C];
    return root ? capitalize(root + 'an' + 'ol') : null;
  }

  // Alkyne: CnH(2n-2) with exactly one C#C
  if (s.O === 0 && s.tripleBonds === 1 && s.doubleBonds === 0 && s.H === 2 * s.C - 2 && s.C >= 2) {
    const root = ALKANE_ROOTS[s.C];
    return root ? capitalize(root + 'yne') : null;
  }

  // Alkene: CnH(2n) with exactly one C=C
  if (s.O === 0 && s.doubleBonds === 1 && s.tripleBonds === 0 && s.H === 2 * s.C && s.C >= 2) {
    const root = ALKANE_ROOTS[s.C];
    return root ? capitalize(root + 'ene') : null;
  }

  // Alkane: CnH(2n+2)
  if (s.O === 0 && s.doubleBonds === 0 && s.tripleBonds === 0 && s.H === 2 * s.C + 2) {
    const root = ALKANE_ROOTS[s.C];
    return root ? capitalize(root + 'ane') : null;
  }

  // Partially-filled hydrocarbon (some valences unsatisfied) — name as "(skeleton)"
  if (s.O === 0 && s.doubleBonds === 0 && s.tripleBonds === 0 && s.H < 2 * s.C + 2) {
    return `C${s.C} skeleton (incomplete)`;
  }

  return null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
