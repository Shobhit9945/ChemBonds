import { useMemo } from 'react';
import { Atom, FlaskConical, HelpCircle, Save } from 'lucide-react';
import { useMoleculeStore } from '../store/moleculeStore';
import { nameMolecule } from '../chemistry/IupacNamer';
import { generateSmiles } from '../chemistry/SmilesGenerator';

interface Props {
  trackingStatus: string;
}

export function HUD({ trackingStatus }: Props) {
  const molecule = useMoleculeStore((s) => s.molecule);
  const revision = useMoleculeStore((s) => s.revision);

  const summary = useMemo(() => {
    void revision;
    const atoms = molecule.atomList.filter((a) => !a.isGhost);
    if (atoms.length === 0) return { name: '—', formula: '∅', smiles: '' };
    // pick the largest connected component containing a non-H atom if possible
    const seed = atoms.find((a) => a.element !== 'H' && a.bonds.length > 0) ?? atoms[0];
    const name = nameMolecule(molecule, seed) ?? 'Unnamed structure';
    const formula = molecule.formula(seed);
    const smiles = generateSmiles(molecule, seed);
    return { name, formula, smiles };
  }, [molecule, revision]);

  return (
    <header className="h-12 px-4 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur z-20 relative">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-accent" />
        <span className="font-display font-semibold tracking-wide text-text-primary">MoleculeForge</span>
        <span className="text-text-muted text-sm hidden md:inline">Build chemistry with your hands</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-display text-text-primary leading-tight">{summary.name}</div>
          <div className="font-mono text-xs text-text-secondary leading-tight">{summary.formula}</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-bg/50">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              trackingStatus === 'tracking'
                ? 'bg-success animate-pulse'
                : trackingStatus === 'denied' || trackingStatus === 'error'
                ? 'bg-danger'
                : 'bg-warning'
            }`}
          />
          <span className="text-xs uppercase tracking-wide text-text-secondary">{trackingStatus}</span>
        </div>
        <button
          className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 bg-surface border border-border hover:border-accent transition-colors"
          aria-label="Save molecule"
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>
        <button
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <Atom className="w-5 h-5 text-text-muted" aria-hidden />
      </div>
    </header>
  );
}
