import { useEffect } from 'react';
import { HUD } from './ui/HUD';
import { ElementPalette } from './ui/ElementPalette';
import { InfoPanel } from './ui/InfoPanel';
import { GestureGuide } from './ui/GestureGuide';
import { VideoFeed } from './ui/VideoFeed';
import { LoadingScreen } from './ui/LoadingScreen';
import { MoleculeScene } from './scene/MoleculeScene';
import { useHandTracking } from './tracking/useHandTracking';
import { useMoleculeStore } from './store/moleculeStore';
import { ELEMENT_ORDER } from './chemistry/elements.data';

export default function App() {
  const { ref: handsRef, status, startTracking, videoRef } = useHandTracking();
  const reset = useMoleculeStore((s) => s.reset);
  const setSelectedElement = useMoleculeStore((s) => s.setSelectedElement);
  const setAllFingers = useMoleculeStore((s) => s.setAllFingers);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 1-9 → element select (C H O N F Cl Br P S)
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < ELEMENT_ORDER.length) {
        const el = ELEMENT_ORDER[idx];
        setSelectedElement(el);
        setAllFingers(el);
      }
      if (e.key.toLowerCase() === 'r') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reset, setSelectedElement, setAllFingers]);

  return (
    <div className="h-full w-full flex flex-col">
      <HUD trackingStatus={status} />
      <div className="flex-1 flex relative min-h-0">
        <ElementPalette />
        <main className="flex-1 relative min-w-0">
          <MoleculeScene handsRef={handsRef} />
          <VideoFeed ref={videoRef} status={status} />
          <LoadingScreen status={status} onStart={startTracking} />
        </main>
        <InfoPanel />
      </div>
      <GestureGuide />

      {/* Screen-reader live summary */}
      <div className="sr-only" aria-live="polite" id="a11y-summary" />
    </div>
  );
}
