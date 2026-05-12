import { useMemo } from 'react';
import { useMoleculeStore } from '../store/moleculeStore';
import { computeVsepr, actualBondAngle, isPolar } from '../chemistry/VseprEngine';
import { generateSmiles } from '../chemistry/SmilesGenerator';
import { nameMolecule } from '../chemistry/IupacNamer';

export function InfoPanel() {
  const molecule = useMoleculeStore((s) => s.molecule);
  const revision = useMoleculeStore((s) => s.revision);
  const inspectedAtomId = useMoleculeStore((s) => s.inspectedAtomId);

  const data = useMemo(() => {
    void revision;
    const atoms = molecule.atomList.filter((a) => !a.isGhost);
    if (atoms.length === 0) return null;
    const seed =
      (inspectedAtomId ? molecule.atoms.get(inspectedAtomId) : null) ??
      atoms.find((a) => a.element !== 'H' && a.bonds.length > 0) ??
      atoms[0];

    const vsepr = computeVsepr(seed);
    const polar = isPolar(seed);
    const smiles = generateSmiles(molecule, seed);
    const name = nameMolecule(molecule, seed);
    const weight = molecule.molecularWeight(seed);
    const formula = molecule.formula(seed);

    let actualAngle: number | null = null;
    if (seed.bonds.length >= 2) {
      const a = seed.bonds[0].other(seed);
      const b = seed.bonds[1].other(seed);
      actualAngle = actualBondAngle(seed, a, b);
    }

    return { seed, vsepr, polar, smiles, name, weight, formula, actualAngle };
  }, [molecule, revision, inspectedAtomId]);

  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-surface/60 backdrop-blur overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[11px] uppercase tracking-wider text-text-muted">Inspector</div>
        <div className="text-xs text-text-secondary">Live molecular properties</div>
      </div>

      {!data ? (
        <div className="p-6 text-center text-text-muted text-sm">
          Show your hands to the camera. Each fingertip becomes an atom.
        </div>
      ) : (
        <div className="p-3 space-y-3 text-sm">
          <Row label="Name" value={data.name ?? 'Too complex to name'} mono={!data.name} />
          <Row label="Formula" value={data.formula} mono />
          <Row label="Mol. weight" value={`${data.weight.toFixed(2)} g/mol`} />
          <Divider />
          <Row label="Shape" value={data.vsepr.shape} />
          <Row label="Ideal angle" value={data.vsepr.idealAngle !== null ? `${data.vsepr.idealAngle}°` : '—'} />
          <Row label="Actual angle" value={data.actualAngle !== null ? `${data.actualAngle.toFixed(1)}°` : '—'} />
          <Row label="Hybridization" value={data.vsepr.hybridization} />
          <Row label="Lone pairs" value={String(data.vsepr.lonePairs)} />
          <Row label="Polarity" value={data.polar ? 'Polar' : 'Nonpolar'} />
          <Divider />
          <Row label="SMILES" value={data.smiles} mono />
          <Divider />
          <div className="rounded-md border border-border bg-bg/40 p-2">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Selected atom</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base">{data.seed.element}</span>
              <span className="text-xs text-text-secondary">
                bonds {data.seed.valenceUsed} / {data.seed.maxValence}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-bg overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(data.seed.valenceUsed / data.seed.maxValence) * 100}%`,
                  background: data.seed.isFull ? '#F85149' : '#3FB950',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-text-muted text-xs uppercase tracking-wider">{label}</span>
      <span className={`text-text-primary text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border" />;
}
