import { ELEMENTS, ElementSymbol } from '../chemistry/elements.data';

export function colorFor(el: ElementSymbol): string {
  return ELEMENTS[el].color;
}

export function radiusFor(el: ElementSymbol): number {
  return ELEMENTS[el].radius;
}
