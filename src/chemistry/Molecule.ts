import { Atom } from './Atom';
import { Bond, BondOrder } from './Bond';
import { ElementSymbol, ELEMENTS } from './elements.data';

export class Molecule {
  atoms: Map<string, Atom> = new Map();
  bonds: Map<string, Bond> = new Map();

  addAtom(atom: Atom): void {
    this.atoms.set(atom.id, atom);
  }

  removeAtom(id: string): void {
    const atom = this.atoms.get(id);
    if (!atom) return;
    for (const bond of [...atom.bonds]) this.removeBond(bond.id);
    this.atoms.delete(id);
  }

  addBond(a: Atom, b: Atom, order: BondOrder = 1): Bond | null {
    if (a === b) return null;
    if (a.bondedWith(b)) return null;
    if (a.remainingValence < order || b.remainingValence < order) return null;
    const bond = new Bond(a, b, order);
    a.bonds.push(bond);
    b.bonds.push(bond);
    this.bonds.set(bond.id, bond);
    return bond;
  }

  upgradeBond(bond: Bond): boolean {
    if (bond.order >= 3) return false;
    const a = bond.atomA;
    const b = bond.atomB;
    if (a.remainingValence < 1 || b.remainingValence < 1) return false;
    bond.order = (bond.order + 1) as BondOrder;
    return true;
  }

  removeBond(id: string): void {
    const bond = this.bonds.get(id);
    if (!bond) return;
    bond.atomA.bonds = bond.atomA.bonds.filter((x) => x !== bond);
    bond.atomB.bonds = bond.atomB.bonds.filter((x) => x !== bond);
    this.bonds.delete(id);
  }

  clear(): void {
    this.atoms.clear();
    this.bonds.clear();
  }

  get atomList(): Atom[] {
    return [...this.atoms.values()];
  }

  get bondList(): Bond[] {
    return [...this.bonds.values()];
  }

  /** Connected component containing atom (BFS). */
  componentOf(atom: Atom): Atom[] {
    const seen = new Set<string>([atom.id]);
    const queue = [atom];
    const out: Atom[] = [];
    while (queue.length) {
      const a = queue.shift()!;
      out.push(a);
      for (const bond of a.bonds) {
        const n = bond.other(a);
        if (!seen.has(n.id)) {
          seen.add(n.id);
          queue.push(n);
        }
      }
    }
    return out;
  }

  /** Sum of atomic weights for a connected component containing the seed atom. */
  molecularWeight(seed: Atom): number {
    return this.componentOf(seed).reduce(
      (acc, a) => acc + ELEMENTS[a.element].atomicWeight,
      0
    );
  }

  /** Molecular formula string (Hill notation, no implicit H). */
  formula(seed: Atom): string {
    const counts: Partial<Record<ElementSymbol, number>> = {};
    for (const atom of this.componentOf(seed)) {
      counts[atom.element] = (counts[atom.element] ?? 0) + 1;
    }
    const order: ElementSymbol[] = ['C', 'H', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br'];
    const parts: string[] = [];
    for (const el of order) {
      if (counts[el]) {
        parts.push(counts[el]! > 1 ? `${el}${counts[el]}` : el);
      }
    }
    return parts.join('') || '∅';
  }
}
