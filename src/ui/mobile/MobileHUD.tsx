import { useMemo } from 'react';
import { FlaskConical, Info, RotateCcw } from 'lucide-react';
import { useMoleculeStore } from '../../store/moleculeStore';
import { nameMolecule } from '../../chemistry/IupacNamer';

interface Props {
  trackingStatus: string;
  onOpenInspector: () => void;
  onReset: () => void;
}

export function MobileHUD({ trackingStatus, onOpenInspector, onReset }: Props) {
  const molecule = useMoleculeStore((s) => s.molecule);
  const revision = useMoleculeStore((s) => s.revision);

  const summary = useMemo(() => {
    void revision;
    const atoms = molecule.atomList.filter((a) => !a.isGhost);
    if (atoms.length === 0) return { name: 'MoleculeForge', formula: 'Show your hands' };
    const seed =
      atoms.find((a) => a.element !== 'H' && a.bonds.length > 0) ?? atoms[0];
    const name = nameMolecule(molecule, seed) ?? 'Custom structure';
    const formula = molecule.formula(seed);
    return { name, formula };
  }, [molecule, revision]);

  return (
    <header
      className="shrink-0 px-3 pb-2 flex items-center gap-2 border-b border-border bg-surface/95 backdrop-blur z-20"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <FlaskConical className="w-5 h-5 text-accent shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="font-display text-sm leading-tight text-text-primary truncate">
          {summary.name}
        </div>
        <div className="font-mono text-[11px] leading-tight text-text-secondary truncate">
          {summary.formula}
        </div>
      </div>

      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
          trackingStatus === 'tracking'
            ? 'border-success/40 bg-success/10'
            : trackingStatus === 'denied' || trackingStatus === 'error'
            ? 'border-danger/40 bg-danger/10'
            : 'border-warning/40 bg-warning/10'
        }`}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            trackingStatus === 'tracking'
              ? 'bg-success animate-pulse'
              : trackingStatus === 'denied' || trackingStatus === 'error'
              ? 'bg-danger'
              : 'bg-warning'
          }`}
        />
      </div>

      <button
        onClick={onReset}
        aria-label="Reset scene"
        className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-text-secondary active:bg-bg/60"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        onClick={onOpenInspector}
        aria-label="Open inspector"
        className="w-9 h-9 flex items-center justify-center rounded-md border border-accent/50 bg-accent/10 text-accent active:bg-accent/20"
      >
        <Info className="w-4 h-4" />
      </button>
    </header>
  );
}
