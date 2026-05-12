const GUIDE = [
  { gesture: 'Open palm', action: 'Hold atoms on each fingertip' },
  { gesture: 'Approach', action: 'Bring two fingertips < 0.8u → bond forms' },
  { gesture: 'Dwell 1.5s', action: 'Single → double bond' },
  { gesture: 'Dwell 3s', action: 'Double → triple bond' },
  { gesture: 'Separate', action: 'Pull apart > 1.2u → bond breaks' },
  { gesture: 'Point', action: 'Inspect atom' },
];

export function GestureGuide() {
  return (
    <footer className="h-16 px-4 border-t border-border bg-surface/80 backdrop-blur flex items-center gap-6 overflow-x-auto z-20 relative">
      {GUIDE.map((g) => (
        <div key={g.gesture} className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-text-muted">
            {g.gesture}
          </span>
          <span className="text-text-muted">→</span>
          <span className="text-xs text-text-secondary whitespace-nowrap">{g.action}</span>
        </div>
      ))}
    </footer>
  );
}
