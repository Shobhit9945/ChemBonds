import { FingerMask, useSettingsStore } from '../store/settingsStore';

const FINGER_LABELS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

const PRESETS: { label: string; mask: FingerMask }[] = [
  { label: 'All', mask: [true, true, true, true, true] },
  { label: 'Index only', mask: [false, true, false, false, false] },
  { label: 'Index + Thumb', mask: [true, true, false, false, false] },
  { label: 'Index + Middle', mask: [false, true, true, false, false] },
];

function masksEqual(a: FingerMask, b: FingerMask): boolean {
  for (let i = 0; i < 5; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function FingerToggle() {
  const activeFingers = useSettingsStore((s) => s.activeFingers);
  const setActiveFinger = useSettingsStore((s) => s.setActiveFinger);
  const setActiveFingers = useSettingsStore((s) => s.setActiveFingers);

  return (
    <div className="px-3 py-3 border-t border-border space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-wider text-text-muted">Fingertips</span>
        <span className="text-[10px] text-text-secondary">
          {activeFingers.filter(Boolean).length} of 5
        </span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {PRESETS.map((p) => {
          const active = masksEqual(p.mask, activeFingers);
          return (
            <button
              key={p.label}
              onClick={() => setActiveFingers(p.mask)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                active
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-text-secondary hover:border-text-secondary'
              }`}
              aria-pressed={active}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {FINGER_LABELS.map((label, i) => {
          const on = activeFingers[i];
          return (
            <button
              key={label}
              onClick={() => setActiveFinger(i, !on)}
              className={`text-[10px] px-1 py-1.5 rounded border transition-colors flex flex-col items-center ${
                on
                  ? 'border-success/70 bg-success/10 text-text-primary'
                  : 'border-border bg-bg/30 text-text-muted hover:border-text-secondary'
              }`}
              aria-pressed={on}
              aria-label={`${on ? 'Disable' : 'Enable'} ${label} tracking`}
              title={`${on ? 'Disable' : 'Enable'} ${label}`}
            >
              <span
                className={`block w-1.5 h-1.5 rounded-full mb-1 ${
                  on ? 'bg-success' : 'bg-text-muted'
                }`}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted leading-relaxed">
        Applies symmetrically to both hands. Disabled fingertips spawn no atoms.
      </p>
    </div>
  );
}
