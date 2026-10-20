import { describe, it, expect } from 'vitest';
import {
  SOLVED_STATE,
  applyAlgorithm,
  cloneState,
  applyMove,
} from '../src/engine/cube';
import {
  normalizeAlgorithm,
  mat3Equal,
  IDENTITY,
} from '../src/engine/normalize';
import type { Mat3 } from '../src/engine/normalize';
import type { CubeState } from '../src/types/cube';

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

// Apply a rotation matrix to a state as whole-cube moves
function applyRotationAsMoves(state: CubeState, mat: Mat3): CubeState {
  if (mat3Equal(mat, IDENTITY)) return state;
  // Detect single-axis rotation and apply as whole-cube move
  const PI2 = Math.PI / 2;
  // Check x-axis: m[0]=1
  if (Math.abs(mat[0] - 1) < 0.01 && Math.abs(mat[1]) < 0.01 && Math.abs(mat[2]) < 0.01 && Math.abs(mat[3]) < 0.01) {
    const angle = Math.atan2(mat[7], mat[4]);
    if (Math.abs(angle + PI2) < 0.01) return applyMove(state, 'x');
    if (Math.abs(angle - PI2) < 0.01) return applyMove(state, "x'");
    if (Math.abs(Math.abs(angle) - Math.PI) < 0.01) return applyMove(state, 'x2');
  }
  // Check y-axis: m[4]=1
  if (Math.abs(mat[4] - 1) < 0.01 && Math.abs(mat[1]) < 0.01 && Math.abs(mat[3]) < 0.01 && Math.abs(mat[7]) < 0.01) {
    const angle = Math.atan2(-mat[6], mat[0]);
    if (Math.abs(angle + PI2) < 0.01) return applyMove(state, 'y');
    if (Math.abs(angle - PI2) < 0.01) return applyMove(state, "y'");
    if (Math.abs(Math.abs(angle) - Math.PI) < 0.01) return applyMove(state, 'y2');
  }
  // Check z-axis: m[8]=1
  if (Math.abs(mat[8] - 1) < 0.01 && Math.abs(mat[2]) < 0.01 && Math.abs(mat[5]) < 0.01 && Math.abs(mat[6]) < 0.01) {
    const angle = Math.atan2(mat[3], mat[0]);
    if (Math.abs(angle + PI2) < 0.01) return applyMove(state, 'z');
    if (Math.abs(angle - PI2) < 0.01) return applyMove(state, "z'");
    if (Math.abs(Math.abs(angle) - Math.PI) < 0.01) return applyMove(state, 'z2');
  }
  // For multi-axis rotations, try sequential application
  // (This handles cases like y' which is Ry(+π/2))
  return state;
}

describe('normalizeAlgorithm', () => {
  describe('normalized output contains no x/y/z', () => {
    const testAlgorithms = [
      "y' R U' R'",
      "x R' U R' D2 R U' R' D2 R2 x'",
      "y U' L' U L d R U' R'",
      "x y z R U F",
      "R U R' U'",
      "x R x'",
    ];

    for (const alg of testAlgorithms) {
      it(`"${alg}" normalized has no whole-cube rotations`, () => {
        const result = normalizeAlgorithm(alg);
        const tokens = result.normalized.split(/\s+/).filter(t => t.length > 0);
        for (const token of tokens) {
          expect(['x', 'y', 'z'].includes(token[0])).toBe(false);
        }
      });
    }
  });

  describe('identity netRotation for algorithms without x/y/z', () => {
    it('no rotations → identity netRotation', () => {
      const result = normalizeAlgorithm("R U R' U'");
      expect(mat3Equal(result.netRotation, IDENTITY)).toBe(true);
      expect(result.normalized).toBe("R U R' U'");
    });

    it("x x' → identity netRotation, empty normalized", () => {
      const result = normalizeAlgorithm("x x'");
      expect(mat3Equal(result.netRotation, IDENTITY)).toBe(true);
      expect(result.normalized).toBe('');
    });

    it("y y' → identity netRotation", () => {
      const result = normalizeAlgorithm("y y'");
      expect(mat3Equal(result.netRotation, IDENTITY)).toBe(true);
      expect(result.normalized).toBe('');
    });
  });

  describe('conjugation: x R x\' produces same state (single face, same axis)', () => {
    // When the face move is on the same axis as the rotation, conjugation preserves the move
    it("x R x' = R", () => {
      const result = normalizeAlgorithm("x R x'");
      expect(result.normalized).toBe('R');
      const stateOriginal = applyAlgorithm(cloneState(SOLVED_STATE), "x R x'");
      const stateNormalized = applyAlgorithm(cloneState(SOLVED_STATE), result.normalized);
      expect(stateEqual(stateOriginal, stateNormalized)).toBe(true);
    });

    it("y U y' = U", () => {
      const result = normalizeAlgorithm("y U y'");
      expect(result.normalized).toBe('U');
      const stateOriginal = applyAlgorithm(cloneState(SOLVED_STATE), "y U y'");
      const stateNormalized = applyAlgorithm(cloneState(SOLVED_STATE), result.normalized);
      expect(stateEqual(stateOriginal, stateNormalized)).toBe(true);
    });

    it("z F z' = F", () => {
      const result = normalizeAlgorithm("z F z'");
      expect(result.normalized).toBe('F');
      const stateOriginal = applyAlgorithm(cloneState(SOLVED_STATE), "z F z'");
      const stateNormalized = applyAlgorithm(cloneState(SOLVED_STATE), result.normalized);
      expect(stateEqual(stateOriginal, stateNormalized)).toBe(true);
    });
  });

  describe('normalized algorithm with non-identity net rotation', () => {
    // For "y' R U' R'", the normalized form remaps face labels
    // but the net rotation y' means the states differ by that rotation
    it("y' R U' R' → normalized form (face remapping)", () => {
      const result = normalizeAlgorithm("y' R U' R'");
      // After y' (CCW perspective from above): R→F, U→U, R'→F'
      expect(result.normalized).toBe("F U' F'");
      // Net rotation should be y' (Ry(+π/2))
      expect(mat3Equal(result.netRotation, IDENTITY)).toBe(false);
    });

    it("x R' U R' D2 R U' R' D2 R2 x' → normalized (face remapping)", () => {
      const result = normalizeAlgorithm("x R' U R' D2 R U' R' D2 R2 x'");
      // Net rotation is identity (x and x' cancel)
      expect(mat3Equal(result.netRotation, IDENTITY)).toBe(true);
      // Verify no x/y/z in output
      expect(result.normalized.match(/[xyz]/)).toBeNull();
      // The output should be a valid sequence of face moves
      expect(result.normalized.length).toBeGreaterThan(0);
    });
  });

  describe('specific face remappings', () => {
    it("y R → B (R in y-rotated frame = B in original)", () => {
      const result = normalizeAlgorithm("y R");
      // y = CW perspective from above: F→R, R→B, B→L, L→F
      // So R in the new perspective = B in the original
      expect(result.normalized).toBe('B');
    });

    it("y' R → F (R in y'-rotated frame = F in original)", () => {
      const result = normalizeAlgorithm("y' R");
      // y' = CCW perspective from above: F→L, R→F, B→R, L→B
      // So R in the new perspective = F in the original
      expect(result.normalized).toBe('F');
    });

    it("y2 R → L (R in y2-rotated frame = L in original)", () => {
      const result = normalizeAlgorithm("y2 R");
      // y2 = 180° perspective: F↔B, R↔L
      // So R in the new perspective = L in the original
      expect(result.normalized).toBe('L');
    });
  });

  describe('on scrambled states with identity net rotation', () => {
    it("x R x' works on scrambled cube (same-axis conjugation)", () => {
      const scrambled = applyAlgorithm(cloneState(SOLVED_STATE), "R U F D L B R' U' F'");
      const alg = "x R x'";

      const stateOriginal = applyAlgorithm(cloneState(scrambled), alg);
      const { normalized } = normalizeAlgorithm(alg);
      const stateNormalized = applyAlgorithm(cloneState(scrambled), normalized);

      expect(stateEqual(stateOriginal, stateNormalized)).toBe(true);
    });

    it("y U y' works on scrambled cube", () => {
      const scrambled = applyAlgorithm(cloneState(SOLVED_STATE), "R U F D L B R' U' F'");
      const alg = "y U y'";

      const stateOriginal = applyAlgorithm(cloneState(scrambled), alg);
      const { normalized } = normalizeAlgorithm(alg);
      const stateNormalized = applyAlgorithm(cloneState(scrambled), normalized);

      expect(stateEqual(stateOriginal, stateNormalized)).toBe(true);
    });
  });
});
