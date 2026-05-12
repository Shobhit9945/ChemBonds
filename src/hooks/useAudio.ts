import { useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useSettingsStore } from '../store/settingsStore';

type SfxName =
  | 'atomSpawn'
  | 'bondSingle'
  | 'bondDouble'
  | 'bondTriple'
  | 'bondBreak'
  | 'valenceError'
  | 'reactionStart'
  | 'reactionComplete'
  | 'save';

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const initRef = useRef(false);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);

  const ensureInit = useCallback(async () => {
    if (initRef.current) return;
    await Tone.start();
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.2 },
      oscillator: { type: 'sine' },
    }).toDestination();
    synthRef.current.volume.value = -10;
    initRef.current = true;
  }, []);

  const play = useCallback(
    async (name: SfxName) => {
      if (!audioEnabled) return;
      await ensureInit();
      const synth = synthRef.current;
      if (!synth) return;
      const now = Tone.now();
      switch (name) {
        case 'atomSpawn':
          synth.triggerAttackRelease('A4', '16n', now);
          break;
        case 'bondSingle':
          synth.triggerAttackRelease('A3', '16n', now);
          break;
        case 'bondDouble':
          synth.triggerAttackRelease(['A3', 'E4'], '8n', now);
          break;
        case 'bondTriple':
          synth.triggerAttackRelease(['A3', 'E4', 'A4'], '8n', now);
          break;
        case 'bondBreak':
          synth.triggerAttackRelease('C3', '16n', now);
          synth.triggerAttackRelease('A2', '16n', now + 0.06);
          break;
        case 'valenceError':
          synth.triggerAttackRelease('E2', '8n', now);
          break;
        case 'reactionStart':
          synth.triggerAttackRelease(['C4', 'E4'], '8n', now);
          break;
        case 'reactionComplete':
          synth.triggerAttackRelease(['C5', 'E5', 'G5'], '4n', now);
          break;
        case 'save':
          synth.triggerAttackRelease('E5', '16n', now);
          break;
      }
    },
    [audioEnabled, ensureInit]
  );

  return { play };
}
