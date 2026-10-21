import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { CubeColorType } from '../../types/cube';
import { getFaceColor } from '../../engine/cube';

interface CubieProps {
  colors: (CubeColorType | null)[];
}

export interface CubieHandle {
  getGroup: () => THREE.Group | null;
  updateColors: (colors: (CubeColorType | null)[]) => void;
}

const Cubie = forwardRef<CubieHandle, CubieProps>(({ colors: _colors }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Materials are created once with default color, never recreated.
  // Colors are updated imperatively via updateColors() to avoid
  // React re-render causing material rebuild and visual flash.
  const materials = useRef(
    Array.from({ length: 6 }, () =>
      new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.3, metalness: 0.1 }),
    ),
  ).current;

  useImperativeHandle(ref, () => ({
    getGroup: () => groupRef.current,
    updateColors: (newColors: (CubeColorType | null)[]) => {
      const mesh = meshRef.current;
      if (!mesh) return;
      const mats = mesh.material as THREE.MeshStandardMaterial[];
      if (!Array.isArray(mats)) return;
      newColors.forEach((color, i) => {
        if (mats[i]) {
          const hexColor = color === null || color === undefined ? '#111111' : getFaceColor(color);
          mats[i].color.set(hexColor);
        }
      });
    },
  }));

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
      </mesh>
    </group>
  );
});

Cubie.displayName = 'Cubie';
export default Cubie;
