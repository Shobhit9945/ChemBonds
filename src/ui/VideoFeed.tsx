import { forwardRef } from 'react';

interface Props {
  status: string;
  /** Smaller picture-in-picture sizing for mobile. */
  compact?: boolean;
}

export const VideoFeed = forwardRef<HTMLVideoElement, Props>(
  ({ status, compact = false }, ref) => {
    const sizeClass = compact
      ? 'w-[110px] h-[62px] bottom-2 left-2'
      : 'w-[240px] h-[135px] bottom-20 left-4';

    return (
      <div
        className={`absolute ${sizeClass} rounded-md overflow-hidden border border-border shadow-xl z-10 pointer-events-none`}
      >
        <video
          ref={ref}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
        />
        <div className="absolute inset-0 bg-bg/45" />
        <div className="absolute top-1 left-1.5 flex items-center gap-1">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              status === 'tracking' ? 'bg-success animate-pulse' : 'bg-warning'
            }`}
          />
          <span className="text-[9px] uppercase tracking-wider text-text-primary/90 font-mono">
            {status === 'tracking' ? 'Live' : status === 'denied' ? 'No cam' : status}
          </span>
        </div>
      </div>
    );
  }
);

VideoFeed.displayName = 'VideoFeed';
