import { motion } from 'framer-motion';
import { Camera, FlaskConical } from 'lucide-react';

interface Props {
  status: 'idle' | 'requesting' | 'tracking' | 'denied' | 'error';
  onStart: () => void;
}

export function LoadingScreen({ status, onStart }: Props) {
  if (status === 'tracking') return null;

  const message =
    status === 'requesting'
      ? 'Requesting camera access…'
      : status === 'denied'
      ? 'Camera access denied. Allow access in your browser settings, then refresh.'
      : status === 'error'
      ? 'Tracking failed to start. Check the console for details.'
      : 'A hand-tracked 3D chemistry lab in your browser. Build molecules with your fingertips.';

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/95 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md text-center px-6">
        <div className="flex items-center justify-center gap-2 mb-4 text-accent">
          <FlaskConical className="w-7 h-7" />
          <h1 className="font-display text-3xl font-semibold text-text-primary">
            MoleculeForge
          </h1>
        </div>
        <p className="text-text-secondary mb-6">{message}</p>

        {status !== 'denied' && (
          <button
            onClick={onStart}
            disabled={status === 'requesting'}
            className="px-5 py-2.5 rounded-md bg-accent text-bg font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            <Camera className="w-4 h-4" />
            {status === 'requesting' ? 'Starting…' : 'Start tracking'}
          </button>
        )}

        <div className="mt-8 text-[11px] text-text-muted leading-relaxed">
          Camera processing happens entirely in your browser via MediaPipe.
          <br />
          No video is uploaded.
        </div>
      </div>
    </motion.div>
  );
}
