import { Atom } from './Atom';
import { ELEMENTS } from './elements.data';

export interface VseprResult {
  shape: string;
  idealAngle: number | null;
  electronPairs: number;
  bondingPairs: number;
  lonePairs: number;
  hybridization: string;
}

const VALENCE_ELECTRONS: Record<string, number> = {
  H: 1, C: 4, N: 5, O: 6, F: 7, P: 5, S: 6, Cl: 7, Br: 7,
};

export function computeVsepr(atom: Atom): VseprResult {
  const ve = VALENCE_ELECTRONS[atom.element] ?? 0;
  const bondingPairs = atom.bonds.length; // count of sigma neighbors, ignoring multiplicity
  const bondingElectrons = atom.valenceUsed;
  const lonePairs = Math.max(0, Math.floor((ve - bondingElectrons) / 2));
  const electronPairs = bondingPairs + lonePairs;

  let shape = 'Unknown';
  let idealAngle: number | null = null;
  let hybridization = '—';

  if (bondingPairs === 0) {
    shape = 'Isolated atom';
  } else if (electronPairs === 1) {
    shape = 'Terminal';
  } else if (electronPairs === 2) {
    shape = 'Linear';
    idealAngle = 180;
    hybridization = 'sp';
  } else if (electronPairs === 3) {
    if (lonePairs === 0) {
      shape = 'Trigonal planar';
      idealAngle = 120;
    } else {
      shape = 'Bent';
      idealAngle = 118;
    }
    hybridization = 'sp²';
  } else if (electronPairs === 4) {
    if (lonePairs === 0) {
      shape = 'Tetrahedral';
      idealAngle = 109.5;
    } else if (lonePairs === 1) {
      shape = 'Trigonal pyramidal';
      idealAngle = 107;
    } else if (lonePairs === 2) {
      shape = 'Bent';
      idealAngle = 104.5;
    }
    hybridization = 'sp³';
  } else if (electronPairs === 5) {
    shape = 'Trigonal bipyramidal';
    idealAngle = 120;
    hybridization = 'sp³d';
  } else if (electronPairs === 6) {
    shape = 'Octahedral';
    idealAngle = 90;
    hybridization = 'sp³d²';
  }

  return { shape, idealAngle, electronPairs, bondingPairs, lonePairs, hybridization };
}

/** Compute the actual angle (degrees) between this atom and two of its neighbors. */
export function actualBondAngle(center: Atom, a: Atom, b: Atom): number {
  const va = a.position.clone().sub(center.position).normalize();
  const vb = b.position.clone().sub(center.position).normalize();
  const dot = Math.min(1, Math.max(-1, va.dot(vb)));
  return (Math.acos(dot) * 180) / Math.PI;
}

export function isPolar(atom: Atom): boolean {
  // crude: any electronegativity difference > 0.4 with neighbors → polar
  const EN: Record<string, number> = {
    H: 2.20, C: 2.55, N: 3.04, O: 3.44, F: 3.98, P: 2.19, S: 2.58, Cl: 3.16, Br: 2.96,
  };
  const center = EN[atom.element] ?? 0;
  for (const bond of atom.bonds) {
    const other = bond.other(atom);
    if (Math.abs((EN[other.element] ?? 0) - center) > 0.4) return true;
  }
  // also polar if it has lone pairs near electronegative atoms
  return ELEMENTS[atom.element].symbol === 'O' || ELEMENTS[atom.element].symbol === 'N';
}
