import { Atom } from './Atom';

let bondIdCounter = 0;
export function nextBondId(): string {
  bondIdCounter += 1;
  return `b${bondIdCounter}`;
}

export type BondOrder = 1 | 2 | 3;

export class Bond {
  id: string;
  atomA: Atom;
  atomB: Atom;
  order: BondOrder;
  createdAt: number;

  constructor(a: Atom, b: Atom, order: BondOrder = 1) {
    this.id = nextBondId();
    this.atomA = a;
    this.atomB = b;
    this.order = order;
    this.createdAt = performance.now();
  }

  get length(): number {
    return this.atomA.position.distanceTo(this.atomB.position);
  }

  other(atom: Atom): Atom {
    return atom === this.atomA ? this.atomB : this.atomA;
  }
}
