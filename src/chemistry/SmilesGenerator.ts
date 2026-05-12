import { Atom } from './Atom';
import { Molecule } from './Molecule';

/**
 * Minimal SMILES generator via DFS on connected component.
 * Handles single/double/triple bonds and branches with parentheses.
 * Does NOT handle rings or stereo.
 */
export function generateSmiles(molecule: Molecule, seed: Atom): string {
  const visited = new Set<string>();
  function dfs(atom: Atom, parent: Atom | null): string {
    visited.add(atom.id);
    let out = atom.element;
    const neighbors = atom.bonds
      .map((b) => ({ bond: b, other: b.other(atom) }))
      .filter(({ other }) => other !== parent && !visited.has(other.id));

    for (let i = 0; i < neighbors.length; i++) {
      const { bond, other } = neighbors[i];
      const bondStr = bond.order === 2 ? '=' : bond.order === 3 ? '#' : '';
      const branch = bondStr + dfs(other, atom);
      if (i < neighbors.length - 1) {
        out += '(' + branch + ')';
      } else {
        out += branch;
      }
    }
    return out;
  }
  return dfs(seed, null);
}
