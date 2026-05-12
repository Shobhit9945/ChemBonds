import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MoleculeScene } from '../../scene/MoleculeScene';
import { VideoFeed } from '../VideoFeed';
import { LoadingScreen } from '../LoadingScreen';
import { MobileHUD } from './MobileHUD';
import { MobileSheet } from './MobileSheet';
import { MobileInspector } from './MobileInspector';
import { TrackedHand } from '../../tracking/useHandTracking';
import { useMoleculeStore } from '../../store/moleculeStore';

interface Props {
  handsRef: React.MutableRefObject<TrackedHand[]>;
  status: 'idle' | 'requesting' | 'tracking' | 'denied' | 'error';
  startTracking: () => Promise<void>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

export function MobileLayout({ handsRef, status, startTracking, videoRef }: Props) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const reset = useMoleculeStore((s) => s.reset);

  return (
    <div className="h-full w-full flex flex-col bg-bg overflow-hidden">
      <MobileHUD
        trackingStatus={status}
        onOpenInspector={() => setInspectorOpen(true)}
        onReset={reset}
      />

      <main className="flex-1 relative min-h-0">
        <MoleculeScene handsRef={handsRef} />
        <VideoFeed ref={videoRef} status={status} compact />
        <LoadingScreen status={status} onStart={startTracking} />

        <AnimatePresence>
          {inspectorOpen && <MobileInspector onClose={() => setInspectorOpen(false)} />}
        </AnimatePresence>
      </main>

      <MobileSheet />
    </div>
  );
}
