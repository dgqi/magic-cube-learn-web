import { describe, it, expect } from 'vitest';
import {
  SOLVED_STATE,
  applyMove,
  applyAlgorithm,
  scramble,
  cloneState,
} from '../src/engine/cube';
import type { CubeState } from '../src/types/cube';

// 所有 move（含修饰符的完整列表）
const ALL_MOVES_WITH_MODIFIERS: string[] = [];
const baseMoves = ['U', 'D', 'F', 'B', 'R', 'L', 'M', 'E', 'S', 'r', 'd', 'f', 'l', 'u', 'b', 'x', 'y', 'z'];
const modifiers = ['', "'", '2'];
for (const m of baseMoves) {
  for (const mod of modifiers) {
    ALL_MOVES_WITH_MODIFIERS.push(m + mod);
  }
}

// 所有单次转动 move（用于四转测试）
const ALL_SINGLE_MOVES = baseMoves;

// 反转单个 move
function invert(m: string): string {
  const base = m[0];
  const mod = m.length > 1 ? m[1] : '';
  if (mod === '2') return m;
  if (mod === "'") return base;
  return base + "'";
}

// 深度比较两个 CubeState
function stateEqual(a: CubeState, b: CubeState): boolean {
  for (let f = 0; f < 6; f++) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (a[f][r][c] !== b[f][r][c]) return false;
      }
    }
  }
  return true;
}

// 生成 3 个随机打乱状态
function generateScrambledStates(count: number): CubeState[] {
  const states: CubeState[] = [];
  for (let i = 0; i < count; i++) {
    const alg = scramble(SOLVED_STATE, 30);
    states.push(applyAlgorithm(cloneState(SOLVED_STATE), alg));
  }
  return states;
}

describe('Move 语义一致性测试', () => {
  const testStates: { name: string; state: CubeState }[] = [
    { name: 'SOLVED', state: SOLVED_STATE },
    ...generateScrambledStates(3).map((s, i) => ({ name: `SCRAMBLE_${i + 1}`, state: s })),
  ];

  describe('自逆测试：applyMove(applyMove(S, m), invert(m)) === S', () => {
    for (const m of ALL_MOVES_WITH_MODIFIERS) {
      for (const ts of testStates) {
        it(`${m} 对 ${ts.name} 自逆`, () => {
          const after = applyMove(applyMove(ts.state, m), invert(m));
          expect(stateEqual(after, ts.state)).toBe(true);
        });
      }
    }
  });

  describe('四转测试：applyMove x4 === S', () => {
    for (const m of ALL_SINGLE_MOVES) {
      for (const ts of testStates) {
        it(`${m} 四次转动还原 ${ts.name}`, () => {
          let s = ts.state;
          s = applyMove(s, m);
          s = applyMove(s, m);
          s = applyMove(s, m);
          s = applyMove(s, m);
          expect(stateEqual(s, ts.state)).toBe(true);
        });
      }
    }
  });

  describe('复合测试：slice + face = rotation', () => {
    for (const ts of testStates) {
      it(`R M' L' === x 对 ${ts.name}`, () => {
        const a = applyAlgorithm(cloneState(ts.state), "R M' L'");
        const b = applyMove(ts.state, 'x');
        expect(stateEqual(a, b)).toBe(true);
      });

      it(`U E' D' === y 对 ${ts.name}`, () => {
        const a = applyAlgorithm(cloneState(ts.state), "U E' D'");
        const b = applyMove(ts.state, 'y');
        expect(stateEqual(a, b)).toBe(true);
      });

      it(`F S B' === z 对 ${ts.name}`, () => {
        const a = applyAlgorithm(cloneState(ts.state), "F S B'");
        const b = applyMove(ts.state, 'z');
        expect(stateEqual(a, b)).toBe(true);
      });
    }
  });

  describe('双层测试：double-layer moves', () => {
    for (const ts of testStates) {
      it(`r === R M' 对 ${ts.name}`, () => {
        const a = applyMove(ts.state, 'r');
        const b = applyAlgorithm(cloneState(ts.state), "R M'");
        expect(stateEqual(a, b)).toBe(true);
      });

      it(`u === U E' 对 ${ts.name}`, () => {
        const a = applyMove(ts.state, 'u');
        const b = applyAlgorithm(cloneState(ts.state), "U E'");
        expect(stateEqual(a, b)).toBe(true);
      });

      it(`d === D E 对 ${ts.name}`, () => {
        const a = applyMove(ts.state, 'd');
        const b = applyAlgorithm(cloneState(ts.state), "D E");
        expect(stateEqual(a, b)).toBe(true);
      });

      it(`b === B S' 对 ${ts.name}`, () => {
        const a = applyMove(ts.state, 'b');
        const b = applyAlgorithm(cloneState(ts.state), "B S'");
        expect(stateEqual(a, b)).toBe(true);
      });
    }
  });

  describe('标准符号测试：具体色块位置验证', () => {
    // SOLVED 状态下面色: U=黄(1), D=白(0), F=红(2), B=橙(3), R=蓝(4), L=绿(5)
    // 棱块位置用 (face, row, col) 标识

    it('moveU 后 UF 棱应到 UL 位置（从上看顺时针）', () => {
      // UF 棱 = FRONT[0][1] (红色)
      // UL 位置 = LEFT[0][1]
      // U 顺时针从上看：FRONT→LEFT
      const s = applyMove(cloneState(SOLVED_STATE), 'U');
      // FRONT 顶行中间（UF 棱的 F 面贴纸）应该到了 LEFT 面
      // 即 LEFT[0][1] 应该现在是红色(2)
      expect(s[5][0][1]).toBe(2); // LEFT face, row0, col1 = RED
    });

    it('moveD 后 DF 棱应到 DR 位置（从下看顺时针）', () => {
      // DF 棱 = FRONT[2][1] (红色)
      // D 顺时针从下看：FRONT→RIGHT
      // 但标准 D 从下看顺时针：F→R→B→L
      // 所以 DF 棱应到 DR = RIGHT[2][1]
      const s = applyMove(cloneState(SOLVED_STATE), 'D');
      expect(s[4][2][1]).toBe(2); // RIGHT face, row2, col1 = RED
    });

    it('moveL 后 UF 棱应不动，UL 棱应到 FL', () => {
      const s = applyMove(cloneState(SOLVED_STATE), 'L');
      // UF 棱 = FRONT[0][1]，L 转动不影响 x=0 且不在 L 层的棱
      // 但 UF 是 (x=0, y=1, z=1)，L 层是 x=-1，所以 UF 不动
      expect(s[2][0][1]).toBe(2); // FRONT[0][1] still RED

      // UL 棱 = (x=-1, y=1, z=0)，在 L 层
      // L 顺时针从左看：UP→FRONT→DOWN→BACK
      // UL 棱在 UP 层，应转到 FRONT
      // FL 位置 = FRONT 左列中间 = FRONT[1][0]
      // 但 UL 棱是 (x=-1, y=1, z=0)，L 转后到 (x=-1, y=0, z=1) = FL 位置
      // FL 棱的 F 面贴纸 = FRONT[1][0]
      // UL 的 UP 面贴纸(黄色)转到 FRONT 面
      expect(s[2][1][0]).toBe(1); // FRONT[1][0] = YELLOW
    });
  });
});
