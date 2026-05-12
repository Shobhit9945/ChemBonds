// Coordinate mapping
export const WORLD_SCALE = 8;
export const DEPTH_SCALE = 3;

// Bond thresholds (Three.js world units)
export const BOND_THRESHOLD = 0.8;
export const BOND_BREAK_THRESHOLD = 1.2;

// Gesture detection
export const PINCH_THRESHOLD = 0.04; // normalized
export const GESTURE_DEBOUNCE_FRAMES = 8;

// Bond order timing (ms) — hold-to-upgrade
export const DOUBLE_BOND_DWELL_MS = 1500;
export const TRIPLE_BOND_DWELL_MS = 3000;

// Tracking
export const LANDMARK_SMOOTHING = 0.7; // EMA: prev * α + current * (1-α) -- we use 0.7 for prev
export const LANDMARK_DEADZONE = 0.005;
export const GHOST_FRAMES = 15;

// Fingertip landmark IDs
export const FINGERTIP_IDS = [4, 8, 12, 16, 20] as const;
export const KNUCKLE_IDS = [3, 7, 11, 15, 19] as const;
export const WRIST_ID = 0;
