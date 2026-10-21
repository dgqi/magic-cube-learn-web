import { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Cubie from './Cubie';
import type { CubieHandle } from './Cubie';
import type { CubeState, CubeColorType } from '../../types/cube';
import { Face } from '../../types/cube';
import { getRotationParams } from '../../engine/moveSpec';
import { applyMove } from '../../engine/cube';

interface Cube3DProps {
  state: CubeState;
  animatingMove?: string | null;
  onAnimationComplete?: () => void;
  animationDuration?: number;
}

const FACE_ORDER = {
  RIGHT: 0, LEFT: 1, UP: 2, DOWN: 3, FRONT: 4, BACK: 5,
};

function getCubieColors(state: CubeState, x: number, y: number, z: number): (CubeColorType | null)[] {
  const colors: (CubeColorType | null)[] = [null, null, null, null, null, null];
  if (x === 1) { colors[FACE_ORDER.RIGHT] = state[Face.RIGHT][1-y][1-z]; }
  if (x === -1) { colors[FACE_ORDER.LEFT] = state[Face.LEFT][1-y][z+1]; }
  if (y === 1) { colors[FACE_ORDER.UP] = state[Face.UP][z+1][x+1]; }
  if (y === -1) { colors[FACE_ORDER.DOWN] = state[Face.DOWN][1-z][x+1]; }
  if (z === 1) { colors[FACE_ORDER.FRONT] = state[Face.FRONT][1-y][x+1]; }
  if (z === -1) { colors[FACE_ORDER.BACK] = state[Face.BACK][1-y][1-x]; }
  return colors;
}

// getRotationParams is now imported from engine/moveSpec
// to keep animation and state engine in sync.

// Stable cubie positions — never changes with state.
// Colors are updated imperatively via updateColors() in useLayoutEffect.
const INITIAL_CUBIES: { key: string; position: [number, number, number] }[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      INITIAL_CUBIES.push({ key: `${x},${y},${z}`, position: [x, y, z] });
    }
  }
}

// Placeholder colors — actual colors are set imperatively via useLayoutEffect
const NULL_COLORS: (CubeColorType | null)[] = [null, null, null, null, null, null];

export default function Cube3D({ state, animatingMove, onAnimationComplete, animationDuration = 0.4 }: Cube3DProps) {
  // Update colors imperatively when state changes — no Material rebuild.
  useLayoutEffect(() => {
    INITIAL_CUBIES.forEach(c => {
      const handle = cubieRefs.current[c.key];
      if (handle) {
        handle.updateColors(getCubieColors(state, c.position[0], c.position[1], c.position[2]));
      }
    });
  }, [state]);
  const cubieRefs = useRef<Record<string, CubieHandle>>({});

  const animRef = useRef<{
    axis: 'x' | 'y' | 'z';
    targetAngle: number;
    elapsed: number;
    duration: number;
    layerKeys: string[];
    done: boolean;
    notified: boolean;
  } | null>(null);

  // 当 animatingMove 变化时启动动画
  useEffect(() => {
    if (!animatingMove) {
      // 重置所有 cubie 到 grid 位置
      INITIAL_CUBIES.forEach(c => {
        const handle = cubieRefs.current[c.key];
        const group = handle?.getGroup();
        if (group) {
          group.position.set(c.position[0], c.position[1], c.position[2]);
          group.rotation.set(0, 0, 0);
        }
      });
      animRef.current = null;
      return;
    }

    const params = getRotationParams(animatingMove);
    if (!params) return;

    const layerKeys: string[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if ((params.axis === 'x' && params.layers.includes(x)) ||
              (params.axis === 'y' && params.layers.includes(y)) ||
              (params.axis === 'z' && params.layers.includes(z))) {
            layerKeys.push(`${x},${y},${z}`);
          }
        }
      }
    }

    // 确保所有 cubie 在 grid 位置
    INITIAL_CUBIES.forEach(c => {
      const handle = cubieRefs.current[c.key];
      const group = handle?.getGroup();
      if (group) {
        group.position.set(c.position[0], c.position[1], c.position[2]);
        group.rotation.set(0, 0, 0);
      }
    });

    animRef.current = {
      axis: params.axis,
      targetAngle: params.angle,
      elapsed: 0,
      duration: animationDuration,
      layerKeys,
      done: false,
      notified: false,
    };
  }, [animatingMove]);



  const setCubieRef = (key: string) => (el: CubieHandle | null) => {
    if (el) {
      cubieRefs.current[key] = el;
      const [x, y, z] = key.split(',').map(Number);
      const group = el.getGroup();
      if (group) {
        group.position.set(x, y, z);
      }
    }
  };

  useFrame((_, delta) => {
    const anim = animRef.current;
    if (!anim || anim.done) return;

    anim.elapsed += delta;
    const t = Math.min(anim.elapsed / anim.duration, 1);
    // easeOutCubic 缓动
    const easedProgress = 1 - Math.pow(1 - t, 3);
    const currentAngle = anim.targetAngle * easedProgress;

    // 计算旋转矩阵
    const matrix = new THREE.Matrix4();
    switch (anim.axis) {
      case 'x': matrix.makeRotationX(currentAngle); break;
      case 'y': matrix.makeRotationY(currentAngle); break;
      case 'z': matrix.makeRotationZ(currentAngle); break;
    }

    // 对层内 cubie 应用旋转（不改变父子关系，纯位置计算）
    anim.layerKeys.forEach(key => {
      const handle = cubieRefs.current[key];
      const group = handle?.getGroup();
      if (!group) return;
      const [gx, gy, gz] = key.split(',').map(Number);
      const pos = new THREE.Vector3(gx, gy, gz).applyMatrix4(matrix);
      group.position.copy(pos);
      switch (anim.axis) {
        case 'x': group.rotation.set(currentAngle, 0, 0); break;
        case 'y': group.rotation.set(0, currentAngle, 0); break;
        case 'z': group.rotation.set(0, 0, currentAngle); break;
      }
    });

    // 动画完成：先更新颜色，再重置位置，最后通知父组件（同一帧内完成，无闪烁）
    if (t >= 1) {
      anim.done = true;

      // 1. 计算动画后的新状态
      const newState = applyMove(state, animatingMove!);

      // 2. 立即更新所有 cubie 颜色（直接修改 Material.color，不触发 React re-render）
      INITIAL_CUBIES.forEach(c => {
        const handle = cubieRefs.current[c.key];
        if (handle) {
          handle.updateColors(getCubieColors(newState, c.position[0], c.position[1], c.position[2]));
        }
      });

      // 3. 重置所有 cubie 到 grid 位置
      INITIAL_CUBIES.forEach(c => {
        const handle = cubieRefs.current[c.key];
        const group = handle?.getGroup();
        if (group) {
          group.position.set(c.position[0], c.position[1], c.position[2]);
          group.rotation.set(0, 0, 0);
        }
      });

      // 4. 通知父组件更新状态（仅用于历史记录等簿记，视觉已在步骤2+3同步完成）
      if (onAnimationComplete && !anim.notified) {
        anim.notified = true;
        onAnimationComplete();
      }
    }
  });

  return (
    <group>
      {INITIAL_CUBIES.map((cubie) => (
        <Cubie
          key={cubie.key}
          ref={setCubieRef(cubie.key)}
          colors={NULL_COLORS}
        />
      ))}
    </group>
  );
}
