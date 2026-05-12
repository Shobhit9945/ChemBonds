import type { Landmark } from './LandmarkMapper';

export interface HandFrame {
  hands: Landmark[][];          // up to 2 hands × 21 landmarks
  handedness: ('Left' | 'Right')[];
  timestamp: number;
}

export type HandFrameListener = (frame: HandFrame) => void;

const MEDIAPIPE_VERSION = '0.4.1675469240';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_VERSION}`;

/**
 * MediaPipe Hands ships as a UMD script that attaches `Hands` to `window`.
 * The ESM `import` does not give us the constructor, so we inject the CDN
 * script tag and read `window.Hands` once it loads.
 */
let mediapipeLoadPromise: Promise<any> | null = null;
function loadMediaPipe(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as any;
  if (w.Hands) return Promise.resolve(w.Hands);
  if (mediapipeLoadPromise) return mediapipeLoadPromise;

  mediapipeLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${CDN_BASE}/hands.js`;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      if (w.Hands) resolve(w.Hands);
      else reject(new Error('MediaPipe loaded but window.Hands is undefined'));
    };
    script.onerror = () => reject(new Error('Failed to load MediaPipe Hands script from CDN'));
    document.head.appendChild(script);
  });
  return mediapipeLoadPromise;
}

export class HandTracker {
  private video: HTMLVideoElement;
  private listeners = new Set<HandFrameListener>();
  private running = false;
  private hands: any = null;
  private rafId: number | null = null;
  private stream: MediaStream | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  onFrame(listener: HandFrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.running) return;
    const Hands = await loadMediaPipe();
    this.hands = new Hands({
      locateFile: (file: string) => `${CDN_BASE}/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.72,
      minTrackingConfidence: 0.55,
    });
    this.hands.onResults((results: any) => {
      const hands = (results.multiHandLandmarks ?? []) as Landmark[][];
      const handedness =
        (results.multiHandedness ?? []).map((h: any) =>
          h.label === 'Left' ? 'Right' : 'Left'  // flip for mirrored feed
        ) as ('Left' | 'Right')[];
      const frame: HandFrame = { hands, handedness, timestamp: performance.now() };
      for (const l of this.listeners) l(frame);
    });

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' },
      audio: false,
    });
    this.video.srcObject = this.stream;
    this.video.playsInline = true;
    this.video.muted = true;
    await this.video.play();

    this.running = true;
    const loop = async () => {
      if (!this.running) return;
      try {
        await this.hands.send({ image: this.video });
      } catch {
        // swallow per-frame errors; keep loop alive
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.stream) {
      for (const t of this.stream.getTracks()) t.stop();
      this.stream = null;
    }
    if (this.hands) {
      try { this.hands.close(); } catch { /* noop */ }
      this.hands = null;
    }
  }
}
