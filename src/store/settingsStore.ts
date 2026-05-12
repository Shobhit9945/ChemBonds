import { create } from 'zustand';

/** Length-5 mask, [thumb, index, middle, ring, pinky], applied symmetrically to both hands. */
export type FingerMask = [boolean, boolean, boolean, boolean, boolean];

export interface SettingsStore {
  showBondAngles: boolean;
  showLonePairs: boolean;
  showOrbitals: boolean;
  showVseprGuides: boolean;
  colorblindMode: boolean;
  bloomIntensity: number;
  bondThreshold: number;
  enforceValence: boolean;
  autoAddHydrogens: boolean;
  audioEnabled: boolean;
  activeFingers: FingerMask;
  set: (patch: Partial<SettingsStore>) => void;
  setActiveFinger: (fingerIndex: number, on: boolean) => void;
  setActiveFingers: (mask: FingerMask) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  showBondAngles: true,
  showLonePairs: false,
  showOrbitals: false,
  showVseprGuides: true,
  colorblindMode: false,
  bloomIntensity: 0.8,
  bondThreshold: 0.8,
  enforceValence: true,
  autoAddHydrogens: false,
  audioEnabled: true,
  activeFingers: [true, true, true, true, true],
  set: (patch) => set(patch),
  setActiveFinger: (fingerIndex, on) =>
    set((s) => {
      const next = [...s.activeFingers] as FingerMask;
      next[fingerIndex] = on;
      return { activeFingers: next };
    }),
  setActiveFingers: (mask) => set({ activeFingers: mask }),
}));
