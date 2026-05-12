import * as THREE from 'three';
import { ElementSymbol, ELEMENTS } from './elements.data';
import type { Bond } from './Bond';

let atomIdCounter = 0;
export function nextAtomId(): string {
  atomIdCounter += 1;
  return `a${atomIdCounter}`;
}

export class Atom {
  id: string;
  element: ElementSymbol;
  position: THREE.Vector3;
  bonds: Bond[];
  fingerIndex: number;
  isGhost: boolean;
  lastSeenFrame: number;

  constructor(element: ElementSymbol, fingerIndex: number, position?: THREE.Vector3) {
    this.id = nextAtomId();
    this.element = element;
    this.position = position ?? new THREE.Vector3();
    this.bonds = [];
    this.fingerIndex = fingerIndex;
    this.isGhost = false;
    this.lastSeenFrame = 0;
  }

  get maxValence(): number {
    return ELEMENTS[this.element].maxValence;
  }

  get valenceUsed(): number {
    return this.bonds.reduce((acc, b) => acc + b.order, 0);
  }

  get remainingValence(): number {
    return this.maxValence - this.valenceUsed;
  }

  get isFull(): boolean {
    return this.remainingValence <= 0;
  }

  get radius(): number {
    return ELEMENTS[this.element].radius;
  }

  get color(): string {
    return ELEMENTS[this.element].color;
  }

  bondedWith(other: Atom): Bond | undefined {
    return this.bonds.find((b) => b.atomA === other || b.atomB === other);
  }
}
