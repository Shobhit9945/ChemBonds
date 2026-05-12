# MoleculeForge

**Build chemistry with your hands.** A hand-tracked 3D chemistry learning web app — fingertips become atoms, proximity creates bonds.

## Run it

```bash
npm install
npm run dev    # → http://localhost:5173
```

Camera access is required. All processing is client-side (MediaPipe Hands + Three.js).

## How to use

1. Click **Start tracking** and grant camera permission.
2. Show both hands to the camera. Each fingertip becomes an atom (default: carbon).
3. Pick a different element from the left palette to assign it to all 10 fingertips. Keyboard shortcuts: **1**=C, **2**=H, **3**=O, **4**=N, **5**=F, **6**=Cl, **7**=Br, **8**=P, **9**=S.
4. **Bring two fingertips close together** (< 0.8 world units) — a single bond forms.
5. **Hold them close for 1.5s** → bond upgrades to double. **3s** → triple.
6. **Pull fingertips apart** (> 1.2 world units) → bond breaks.
7. Press **R** to reset the scene.

The Inspector panel on the right shows live molecular properties: name, formula, VSEPR shape, bond angles, hybridization, SMILES.

## Architecture

```
src/
├── chemistry/     Pure TypeScript chemistry engine (Atom, Bond, Molecule, VSEPR, IUPAC, SMILES)
├── tracking/      MediaPipe Hands wrapper + landmark mapping + gesture detection
├── scene/         React-Three-Fiber components (atom/bond meshes, hand ghosts, postprocessing)
├── ui/            2D overlay UI (HUD, palette, inspector, gesture guide, video feed)
├── store/         Zustand stores (molecule state, settings)
├── hooks/         useAudio (Tone.js)
└── utils/         constants, color map, geometry helpers
```

## Implemented (Phase 1–3 of the spec)

- Hand tracking pipeline (MediaPipe, EMA smoothing, gesture debouncing)
- 10-fingertip atom system with CPK colors and Van der Waals scaling
- Live bond formation with valence enforcement, dwell-based bond order upgrade, distance-based bond breaking
- VSEPR geometry engine, hybridization, polarity, lone pairs
- IUPAC namer (small molecules, alkanes/alkenes/alkynes/alcohols, common-name lookups)
- SMILES generator (DFS, no rings yet)
- Live Inspector panel + HUD
- Dark-lab aesthetic with bloom + vignette postprocessing
- Audio: synthesized bond-formation cues via Tone.js
- Keyboard shortcuts for element select and reset

## Not yet implemented (Phase 4–5 of the spec)

- Reaction mode + electron flow arrows
- Molecule library (pre-built water/methane/benzene/etc.)
- Tutorial walkthrough
- Export: SMILES copy, XYZ file, PNG screenshot, share link
- Settings panel
- Mouse fallback for camera-denied / no-hands mode
- Per-finger element assignment grid
- Tests (Vitest + Playwright)
- rdkit-js for canonical SMILES + 2D structure export
- Web Worker for MediaPipe inference
- Lone-pair visualization, orbital clouds, VSEPR guide overlays
- Colorblind mode

## Known caveats

- MediaPipe's Z coordinate is estimated; bond distance uses X+Y+Z but real-feel depends on lighting + camera quality.
- Performance target is 30fps on a 4-year-old laptop. If you see jank, reduce bloom intensity or disable postprocessing entirely.
- Ring molecules (benzene, etc.) won't get proper SMILES yet (no ring closure digits).
