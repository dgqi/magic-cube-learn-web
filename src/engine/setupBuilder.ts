// Build setup state from algorithm: derive initial demo state automatically.
//
// Core idea:
//   1. Normalize the algorithm (remove whole-cube rotations x/y/z)
//   2. Invert the normalized form → apply to SOLVED_STATE → get setup
//   3. Verify: applyAlgorithm(setup, normalized) === expectedEnd
//
// For "solution" algorithms: expectedEnd = SOLVED_STATE (default)
//   → setup is the state from which the normalized algorithm solves to SOLVED
//
// For "transition" algorithms: expectedEnd = some intermediate state
//   → setup is the state from which the normalized algorithm reaches expectedEnd
//   → caller must provide expectedEnd and document the contract

import { SOLVED_STATE, applyAlgorithm, cloneState, invertAlgorithm } from './cube';
import { normalizeAlgorithm } from './normalize';
import type { CubeState } from '../types/cube';

function deepEqual(a: CubeState, b: CubeState): boolean {
  for (let f = 0; f < 6; f++) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (a[f][r][c] !== b[f][r][c]) return false;
      }
    }
  }
  return true;
}

/**
 * Build a setup state from an algorithm.
 *
 * @param algorithm - The algorithm string (may contain x/y/z rotations)
 * @param expectedEnd - The expected state after applying the normalized algorithm.
 *                      Defaults to SOLVED_STATE for "solution" algorithms.
 * @returns The setup state such that applyAlgorithm(setup, normalized) === expectedEnd
 */
export function buildSetup(algorithm: string, expectedEnd: CubeState = SOLVED_STATE): CubeState {
  const { normalized } = normalizeAlgorithm(algorithm);
  const setup = applyAlgorithm(cloneState(expectedEnd), invertAlgorithm(normalized));
  const check = applyAlgorithm(cloneState(setup), normalized);
  if (!deepEqual(check, expectedEnd)) {
    throw new Error(`buildSetup: setup 不匹配: ${algorithm}`);
  }
  return setup;
}

/**
 * Build setup state and normalized algorithm together.
 * Returns { setupState, animAlg } for use in step definitions.
 */
export function buildStep(algorithm: string, expectedEnd: CubeState = SOLVED_STATE): { setupState: CubeState; animAlg: string } {
  const { normalized } = normalizeAlgorithm(algorithm);
  const setupState = applyAlgorithm(cloneState(expectedEnd), invertAlgorithm(normalized));
  const check = applyAlgorithm(cloneState(setupState), normalized);
  if (!deepEqual(check, expectedEnd)) {
    throw new Error(`buildStep: setup 不匹配: ${algorithm}`);
  }
  return { setupState, animAlg: normalized };
}
