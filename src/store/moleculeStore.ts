import { create } from 'zustand';
import { ElementSymbol } from '../chemistry/elements.data';
import { Molecule } from '../chemistry/Molecule';

export interface MoleculeStore {
  molecule: Molecule;
  /** Per-finger element assignment, length 10 (left hand: 0-4, right: 5-9) */
  fingerElements: ElementSymbol[];
  selectedElement: ElementSymbol;
  /** Atom currently being inspected (point gesture). */
  inspectedAtomId: string | null;
  /** Tick counter — increment whenever the molecule mutates to force info-panel refresh. */
  revision: number;

  setSelectedElement: (el: ElementSymbol) => void;
  setFingerElement: (fingerIndex: number, el: ElementSymbol) => void;
  setAllFingers: (el: ElementSymbol) => void;
  setInspectedAtom: (id: string | null) => void;
  bumpRevision: () => void;
  reset: () => void;
}

const DEFAULT_FINGERS: ElementSymbol[] = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'];

export const useMoleculeStore = create<MoleculeStore>((set) => ({
  molecule: new Molecule(),
  fingerElements: [...DEFAULT_FINGERS],
  selectedElement: 'C',
  inspectedAtomId: null,
  revision: 0,

  setSelectedElement: (el) => set({ selectedElement: el }),
  setFingerElement: (fingerIndex, el) =>
    set((state) => {
      const next = [...state.fingerElements];
      next[fingerIndex] = el;
      return { fingerElements: next };
    }),
  setAllFingers: (el) => set({ fingerElements: Array(10).fill(el) as ElementSymbol[] }),
  setInspectedAtom: (id) => set({ inspectedAtomId: id }),
  bumpRevision: () => set((s) => ({ revision: s.revision + 1 })),
  reset: () =>
    set((s) => {
      s.molecule.clear();
      return {
        molecule: s.molecule,
        fingerElements: [...DEFAULT_FINGERS],
        selectedElement: 'C',
        inspectedAtomId: null,
        revision: s.revision + 1,
      };
    }),
}));
