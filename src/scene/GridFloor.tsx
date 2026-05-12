import { Grid } from '@react-three/drei';

export function GridFloor() {
  return (
    <Grid
      position={[0, -3, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.6}
      cellColor="#30363D"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#484F58"
      fadeDistance={18}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
