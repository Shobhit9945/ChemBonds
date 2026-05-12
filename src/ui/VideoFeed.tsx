import { forwardRef } from 'react';

interface Props {
  status: string;
}

export const VideoFeed = forwardRef<HTMLVideoElement, Props>(({ status }, ref) => {
  return (
    <div className="absolute bottom-20 left-4 w-[240px] h-[135px] rounded-md overflow-hidden border border-border shadow-xl z-10 pointer-events-none">
      <video
        ref={ref}
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
        autoPlay
      />
      <div className="absolute inset-0 bg-bg/45" />
      <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            status === 'tracking' ? 'bg-success animate-pulse' : 'bg-warning'
          }`}
        />
        <span className="text-[10px] uppercase tracking-wider text-text-primary/90 font-mono">
          {status === 'tracking' ? 'Tracking' : status === 'denied' ? 'No camera' : status}
        </span>
      </div>
    </div>
  );
});

VideoFeed.displayName = 'VideoFeed';
