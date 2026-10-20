import { describe, it, expect } from 'vitest';
import { cfopMethod } from '../src/methods/cfop';
import { layerByLayerMethod } from '../src/methods/layerByLayer';
import { rouxMethod } from '../src/methods/roux';
import {
  SOLVED_STATE,
  applyAlgorithm,
  cloneState,
  verifyState,
} from '../src/engine/cube';
import { CubeColor, Face } from '../src/types/cube';
import type { Method, CubeState, Step } from '../src/types/cube';
import * as fs from 'fs';
import * as path from 'path';

// Deep compare two states
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

// Simple hash of state for snapshot diffing
function hashState(state: CubeState): string {
  const flat: number[] = [];
  for (const face of state)
    for (const row of face)
      for (const cell of row)
        flat.push(cell);
  // Convert to a compact string and hash
  const str = flat.join('');
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// Serialize state to compact number arrays
function serializeState(state: CubeState): number[][][] {
  return state.map(face => face.map(row => [...row]));
}

const ALL_METHODS: Method[] = [layerByLayerMethod, cfopMethod, rouxMethod];

describe('All methods step validation', () => {
  for (const method of ALL_METHODS) {
    describe(`${method.name} (${method.id})`, () => {
      const groups = method.stepGroups ?? [];

      for (const group of groups) {
        describe(`Group ${group.id}: ${group.title}`, () => {
          for (const step of group.steps) {
            const label = `Step ${step.id}: ${step.title}`;

            it(`${label} — verifyState passes`, () => {
              expect(step.setupState).toBeDefined();
              const errs = verifyState(step.setupState!);
              expect(errs).toEqual([]);
            });

            it(`${label} — centers preserved (D=WHITE, U=YELLOW)`, () => {
              expect(step.setupState).toBeDefined();
              expect(step.setupState![Face.DOWN][1][1]).toBe(CubeColor.WHITE);
              expect(step.setupState![Face.UP][1][1]).toBe(CubeColor.YELLOW);
            });

            it(`${label} — animAlg solves setupState to SOLVED`, () => {
              expect(step.setupState).toBeDefined();
              expect(step.animAlg).toBeDefined();
              const result = applyAlgorithm(
                cloneState(step.setupState!),
                step.animAlg!,
              );
              if (!stateEqual(result, SOLVED_STATE)) {
                // Print diff for debugging
                for (let f = 0; f < 6; f++) {
                  for (let r = 0; r < 3; r++) {
                    const got = result[f][r].join(',');
                    const exp = SOLVED_STATE[f][r].join(',');
                    if (got !== exp) {
                      console.log(
                        `  Face ${f} Row ${r}: got [${got}] expected [${exp}]`,
                      );
                    }
                  }
                }
              }
              expect(stateEqual(result, SOLVED_STATE)).toBe(true);
            });
          }
        });
      }
    });
  }
});

// Snapshot generation: compare against committed snapshot, regenerate on mismatch
// To update snapshot after intentional changes: delete setups.json and re-run tests
describe('Snapshot validation', () => {
  const snapshotDir = path.resolve(__dirname, '__snapshots__');
  const snapshotPath = path.join(snapshotDir, 'setups.json');

  // Build current snapshot
  function buildCurrentSnapshot() {
    const snapshot: Record<string, {
      method: string;
      group: string;
      step: string;
      algorithm: string;
      animAlg: string;
      hash: string;
      setupState: number[][][];
    }> = {};

    for (const method of ALL_METHODS) {
      const groups = method.stepGroups ?? [];
      for (const group of groups) {
        for (const step of group.steps) {
          const key = `${method.id}__g${group.id}__s${step.id}`;
          snapshot[key] = {
            method: method.id,
            group: group.title,
            step: step.title,
            algorithm: step.algorithm,
            animAlg: step.animAlg ?? '',
            hash: hashState(step.setupState ?? SOLVED_STATE),
            setupState: serializeState(step.setupState ?? SOLVED_STATE),
          };
        }
      }
    }
    return snapshot;
  }

  it('setup states match committed snapshot (delete setups.json to regenerate)', () => {
    const current = buildCurrentSnapshot();

    if (!fs.existsSync(snapshotPath)) {
      // First run: generate snapshot
      if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
      }
      fs.writeFileSync(snapshotPath, JSON.stringify(current, null, 2));
      console.log(`Snapshot generated: ${Object.keys(current).length} steps`);
      return;
    }

    // Compare against committed snapshot
    const committed = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    const committedKeys = Object.keys(committed);
    const currentKeys = Object.keys(current);

    // Check for added/removed steps
    const added = currentKeys.filter(k => !committedKeys.includes(k));
    const removed = committedKeys.filter(k => !currentKeys.includes(k));

    // Check for hash mismatches
    const changed: string[] = [];
    for (const key of currentKeys) {
      if (committed[key] && current[key].hash !== committed[key].hash) {
        changed.push(key);
      }
    }

    if (added.length || removed.length || changed.length) {
      const msg = [
        `Snapshot mismatch! (delete ${snapshotPath} to regenerate)`,
        added.length ? `  Added: ${added.join(', ')}` : '',
        removed.length ? `  Removed: ${removed.join(', ')}` : '',
        changed.length ? `  Changed: ${changed.join(', ')}` : '',
      ].filter(Boolean).join('\n');
      throw new Error(msg);
    }

    expect(currentKeys.length).toBe(committedKeys.length);
  });
});
