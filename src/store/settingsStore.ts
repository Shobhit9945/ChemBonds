import { create } from 'zustand';

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
  set: (patch: Partial<SettingsStore>) => void;
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
  set: (patch) => set(patch),
}));
