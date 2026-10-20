import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  SOLVED_STATE,
  applyMove,
} from '../src/engine/cube';
import { Face } from '../src/types/cube';
import type { CubeState, CubeColorType } from '../src/types/cube';
import { getRotationParams } from '../src/engine/moveSpec';

// getCubieColors and FACE_ORDER replicated from Cube3D for testing
// (getRotationParams is now imported from engine/moveSpec)

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

// ============================================================
// 模拟动画旋转后的 cubie 颜色
// ============================================================

// 6个方向向量，对应 FACE_ORDER 中各面的外法线
const FACE_NORMALS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),   // RIGHT (+x)
  new THREE.Vector3(-1, 0, 0),  // LEFT  (-x)
  new THREE.Vector3(0, 1, 0),   // UP    (+y)
  new THREE.Vector3(0, -1, 0),  // DOWN  (-y)
  new THREE.Vector3(0, 0, 1),   // FRONT (+z)
  new THREE.Vector3(0, 0, -1),  // BACK  (-z)
];

// 方向向量 → 面索引
function normalToFaceIndex(n: THREE.Vector3): number {
  const rx = Math.round(n.x);
  const ry = Math.round(n.y);
  const rz = Math.round(n.z);
  if (rx === 1) return FACE_ORDER.RIGHT;
  if (rx === -1) return FACE_ORDER.LEFT;
  if (ry === 1) return FACE_ORDER.UP;
  if (ry === -1) return FACE_ORDER.DOWN;
  if (rz === 1) return FACE_ORDER.FRONT;
  if (rz === -1) return FACE_ORDER.BACK;
  return -1;
}

// 模拟动画完成后，一个 cubie 在新位置 (nx, ny, nz) 处各面颜色
function getAnimatedCubieColors(
  state: CubeState,
  origX: number, origY: number, origZ: number,
  matrix: THREE.Matrix4,
  params: { axis: 'x' | 'y' | 'z'; layers: number[] }
): { position: [number, number, number]; colors: (CubeColorType | null)[] } | null {
  // 检查是否在旋转层内
  const inLayer = (params.axis === 'x' && params.layers.includes(origX)) ||
                  (params.axis === 'y' && params.layers.includes(origY)) ||
                  (params.axis === 'z' && params.layers.includes(origZ));

  let nx: number, ny: number, nz: number;
  let rotMatrix: THREE.Matrix4;

  if (inLayer) {
    // 应用旋转到位置
    const pos = new THREE.Vector3(origX, origY, origZ).applyMatrix4(matrix);
    nx = Math.round(pos.x);
    ny = Math.round(pos.y);
    nz = Math.round(pos.z);
    rotMatrix = matrix;
  } else {
    nx = origX;
    ny = origY;
    nz = origZ;
    rotMatrix = new THREE.Matrix4(); // identity
  }

  // 获取原始 cubie 颜色
  const origColors = getCubieColors(state, origX, origY, origZ);

  // 动画后的颜色：原来的每个面方向被旋转到新方向
  const newColors: (CubeColorType | null)[] = [null, null, null, null, null, null];

  for (let i = 0; i < 6; i++) {
    if (origColors[i] === null) continue;
    // 原始的第 i 个面（在 cubie 本地坐标系中）的法线方向
    const origNormal = FACE_NORMALS[i].clone();
    // 旋转后该法线指向的新方向
    const newNormal = origNormal.clone().applyMatrix4(rotMatrix);
    // 新方向对应的面索引
    const newFaceIdx = normalToFaceIndex(newNormal);
    if (newFaceIdx >= 0) {
      newColors[newFaceIdx] = origColors[i];
    }
  }

  return { position: [nx, ny, nz], colors: newColors };
}

// ============================================================
// 测试
// ============================================================

const ALL_MOVES = ['U', 'D', 'F', 'B', 'R', 'L', 'M', 'E', 'S',
                   'r', 'l', 'u', 'f', 'd', 'b', 'x', 'y', 'z'];

describe('动画参数 vs 状态一致性测试', () => {
  for (const move of ALL_MOVES) {
    it(`move "${move}" 的动画参数与 applyMove 状态一致`, () => {
      const params = getRotationParams(move);
      expect(params).not.toBeNull();
      if (!params) return;

      // 构建旋转矩阵
      const matrix = new THREE.Matrix4();
      switch (params.axis) {
        case 'x': matrix.makeRotationX(params.angle); break;
        case 'y': matrix.makeRotationY(params.angle); break;
        case 'z': matrix.makeRotationZ(params.angle); break;
      }

      // 1. 用 applyMove 计算目标状态
      const targetState = applyMove(SOLVED_STATE, move);

      // 2. 用动画旋转模拟每个 cubie 的最终位置和颜色
      const animatedCubies: Map<string, (CubeColorType | null)[]> = new Map();

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const result = getAnimatedCubieColors(SOLVED_STATE, x, y, z, matrix, params);
            if (result) {
              const key = `${result.position[0]},${result.position[1]},${result.position[2]}`;
              animatedCubies.set(key, result.colors);
            }
          }
        }
      }

      // 3. 逐 cubie 比较
      const mismatches: string[] = [];

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const key = `${x},${y},${z}`;
            const expectedColors = getCubieColors(targetState, x, y, z);
            const animColors = animatedCubies.get(key);

            if (!animColors) {
              mismatches.push(`pos(${x},${y},${z}): no animated cubie generated`);
              continue;
            }

            for (let fi = 0; fi < 6; fi++) {
              if (expectedColors[fi] !== animColors[fi]) {
                const faceNames = ['RIGHT', 'LEFT', 'UP', 'DOWN', 'FRONT', 'BACK'];
                mismatches.push(
                  `pos(${x},${y},${z}) ${faceNames[fi]}: expected=${expectedColors[fi]}, anim=${animColors[fi]}`
                );
              }
            }
          }
        }
      }

      if (mismatches.length > 0) {
        throw new Error(
          `move "${move}" anim/state mismatch (${mismatches.length} diffs):\n` +
          mismatches.slice(0, 20).join('\n') +
          (mismatches.length > 20 ? `\n...and ${mismatches.length - 20} more` : '')
        );
      }
    });
  }
});
