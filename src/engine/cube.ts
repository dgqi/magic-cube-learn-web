import { CubeColor, Face } from '../types/cube';
import type { CubeColorType, CubeState } from '../types/cube';
import { getMoveSpec } from './moveSpec';

// 初始已复原状态
export const SOLVED_STATE: CubeState = [
  // UP (黄色)
  [
    [CubeColor.YELLOW, CubeColor.YELLOW, CubeColor.YELLOW],
    [CubeColor.YELLOW, CubeColor.YELLOW, CubeColor.YELLOW],
    [CubeColor.YELLOW, CubeColor.YELLOW, CubeColor.YELLOW],
  ],
  // DOWN (白色)
  [
    [CubeColor.WHITE, CubeColor.WHITE, CubeColor.WHITE],
    [CubeColor.WHITE, CubeColor.WHITE, CubeColor.WHITE],
    [CubeColor.WHITE, CubeColor.WHITE, CubeColor.WHITE],
  ],
  // FRONT (红色)
  [
    [CubeColor.RED, CubeColor.RED, CubeColor.RED],
    [CubeColor.RED, CubeColor.RED, CubeColor.RED],
    [CubeColor.RED, CubeColor.RED, CubeColor.RED],
  ],
  // BACK (橙色)
  [
    [CubeColor.ORANGE, CubeColor.ORANGE, CubeColor.ORANGE],
    [CubeColor.ORANGE, CubeColor.ORANGE, CubeColor.ORANGE],
    [CubeColor.ORANGE, CubeColor.ORANGE, CubeColor.ORANGE],
  ],
  // RIGHT (蓝色)
  [
    [CubeColor.BLUE, CubeColor.BLUE, CubeColor.BLUE],
    [CubeColor.BLUE, CubeColor.BLUE, CubeColor.BLUE],
    [CubeColor.BLUE, CubeColor.BLUE, CubeColor.BLUE],
  ],
  // LEFT (绿色)
  [
    [CubeColor.GREEN, CubeColor.GREEN, CubeColor.GREEN],
    [CubeColor.GREEN, CubeColor.GREEN, CubeColor.GREEN],
    [CubeColor.GREEN, CubeColor.GREEN, CubeColor.GREEN],
  ],
];

// 复制魔方状态
export function cloneState(state: CubeState): CubeState {
  return state.map((face) => face.map((row) => [...row]));
}

// 面/行/列 → 3D 位置
function faceToPos(face: number, row: number, col: number): [number, number, number] {
  switch (face) {
    case Face.RIGHT: return [1, 1 - row, 1 - col];
    case Face.LEFT: return [-1, 1 - row, col - 1];
    case Face.UP: return [col - 1, 1, row - 1];
    case Face.DOWN: return [col - 1, -1, 1 - row];
    case Face.FRONT: return [col - 1, 1 - row, 1];
    case Face.BACK: return [1 - col, 1 - row, -1];
    default: return [0, 0, 0];
  }
}

// ============================================================
// 旋转矩阵（绕主轴，处理浮点精度）
// ============================================================

function round(v: number): number {
  return Math.round(v);
}

function rotatePosition(
  x: number, y: number, z: number,
  axis: 'x' | 'y' | 'z', angle: number,
): [number, number, number] {
  const c = Math.round(Math.cos(angle));
  const s = Math.round(Math.sin(angle));
  switch (axis) {
    case 'x': return [x, round(c * y - s * z), round(s * y + c * z)];
    case 'y': return [round(c * x + s * z), y, round(-s * x + c * z)];
    case 'z': return [round(c * x - s * y), round(s * x + c * y), z];
  }
}

// 面法线方向的旋转（与位置旋转相同矩阵）
function rotateFaceIndex(face: number, axis: 'x' | 'y' | 'z', angle: number): number {
  const normal: [number, number, number] = [
    face === Face.RIGHT ? 1 : face === Face.LEFT ? -1 : 0,
    face === Face.UP ? 1 : face === Face.DOWN ? -1 : 0,
    face === Face.FRONT ? 1 : face === Face.BACK ? -1 : 0,
  ];
  const [nx, ny, nz] = rotatePosition(normal[0], normal[1], normal[2], axis, angle);
  if (nx === 1) return Face.RIGHT;
  if (nx === -1) return Face.LEFT;
  if (ny === 1) return Face.UP;
  if (ny === -1) return Face.DOWN;
  if (nz === 1) return Face.FRONT;
  if (nz === -1) return Face.BACK;
  return face;
}

// ============================================================
// 核心：基于 MoveSpec 的 applyMove
// ============================================================

/**
 * 对指定层施加旋转，将 oldState 中的贴纸映射到 newState。
 * 关键：使用旋转后的面法线确定目标面，用旋转后的 3D 位置
 * 结合目标面计算正确的行/列（而非使用 posToFace 的行列）。
 */
function applyLayerRotation(
  oldState: CubeState,
  newState: CubeState,
  axis: 'x' | 'y' | 'z',
  layer: number,
  angle: number,
): void {
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const [x, y, z] = faceToPos(faceIdx, row, col);

        const inLayer =
          (axis === 'x' && x === layer) ||
          (axis === 'y' && y === layer) ||
          (axis === 'z' && z === layer);

        if (inLayer) {
          // 旋转后的 3D 位置
          const [nx, ny, nz] = rotatePosition(x, y, z, axis, angle);
          // 旋转后的面法线 → 目标面
          const newFaceIdx = rotateFaceIndex(faceIdx, axis, angle);
          // 用目标面 + 旋转后位置计算正确的行/列
          const [nr, nc] = posToRowCol(newFaceIdx, nx, ny, nz);
          newState[newFaceIdx][nr][nc] = oldState[faceIdx][row][col];
        } else {
          newState[faceIdx][row][col] = oldState[faceIdx][row][col];
        }
      }
    }
  }
}

// 给定目标面和 3D 位置，计算该面内的行/列
function posToRowCol(face: number, x: number, y: number, z: number): [number, number] {
  switch (face) {
    case Face.RIGHT: return [1 - y, 1 - z];
    case Face.LEFT: return [1 - y, z + 1];
    case Face.UP: return [z + 1, x + 1];
    case Face.DOWN: return [1 - z, x + 1];
    case Face.FRONT: return [1 - y, x + 1];
    case Face.BACK: return [1 - y, 1 - x];
    default: return [0, 0];
  }
}

// 执行单次转动
export function applyMove(state: CubeState, move: string): CubeState {
  const spec = getMoveSpec(move);
  if (spec.rotations.length === 0) return cloneState(state);

  let current = state;
  for (const { layer, angle } of spec.rotations) {
    const next = cloneState(current);
    applyLayerRotation(current, next, spec.axis, layer, angle);
    current = next;
  }
  return current;
}

// 应用公式序列
export function applyAlgorithm(state: CubeState, algorithm: string): CubeState {
  const moves = algorithm
    .replace(/[()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0);
  let currentState = cloneState(state);
  for (const move of moves) {
    currentState = applyMove(currentState, move);
  }
  return currentState;
}

// 随机打乱
export function scramble(_state: CubeState, moves: number = 25): string {
  const faceMoves = ["U", "D", "F", "B", "R", "L"];
  const modifiers = ["", "'", "2"];
  let scrambleAlg = "";
  let lastMove = "";

  for (let i = 0; i < moves; i++) {
    let move = faceMoves[Math.floor(Math.random() * faceMoves.length)];
    // 避免连续转动同一个面
    while (move === lastMove) {
      move = faceMoves[Math.floor(Math.random() * faceMoves.length)];
    }
    lastMove = move;
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scrambleAlg += move + modifier + " ";
  }

  return scrambleAlg.trim();
}

// 检查魔方是否已复原
export function isSolved(state: CubeState): boolean {
  for (let face = 0; face < 6; face++) {
    const firstColor = state[face][0][0];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (state[face][i][j] !== firstColor) {
          return false;
        }
      }
    }
  }
  return true;
}

// 获取某个面的颜色（用于 3D 渲染）
export function getFaceColor(color: CubeColorType): string {
  const colors: Record<CubeColorType, string> = {
    [CubeColor.WHITE]: "#FFFFFF",
    [CubeColor.YELLOW]: "#FFD500",
    [CubeColor.RED]: "#FF0000",
    [CubeColor.ORANGE]: "#FF8C00",
    [CubeColor.BLUE]: "#0000FF",
    [CubeColor.GREEN]: "#00FF00",
  };
  return colors[color] || "#808080";
}

// 反转算法（逆序 + 反转每个 move 的修饰符）
// 用于生成正确的教学初始状态：applyAlgorithm(SOLVED_STATE, invertAlgorithm(alg))
// 保证：applyMove(上述结果, alg) === SOLVED_STATE
export function invertAlgorithm(algorithm: string): string {
  const moves = algorithm.replace(/[()]/g, ' ').trim().split(/\s+/).filter(m => m.length > 0);
  return moves.reverse().map(m => {
    if (m.endsWith("'")) return m.slice(0, -1);
    if (m.endsWith("2")) return m;
    return m + "'";
  }).join(' ');
}

// ============================================================
// 显式构建初始状态的工具函数
// 用于为每个公式写死初始魔方状态（而非动态生成）
// ============================================================

// 贴纸修改指令：[面, 行, 列, 颜色]
export type StickerOverride = [number, number, number, CubeColorType];

// 基于还原态，叠加指定的贴纸修改
// 只需关心哪些色块不同，其他保持还原
// stickers: [面, 行, 列, 颜色] 数组
export function modifySolved(stickers: number[][]): CubeState {
  const state = cloneState(SOLVED_STATE);
  for (const s of stickers) {
    state[s[0]][s[1]][s[2]] = s[3] as CubeColorType;
  }
  return state;
}

// 面坐标映射：给定 (face, row, col) 返回对应的 3D 位置 (x, y, z)
export function stickerToPos(face: number, row: number, col: number): [number, number, number] {
  switch (face) {
    case Face.UP:    return [col - 1, 1, row - 1];
    case Face.DOWN:  return [col - 1, -1, 1 - row];
    case Face.FRONT: return [col - 1, 1 - row, 1];
    case Face.BACK:  return [1 - col, 1 - row, -1];
    case Face.RIGHT: return [1, 1 - row, 1 - col];
    case Face.LEFT:  return [-1, 1 - row, col - 1];
    default: return [0, 0, 0];
  }
}

// 3D 位置到面坐标的映射
export function posToStickers(x: number, y: number, z: number): [number, number, number][] {
  const result: [number, number, number][] = [];
  if (x === 1)  result.push([Face.RIGHT, 1 - y, 1 - z]);
  if (x === -1) result.push([Face.LEFT, 1 - y, z + 1]);
  if (y === 1)  result.push([Face.UP, z + 1, x + 1]);
  if (y === -1) result.push([Face.DOWN, 1 - z, x + 1]);
  if (z === 1)  result.push([Face.FRONT, 1 - y, x + 1]);
  if (z === -1) result.push([Face.BACK, 1 - y, 1 - x]);
  return result;
}

// 交换两个位置的块（角块或棱块），包含所有贴纸
// from/to: [x, y, z] 坐标
// orientation: 面的旋转顺序（默认 [0,1,2] 表示直接对应）
export function swapPiece(state: CubeState,
  from: [number, number, number],
  to: [number, number, number],
  orientation: number[] = [0, 1, 2]
): void {
  const fromStickers = posToStickers(...from);
  const toStickers = posToStickers(...to);
  const n = Math.min(fromStickers.length, toStickers.length);
  for (let i = 0; i < n; i++) {
    const j = orientation[i];
    if (j === undefined || j >= toStickers.length) continue;
    const [ff, fr, fc] = fromStickers[i];
    const [tf, tr, tc] = toStickers[j];
    const tmp = state[ff][fr][fc];
    state[ff][fr][fc] = state[tf][tr][tc];
    state[tf][tr][tc] = tmp;
  }
}

// 应用公式序列到当前状态（同 applyAlgorithm 的别名，方便语义理解）
export function applyAlg(state: CubeState, algorithm: string): CubeState {
  return applyAlgorithm(state, algorithm);
}

// 从逆算法生成 setupState（适用于执行后复原的公式）
// 保证: applyAlgorithm(setupFromInverse(alg), alg) === SOLVED_STATE
export function setupFromInverse(alg: string): CubeState {
  const inverted = alg.replace(/[()]/g, ' ').trim().split(/\s+/).filter(m => m.length > 0)
    .reverse().map(m => {
      if (m.endsWith("'")) return m.slice(0, -1);
      if (m.endsWith("2")) return m;
      return m + "'";
    }).join(' ');
  return applyAlgorithm(cloneState(SOLVED_STATE), inverted);
}

// 验证魔方状态合法性（开发期使用）
export function verifyState(state: CubeState): string[] {
  const errs: string[] = [];
  const counts = [0, 0, 0, 0, 0, 0];
  for (const face of state)
    for (const row of face)
      for (const cell of row)
        counts[cell]++;
  if (counts.some(c => c !== 9))
    errs.push(`颜色计数错误: [${counts.join(',')}]`);
  const centerColors = [
    CubeColor.YELLOW, CubeColor.WHITE, CubeColor.RED,
    CubeColor.ORANGE, CubeColor.BLUE, CubeColor.GREEN,
  ];
  for (let f = 0; f < 6; f++)
    if (state[f][1][1] !== centerColors[f])
      errs.push(`面${f}中心色错误: 期望${centerColors[f]}, 实际${state[f][1][1]}`);
  return errs;
}
