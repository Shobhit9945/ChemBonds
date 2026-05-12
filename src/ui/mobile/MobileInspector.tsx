import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMoleculeStore } from '../../store/moleculeStore';
import { computeVsepr, actualBondAngle, isPolar } from '../../chemistry/VseprEngine';
import { generateSmiles } from '../../chemistry/SmilesGenerator';
import { nameMolecule } from '../../chemistry/IupacNamer';

interface Props {
  onClose: () => void;
}

export function MobileInspector({ onClose }: Props) {
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
    <motion.div
      className="absolute inset-0 z-40 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="flex-1 bg-bg/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close inspector"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="bg-surface border-t border-border rounded-t-2xl max-h-[80%] flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted">
              Inspector
            </div>
            <div className="text-sm text-text-primary">Live molecular properties</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-text-secondary active:bg-bg/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!data ? (
          <div className="p-6 text-center text-text-muted text-sm">
            Show your hands to the camera. Each fingertip becomes an atom.
          </div>
        ) : (
          <div className="p-4 space-y-3 text-sm overflow-y-auto">
            <Row label="Name" value={data.name ?? 'Too complex to name'} mono={!data.name} />
            <Row label="Formula" value={data.formula} mono />
            <Row label="Mol. weight" value={`${data.weight.toFixed(2)} g/mol`} />
            <Divider />
            <Row label="Shape" value={data.vsepr.shape} />
            <Row
              label="Ideal angle"
              value={data.vsepr.idealAngle !== null ? `${data.vsepr.idealAngle}°` : '—'}
            />
            <Row
              label="Actual angle"
              value={
                data.actualAngle !== null ? `${data.actualAngle.toFixed(1)}°` : '—'
              }
            />
            <Row label="Hybridization" value={data.vsepr.hybridization} />
            <Row label="Lone pairs" value={String(data.vsepr.lonePairs)} />
            <Row label="Polarity" value={data.polar ? 'Polar' : 'Nonpolar'} />
            <Divider />
            <Row label="SMILES" value={data.smiles} mono />
            <Divider />
            <div className="rounded-md border border-border bg-bg/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                Selected atom
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg">{data.seed.element}</span>
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
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-text-muted text-xs uppercase tracking-wider">{label}</span>
      <span
        className={`text-text-primary text-right ${mono ? 'font-mono text-xs break-all' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border" />;
}
