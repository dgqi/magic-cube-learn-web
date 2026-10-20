// Unified move specification — single source of truth for
// applyMove (state engine) and getRotationParams (3D animation).
//
// Convention:
//   Positive axis direction, right-hand rule.
//   CW from +axis viewpoint = negative angle.
//   CW from -axis viewpoint = positive angle.
//
//   R/U/F → -π/2 (CW from positive axis side)
//   L/D/B → +π/2 (CW from negative axis side)
//   M follows L, E follows D, S follows F.

export type Layer = -1 | 0 | 1;

export interface LayerRotation {
  layer: Layer;
  angle: number; // radians
}

export interface MoveSpec {
  axis: 'x' | 'y' | 'z';
  rotations: LayerRotation[];
}

const PI2 = Math.PI / 2;

// Base move specifications (single clockwise turn)
const SPECS: Record<string, MoveSpec> = {
  // === Face turns ===
  U: { axis: 'y', rotations: [{ layer: 1, angle: -PI2 }] },
  D: { axis: 'y', rotations: [{ layer: -1, angle: PI2 }] },
  F: { axis: 'z', rotations: [{ layer: 1, angle: -PI2 }] },
  B: { axis: 'z', rotations: [{ layer: -1, angle: PI2 }] },
  R: { axis: 'x', rotations: [{ layer: 1, angle: -PI2 }] },
  L: { axis: 'x', rotations: [{ layer: -1, angle: PI2 }] },

  // === Slice turns ===
  M: { axis: 'x', rotations: [{ layer: 0, angle: PI2 }] },    // follows L
  E: { axis: 'y', rotations: [{ layer: 0, angle: PI2 }] },    // follows D
  S: { axis: 'z', rotations: [{ layer: 0, angle: -PI2 }] },   // follows F

  // === Double-layer turns ===
  r: { axis: 'x', rotations: [{ layer: 1, angle: -PI2 }, { layer: 0, angle: -PI2 }] },   // R + M'
  l: { axis: 'x', rotations: [{ layer: -1, angle: PI2 }, { layer: 0, angle: PI2 }] },    // L + M
  u: { axis: 'y', rotations: [{ layer: 1, angle: -PI2 }, { layer: 0, angle: -PI2 }] },   // U + E'
  d: { axis: 'y', rotations: [{ layer: -1, angle: PI2 }, { layer: 0, angle: PI2 }] },    // D + E
  f: { axis: 'z', rotations: [{ layer: 1, angle: -PI2 }, { layer: 0, angle: -PI2 }] },   // F + S
  b: { axis: 'z', rotations: [{ layer: -1, angle: PI2 }, { layer: 0, angle: PI2 }] },    // B + S'

  // === Whole-cube rotations ===
  x: {
    axis: 'x',
    rotations: [
      { layer: -1, angle: -PI2 },
      { layer: 0, angle: -PI2 },
      { layer: 1, angle: -PI2 },
    ],
  },
  y: {
    axis: 'y',
    rotations: [
      { layer: -1, angle: -PI2 },
      { layer: 0, angle: -PI2 },
      { layer: 1, angle: -PI2 },
    ],
  },
  z: {
    axis: 'z',
    rotations: [
      { layer: -1, angle: -PI2 },
      { layer: 0, angle: -PI2 },
      { layer: 1, angle: -PI2 },
    ],
  },
};

/**
 * Get the move specification for a single move token (e.g. "R", "U'", "M2").
 * The modifier is folded into the angles so the caller can apply the rotation directly.
 */
export function getMoveSpec(move: string): MoveSpec {
  const base = move[0];
  const modifier = move.length > 1 ? move[1] : '';

  const spec = SPECS[base];
  if (!spec) return { axis: 'x', rotations: [] };

  // Compute effective angle per layer rotation
  let angleMultiplier = 1;
  if (modifier === "'") angleMultiplier = -1;
  else if (modifier === '2') angleMultiplier = 2;

  return {
    axis: spec.axis,
    rotations: spec.rotations.map((r) => ({
      layer: r.layer,
      angle: r.angle * angleMultiplier,
    })),
  };
}

/**
 * Extract animation-friendly parameters from a move token.
 * Returns null for unknown moves.
 */
export function getRotationParams(
  move: string,
): { axis: 'x' | 'y' | 'z'; layers: number[]; angle: number } | null {
  const spec = getMoveSpec(move);
  if (spec.rotations.length === 0) return null;

  // All layers in a single move share the same absolute angle (for standard moves).
  // For double-layer / whole-cube moves, we use the first rotation's angle
  // (all layers have the same magnitude in standard notation).
  const angle = spec.rotations[0].angle;
  const layers = spec.rotations.map((r) => r.layer);

  return { axis: spec.axis, layers, angle };
}
