import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TrackedHand } from '../tracking/useHandTracking';
import { landmarkToWorld } from '../tracking/LandmarkMapper';
import { FINGERTIP_IDS, BOND_THRESHOLD, BOND_BREAK_THRESHOLD, GHOST_FRAMES, DOUBLE_BOND_DWELL_MS, TRIPLE_BOND_DWELL_MS } from '../utils/constants';
import { useMoleculeStore } from '../store/moleculeStore';
import { useSettingsStore } from '../store/settingsStore';
import { Atom } from '../chemistry/Atom';
import { Bond } from '../chemistry/Bond';
import { AtomMesh } from './AtomMesh';
import { BondMesh } from './BondMesh';
import { HandGhosts } from './HandGhosts';
import { GridFloor } from './GridFloor';
import { useAudio } from '../hooks/useAudio';

interface Props {
  handsRef: React.MutableRefObject<TrackedHand[]>;
}

/**
 * Engine loop: maps each visible fingertip to an Atom (creating one if needed),
 * updates atom positions, detects pairwise bonding & bond breaks, enforces valence.
 * Runs entirely in useFrame — does NOT push per-frame data into React state.
 */
function MoleculeEngine({ handsRef }: Props) {
  const fingerAtomsRef = useRef<(Atom | null)[]>(new Array(10).fill(null));
  const fingerLastSeenRef = useRef<number[]>(new Array(10).fill(0));
  const proximityDwellRef = useRef<Map<string, number>>(new Map()); // pair-key → firstClose timestamp ms
  const frameRef = useRef(0);

  const moleculeStore = useMoleculeStore.getState; // imperative access — no re-renders
  const settingsStore = useSettingsStore.getState;
  const { play } = useAudio();

  useFrame(() => {
    frameRef.current += 1;
    const frame = frameRef.current;
    const hands = handsRef.current;
    const { molecule, fingerElements, bumpRevision } = moleculeStore();
    const { bondThreshold, enforceValence, activeFingers } = settingsStore();

    // 0) Drop dangling refs whose atoms were removed externally (e.g. via reset()).
    //    Without this, R key bricks the scene — the engine thinks atoms still exist
    //    in their slots and never recreates them.
    let droppedAny = false;
    for (let i = 0; i < 10; i++) {
      const atom = fingerAtomsRef.current[i];
      if (atom && !molecule.atoms.has(atom.id)) {
        fingerAtomsRef.current[i] = null;
        droppedAny = true;
      }
    }
    if (droppedAny) proximityDwellRef.current.clear();

    // 1) Update atom positions from fingertip landmarks; create new atoms as needed.
    //    Map finger slots by handedness, with collision fallback for the case where
    //    MediaPipe momentarily labels both hands the same.
    const claimedBases = new Set<number>();
    for (let h = 0; h < hands.length; h++) {
      const hand = hands[h];
      if (!hand) continue;
      let handBaseIndex = hand.handedness === 'Left' ? 0 : 5;
      if (claimedBases.has(handBaseIndex)) {
        // Collision — try the opposite slot. If that's also claimed, skip this hand.
        handBaseIndex = handBaseIndex === 0 ? 5 : 0;
        if (claimedBases.has(handBaseIndex)) continue;
      }
      claimedBases.add(handBaseIndex);

      for (let f = 0; f < 5; f++) {
        if (!activeFingers[f]) continue; // user disabled this finger
        const fingerIndex = handBaseIndex + f;
        const lm = hand.landmarks[FINGERTIP_IDS[f]];
        if (!lm) continue;
        const pos = landmarkToWorld(lm);

        let atom = fingerAtomsRef.current[fingerIndex];
        const desiredElement = fingerElements[fingerIndex];

        // If the user changed this finger's element, destroy the old atom (and
        // any bonds it carried) so a fresh atom of the new element takes its place.
        // Otherwise the old atom would linger on screen with the previous element.
        if (atom && atom.element !== desiredElement) {
          for (const key of [...proximityDwellRef.current.keys()]) {
            if (key.includes(atom.id)) proximityDwellRef.current.delete(key);
          }
          molecule.removeAtom(atom.id);
          fingerAtomsRef.current[fingerIndex] = null;
          atom = null;
          bumpRevision();
        }

        if (!atom) {
          atom = new Atom(desiredElement, fingerIndex, pos);
          molecule.addAtom(atom);
          fingerAtomsRef.current[fingerIndex] = atom;
          bumpRevision();
          play('atomSpawn');
        } else {
          atom.position.copy(pos);
          atom.isGhost = false;
        }
        fingerLastSeenRef.current[fingerIndex] = frame;
      }
    }

    // 2) Ghost / cull atoms whose fingertip hasn't been seen recently.
    //    Atoms always disappear after GHOST_FRAMES — bonded or not. Previously
    //    bonded atoms were preserved indefinitely, which caused stuck clusters
    //    to pile up. Use the Reset button (or R key) to clear, or rebuild on
    //    the next hand-up. (Save snapshots if you want to preserve a molecule.)
    for (let i = 0; i < 10; i++) {
      const atom = fingerAtomsRef.current[i];
      if (!atom) continue;
      const lastSeen = fingerLastSeenRef.current[i];
      const gap = frame - lastSeen;
      if (gap > 0 && gap <= GHOST_FRAMES) {
        atom.isGhost = true;
      } else if (gap > GHOST_FRAMES) {
        for (const key of [...proximityDwellRef.current.keys()]) {
          if (key.includes(atom.id)) proximityDwellRef.current.delete(key);
        }
        molecule.removeAtom(atom.id); // cascades to remove this atom's bonds
        fingerAtomsRef.current[i] = null;
        bumpRevision();
      }
    }

    // 3) Pairwise bond formation / breaking.
    const activeAtoms = fingerAtomsRef.current.filter((a): a is Atom => a !== null && !a.isGhost);
    for (let i = 0; i < activeAtoms.length; i++) {
      for (let j = i + 1; j < activeAtoms.length; j++) {
        const a = activeAtoms[i];
        const b = activeAtoms[j];
        const d = a.position.distanceTo(b.position);
        const pairKey = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
        const existing = a.bondedWith(b);

        if (d < bondThreshold) {
          if (!existing) {
            if (!enforceValence || (a.remainingValence > 0 && b.remainingValence > 0)) {
              const bond = molecule.addBond(a, b, 1);
              if (bond) {
                proximityDwellRef.current.set(pairKey, performance.now());
                bumpRevision();
                play('bondSingle');
              } else if (enforceValence) {
                play('valenceError');
              }
            } else {
              play('valenceError');
            }
          } else {
            // Upgrade single → double → triple based on dwell time
            const t0 = proximityDwellRef.current.get(pairKey) ?? performance.now();
            const elapsed = performance.now() - t0;
            if (existing.order === 1 && elapsed > DOUBLE_BOND_DWELL_MS) {
              if (molecule.upgradeBond(existing)) {
                bumpRevision();
                play('bondDouble');
              }
            } else if (existing.order === 2 && elapsed > TRIPLE_BOND_DWELL_MS) {
              if (molecule.upgradeBond(existing)) {
                bumpRevision();
                play('bondTriple');
              }
            }
          }
        } else if (existing && d > BOND_BREAK_THRESHOLD) {
          molecule.removeBond(existing.id);
          proximityDwellRef.current.delete(pairKey);
          bumpRevision();
          play('bondBreak');
        }
      }
    }
  });

  return null;
}

/** Subscribes to molecule revisions and renders atom/bond meshes. */
function MoleculeRenderer() {
  const molecule = useMoleculeStore((s) => s.molecule);
  const revision = useMoleculeStore((s) => s.revision);
  const inspectedAtomId = useMoleculeStore((s) => s.inspectedAtomId);
  // revision read just to trigger re-render on mutation
  void revision;

  return (
    <group>
      {molecule.atomList.map((atom: Atom) => (
        <AtomMesh
          key={atom.id}
          atom={atom}
          isInspected={inspectedAtomId === atom.id}
          isGhost={atom.isGhost}
          showLabel={true}
        />
      ))}
      {molecule.bondList.map((bond: Bond) => (
        <BondMesh key={bond.id} bond={bond} />
      ))}
    </group>
  );
}

export function MoleculeScene({ handsRef }: Props) {
  const bloomIntensity = useSettingsStore((s) => s.bloomIntensity);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0D1117' }}
    >
      <color attach="background" args={['#0D1117']} />
      <fog attach="fog" args={['#0D1117', 8, 25]} />

      <ambientLight intensity={0.35} color="#4488ff" />
      <directionalLight position={[8, 10, 5]} intensity={0.9} color="#ffffff" castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#ff4422" />

      <GridFloor />
      <HandGhosts handsRef={handsRef} />
      <MoleculeRenderer />
      <MoleculeEngine handsRef={handsRef} />

      <OrbitControls makeDefault enablePan={false} enableZoom={true} minDistance={2} maxDistance={20} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={bloomIntensity} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
