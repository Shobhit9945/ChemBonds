import { ELEMENTS, ElementSymbol } from './elements.data';

export function maxValence(el: ElementSymbol): number {
  return ELEMENTS[el].maxValence;
}

export function valenceUsed(bonds: { order: 1 | 2 | 3 }[]): number {
  return bonds.reduce((acc, b) => acc + b.order, 0);
}

export function canAcceptBond(
  el: ElementSymbol,
  currentBonds: { order: 1 | 2 | 3 }[],
  order: 1 | 2 | 3 = 1
): boolean {
  return valenceUsed(currentBonds) + order <= maxValence(el);
}

export function remainingValence(
  el: ElementSymbol,
  currentBonds: { order: 1 | 2 | 3 }[]
): number {
  return maxValence(el) - valenceUsed(currentBonds);
}
