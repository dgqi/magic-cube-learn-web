// 魔方颜色定义
export const CubeColor = {
  WHITE: 0,
  YELLOW: 1,
  RED: 2,
  ORANGE: 3,
  BLUE: 4,
  GREEN: 5,
} as const;

export type CubeColorType = typeof CubeColor[keyof typeof CubeColor];

// 魔方六个面
export const Face = {
  UP: 0,      // U - 黄色
  DOWN: 1,    // D - 白色
  FRONT: 2,   // F - 红色
  BACK: 3,    // B - 橙色
  RIGHT: 4,   // R - 蓝色
  LEFT: 5,    // L - 绿色
} as const;

export type FaceType = typeof Face[keyof typeof Face];

// 标准转动
export const Move = {
  U: 'U',
  D: 'D',
  F: 'F',
  B: 'B',
  R: 'R',
  L: 'L',
  u: 'u',
  d: 'd',
  f: 'f',
  b: 'b',
  r: 'r',
  l: 'l',
  M: 'M',
  E: 'E',
  S: 'S',
  x: 'x',
  y: 'y',
  z: 'z',
} as const;

export type MoveType = typeof Move[keyof typeof Move];

export type Modifier = '' | "'" | '2';

export interface MoveAction {
  move: MoveType;
  modifier: Modifier;
}

// 魔方块的位置坐标 (-1, 0, 1)
export interface Position {
  x: number;
  y: number;
  z: number;
}

// 单个色块
export interface Sticker {
  face: FaceType;
  color: CubeColorType;
}

// 单个立方体（角块/棱块/中心块）
export interface Cubie {
  position: Position;
  stickers: Sticker[];
}

// 魔方状态 - 用6个面的颜色矩阵表示
// 每个面是3x3的数组，索引按行优先
export type FaceState = CubeColorType[][];
export type CubeState = FaceState[]; // 6个面

// 教学步骤
export interface Step {
  id: number;
  title: string;
  description: string;
  algorithm: string;
  tips?: string;
  imageUrl?: string;
  // 该步骤执行前的魔方状态（用于教学演示）
  setupState?: CubeState;
  // 归一化后的公式（去除 x/y/z 旋转，用于动画播放）
  animAlg?: string;
}

// 步骤组（包含多个子公式，可展开）
export interface StepGroup {
  id: number;
  title: string;
  description: string;
  tips?: string;
  steps: Step[];
}

// 教学方法
export interface Method {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: Step[];
  // 步骤组（可选，用于支持多公式的大步骤）
  stepGroups?: StepGroup[];
}
