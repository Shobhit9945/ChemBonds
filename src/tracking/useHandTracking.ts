import { useEffect, useRef, useState } from 'react';
import { HandTracker, HandFrame } from './HandTracker';
import { LandmarkSmoother, Landmark } from './LandmarkMapper';
import { detectGesture, Gesture, GestureDebouncer } from './GestureDetector';

export interface TrackedHand {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture: Gesture;
}

export interface HandTrackingState {
  ref: React.MutableRefObject<TrackedHand[]>;
  status: 'idle' | 'requesting' | 'tracking' | 'denied' | 'error';
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

/**
 * Hand-tracking hook. Writes per-frame data to a ref (NOT React state) to avoid
 * 60fps re-renders. The status string IS in state so the UI can react to it.
 */
export function useHandTracking(): HandTrackingState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<TrackedHand[]>([]);
  const trackerRef = useRef<HandTracker | null>(null);
  const smoothersRef = useRef<LandmarkSmoother[]>([new LandmarkSmoother(), new LandmarkSmoother()]);
  const debouncersRef = useRef<GestureDebouncer[]>([new GestureDebouncer(), new GestureDebouncer()]);
  const [status, setStatus] = useState<HandTrackingState['status']>('idle');

  const startTracking = async () => {
    if (status === 'requesting' || status === 'tracking') return;
    if (!videoRef.current) {
      setStatus('error');
      return;
    }
    trackerRef.current?.stop();
    trackerRef.current = null;
    setStatus('requesting');
    try {
      const tracker = new HandTracker(videoRef.current);
      tracker.onFrame((frame: HandFrame) => {
        const tracked: TrackedHand[] = frame.hands.map((hand, i) => {
          const smoother = smoothersRef.current[i] ?? new LandmarkSmoother();
          const smoothed = hand.map((lm, idx) => smoother.smooth(`${i}-${idx}`, lm));
          const debouncer = debouncersRef.current[i] ?? new GestureDebouncer();
          const gesture = debouncer.push(detectGesture(smoothed));
          return {
            landmarks: smoothed,
            handedness: frame.handedness[i] ?? 'Right',
            gesture,
          };
        });
        handsRef.current = tracked;
      });
      await tracker.start();
      trackerRef.current = tracker;
      setStatus('tracking');
    } catch (e) {
      console.error('Hand tracking failed:', e);
      setStatus((e as Error).name === 'NotAllowedError' ? 'denied' : 'error');
    }
  };

  const stopTracking = () => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    handsRef.current = [];
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      trackerRef.current?.stop();
      trackerRef.current = null;
    };
  }, []);

  return { ref: handsRef, status, startTracking, stopTracking, videoRef };
}
