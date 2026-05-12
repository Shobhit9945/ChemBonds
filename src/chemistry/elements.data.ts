export type ElementSymbol =
  | 'C' | 'H' | 'O' | 'N' | 'F' | 'Cl' | 'Br' | 'P' | 'S';

export interface ElementInfo {
  symbol: ElementSymbol;
  name: string;
  atomicNumber: number;
  atomicWeight: number;
  maxValence: number;
  radius: number;        // visual radius (scaled vdW)
  color: string;         // CPK hex
}

export const ELEMENTS: Record<ElementSymbol, ElementInfo> = {
  H:  { symbol: 'H',  name: 'Hydrogen', atomicNumber: 1,  atomicWeight: 1.008,  maxValence: 1, radius: 0.12, color: '#FFFFFF' },
  C:  { symbol: 'C',  name: 'Carbon',   atomicNumber: 6,  atomicWeight: 12.011, maxValence: 4, radius: 0.17, color: '#404040' },
  N:  { symbol: 'N',  name: 'Nitrogen', atomicNumber: 7,  atomicWeight: 14.007, maxValence: 3, radius: 0.16, color: '#4444FF' },
  O:  { symbol: 'O',  name: 'Oxygen',   atomicNumber: 8,  atomicWeight: 15.999, maxValence: 2, radius: 0.15, color: '#FF4444' },
  F:  { symbol: 'F',  name: 'Fluorine', atomicNumber: 9,  atomicWeight: 18.998, maxValence: 1, radius: 0.14, color: '#44FF44' },
  P:  { symbol: 'P',  name: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.974, maxValence: 3, radius: 0.21, color: '#FF8800' },
  S:  { symbol: 'S',  name: 'Sulfur',   atomicNumber: 16, atomicWeight: 32.06,  maxValence: 2, radius: 0.20, color: '#FFCC00' },
  Cl: { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicWeight: 35.45,  maxValence: 1, radius: 0.20, color: '#22CC22' },
  Br: { symbol: 'Br', name: 'Bromine',  atomicNumber: 35, atomicWeight: 79.904, maxValence: 1, radius: 0.22, color: '#993300' },
};

export const ELEMENT_ORDER: ElementSymbol[] = ['C', 'H', 'O', 'N', 'F', 'Cl', 'Br', 'P', 'S'];
