import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { ELEMENTS, ELEMENT_ORDER, ElementSymbol } from '../../chemistry/elements.data';
import { useMoleculeStore } from '../../store/moleculeStore';
import { FingerMask, useSettingsStore } from '../../store/settingsStore';

const FINGER_LABELS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

const PRESETS: { label: string; mask: FingerMask }[] = [
  { label: 'All', mask: [true, true, true, true, true] },
  { label: 'Index', mask: [false, true, false, false, false] },
  { label: 'Index+Thumb', mask: [true, true, false, false, false] },
];

function masksEqual(a: FingerMask, b: FingerMask): boolean {
  for (let i = 0; i < 5; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function MobileSheet() {
  const [expanded, setExpanded] = useState(false);

  const selectedElement = useMoleculeStore((s) => s.selectedElement);
  const setSelectedElement = useMoleculeStore((s) => s.setSelectedElement);
  const setAllFingers = useMoleculeStore((s) => s.setAllFingers);

  const activeFingers = useSettingsStore((s) => s.activeFingers);
  const setActiveFinger = useSettingsStore((s) => s.setActiveFinger);
  const setActiveFingers = useSettingsStore((s) => s.setActiveFingers);

  const handleSelect = (el: ElementSymbol) => {
    setSelectedElement(el);
    setAllFingers(el);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.06, bottom: 0.2 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40 || info.velocity.y < -300) setExpanded(true);
        else if (info.offset.y > 40 || info.velocity.y > 300) setExpanded(false);
      }}
      className="shrink-0 bg-surface/95 backdrop-blur border-t border-border rounded-t-2xl z-20 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* drag handle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full pt-2 pb-1 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
        aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
        aria-expanded={expanded}
      >
        <span className="block w-10 h-1 rounded-full bg-text-muted/60" />
        <ChevronUp
          className={`w-3.5 h-3.5 text-text-muted transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* element chips — always visible */}
      <div className="px-3 pb-2">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
          Element
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {ELEMENT_ORDER.map((el) => {
            const info = ELEMENTS[el];
            const active = selectedElement === el;
            return (
              <button
                key={el}
                onClick={() => handleSelect(el)}
                className={`shrink-0 snap-start w-12 h-14 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                  active
                    ? 'border-accent bg-accent/15'
                    : 'border-border bg-bg/50 active:bg-bg/70'
                }`}
                aria-pressed={active}
                aria-label={info.name}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/40 mb-0.5"
                  style={{
                    backgroundColor: info.color,
                    boxShadow: `0 0 8px ${info.color}55`,
                  }}
                />
                <span className="font-mono text-sm leading-none text-text-primary">
                  {el}
                </span>
                <span className="text-[9px] text-text-muted leading-tight mt-0.5">
                  val {info.maxValence}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-1 pb-3 border-t border-border/60 space-y-3">
              {/* preset row */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">
                    Fingertips
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {activeFingers.filter(Boolean).length} of 5
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESETS.map((p) => {
                    const active = masksEqual(p.mask, activeFingers);
                    return (
                      <button
                        key={p.label}
                        onClick={() => setActiveFingers(p.mask)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          active
                            ? 'border-accent text-accent bg-accent/10'
                            : 'border-border text-text-secondary active:bg-bg/60'
                        }`}
                        aria-pressed={active}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* per-finger grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {FINGER_LABELS.map((label, i) => {
                  const on = activeFingers[i];
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveFinger(i, !on)}
                      className={`py-2 rounded-lg border flex flex-col items-center transition-colors ${
                        on
                          ? 'border-success/70 bg-success/10 text-text-primary'
                          : 'border-border bg-bg/40 text-text-muted'
                      }`}
                      aria-pressed={on}
                      aria-label={`${on ? 'Disable' : 'Enable'} ${label}`}
                    >
                      <span
                        className={`block w-2 h-2 rounded-full mb-1 ${
                          on ? 'bg-success' : 'bg-text-muted'
                        }`}
                        aria-hidden
                      />
                      <span className="text-[10px] leading-none">{label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-text-muted leading-relaxed">
                Bring two enabled fingertips close together → bond forms.
                Hold 1.5s → double bond. 3s → triple. Pull apart → break.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
