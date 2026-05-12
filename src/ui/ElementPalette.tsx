import { ELEMENTS, ELEMENT_ORDER, ElementSymbol } from '../chemistry/elements.data';
import { useMoleculeStore } from '../store/moleculeStore';

export function ElementPalette() {
  const selected = useMoleculeStore((s) => s.selectedElement);
  const setSelectedElement = useMoleculeStore((s) => s.setSelectedElement);
  const setAllFingers = useMoleculeStore((s) => s.setAllFingers);

  const handleSelect = (el: ElementSymbol) => {
    setSelectedElement(el);
    setAllFingers(el);
  };

  return (
    <aside className="w-[180px] shrink-0 border-r border-border bg-surface/60 backdrop-blur flex flex-col">
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[11px] uppercase tracking-wider text-text-muted">Element</div>
        <div className="text-xs text-text-secondary">Select for all fingertips</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {ELEMENT_ORDER.map((el) => {
          const info = ELEMENTS[el];
          const active = selected === el;
          return (
            <button
              key={el}
              onClick={() => handleSelect(el)}
              className={`group relative rounded-md border p-2 flex flex-col items-center transition-colors ${
                active
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-bg/40 hover:border-text-secondary'
              }`}
              aria-pressed={active}
            >
              <span
                className="w-6 h-6 rounded-full border border-black/40 mb-1"
                style={{ backgroundColor: info.color, boxShadow: `0 0 12px ${info.color}55` }}
              />
              <span className="font-mono text-base leading-none text-text-primary">{el}</span>
              <span className="text-[10px] text-text-muted mt-0.5">{info.name}</span>
              <span className="text-[10px] text-text-secondary">val {info.maxValence}</span>
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-border text-[10px] text-text-muted leading-relaxed">
        Tip: hold two fingertips close — single → double → triple bond as you dwell.
      </div>
    </aside>
  );
}
