// Normalize algorithms: remove whole-cube rotations (x/y/z) by tracking
// face permutation and remapping face moves to the original frame.
//
// Uses cubing convention: y = CW perspective rotation from above.
// "y R" means "rotate perspective CW from above, then do R" = physically B.
//
// Tracks which ORIGINAL face is currently at each position, then
// face moves in the rotated frame are translated to original-face moves.

// Face indices matching types/cube.ts: UP=0, DOWN=1, FRONT=2, BACK=3, RIGHT=4, LEFT=5
const U = 0, D = 1, F = 2, B = 3, R = 4, L = 5;
const FACE_NAMES = ['U', 'D', 'F', 'B', 'R', 'L'];

type FacePerm = [number, number, number, number, number, number];
// perm[i] = which original face is currently at position i
// Identity: [U, D, F, B, R, L]

const IDENTITY_PERM: FacePerm = [U, D, F, B, R, L];

// Direction tracking: for each face position, does a CW move in that position
// correspond to the SAME direction as the original face, or FLIPPED?
// true = same direction, false = flipped
type DirFlags = [boolean, boolean, boolean, boolean, boolean, boolean];
const IDENTITY_DIRS: DirFlags = [true, true, true, true, true, true];

// ============================================================
// Rotation permutation tables (cubing convention: CW from face viewpoint)
// ============================================================

// x = CW from right. Cycles: U→F→D→B→U, R and L stay (but R direction flips)
// After x: position U has original F, position F has original D, etc.
// New perm: [F, B, D, U, R, L] (positions: U, D, F, B, R, L)
// Wait, let me think carefully:
// x = CW from right side. Looking from right: U is top, F is front, D is bottom, B is back.
// CW: U→F, F→D, D→B, B→U.
// So after x rotation: what was at U is now at F, what was at F is now at D, etc.
// In terms of "which original face is at position P":
// Position F now has what was at U: perm[F] = original_U
// Position D now has what was at F: perm[D] = original_F
// Position B now has what was at D: perm[B] = original_D
// Position U now has what was at B: perm[U] = original_B
// So new perm (indexed by position): [B, D, U, F, R, L] for [U, D, F, B, R, L]
// Direction: R stays R but its CW direction is now different relative to the cube.
// Since x rotates around x-axis, and R is also around x-axis, the R face's rotation
// direction stays the same (both rotate around x). So dir[R] stays true.
// For the cycling faces (U,F,D,B): the direction flips because the face normal
// changes direction relative to the rotation axis.

function applyX(perm: FacePerm, dirs: DirFlags): [FacePerm, DirFlags] {
  // x = CW from right. Cycles U→F→D→B→U, R/L stay.
  // Direction flips for cycling faces (face normal rotates to opposite axis).
  return [
    [perm[B], perm[F], perm[U], perm[D], perm[R], perm[L]],
    [!dirs[B], !dirs[F], !dirs[U], !dirs[D], dirs[R], dirs[L]],
  ];
}

// y = CW from above. Cycles: F→L→B→R→F, U and D stay.
// After y: position R has what was at F, position B has what was at R, etc.
function applyY(perm: FacePerm, dirs: DirFlags): [FacePerm, DirFlags] {
  return [
    [perm[U], perm[D], perm[R], perm[L], perm[B], perm[F]],
    [dirs[U], dirs[D], dirs[R], dirs[L], dirs[B], dirs[F]],
  ];
}

// z = CW from front. Cycles: U→R→D→L→U, F and B stay.
// After z: position R has what was at U, position D has what was at R, etc.
function applyZ(perm: FacePerm, dirs: DirFlags): [FacePerm, DirFlags] {
  // z = CW from front. Cycles U→R→D→L→U, F/B stay.
  // Direction flips for cycling faces (face normal rotates to opposite axis).
  return [
    [perm[L], perm[R], perm[F], perm[B], perm[U], perm[D]],
    [!dirs[L], !dirs[R], dirs[F], dirs[B], !dirs[U], !dirs[D]],
  ];
}

// Apply a rotation with modifier
function applyRotation(
  axis: 'x' | 'y' | 'z',
  modifier: string,
  perm: FacePerm,
  dirs: DirFlags,
): [FacePerm, DirFlags] {
  const rotFn = axis === 'x' ? applyX : axis === 'y' ? applyY : applyZ;

  if (modifier === "'") {
    // CCW = 3 × CW
    let p = perm, d = dirs;
    [p, d] = rotFn(p, d);
    [p, d] = rotFn(p, d);
    [p, d] = rotFn(p, d);
    return [p, d];
  } else if (modifier === '2') {
    // 180° = 2 × CW
    let p = perm, d = dirs;
    [p, d] = rotFn(p, d);
    [p, d] = rotFn(p, d);
    return [p, d];
  } else {
    // CW = 1 × CW
    return rotFn(perm, dirs);
  }
}

// ============================================================
// Face move remapping
// ============================================================

// Standard face moves: which face they affect and their base direction
// In cubing convention, all standard face moves are CW (no modifier = CW from that face)
const FACE_INFO: Record<string, { face: number; axis: 'x' | 'y' | 'z' }> = {
  U: { face: U, axis: 'y' },
  D: { face: D, axis: 'y' },
  F: { face: F, axis: 'z' },
  B: { face: B, axis: 'z' },
  R: { face: R, axis: 'x' },
  L: { face: L, axis: 'x' },
  M: { face: L, axis: 'x' },  // M follows L direction
  E: { face: D, axis: 'y' },  // E follows D direction
  S: { face: F, axis: 'z' },  // S follows F direction
};

// Double-layer moves: primary face + slice face
const DOUBLE_INFO: Record<string, { primary: string; secondary: string }> = {
  r: { primary: 'R', secondary: 'M' },  // r = R + M'
  l: { primary: 'L', secondary: 'M' },  // l = L + M
  u: { primary: 'U', secondary: 'E' },  // u = U + E'
  d: { primary: 'D', secondary: 'E' },  // d = D + E
  f: { primary: 'F', secondary: 'S' },  // f = F + S
  b: { primary: 'B', secondary: 'S' },  // b = B + S'
};

// For slice moves within double-layer, the modifier is inverted:
// r = R + M' means the M part gets prime modifier
const DOUBLE_SLICE_MODIFIER: Record<string, string> = {
  r: "'", l: '', u: "'", d: '', f: '', b: "'",
};

// Remap a face move through the current permutation
function remapFaceMove(
  move: string,
  modifier: string,
  perm: FacePerm,
  dirs: DirFlags,
): string | null {
  const info = FACE_INFO[move];
  if (!info) return null;

  // Find which original face is currently at this position
  const originalFace = perm[info.face];
  const dirSame = dirs[info.face];

  // The output face name
  const outputFace = FACE_NAMES[originalFace];

  // Determine the output modifier
  // If direction is same: modifier stays the same
  // If direction is flipped: '' ↔ "'"  and '2' stays '2'
  let outputModifier = modifier;
  if (!dirSame && modifier !== '2') {
    outputModifier = modifier === "'" ? '' : "'";
  }

  return outputFace + outputModifier;
}

// ============================================================
// Main normalization function
// ============================================================

export interface NormalizeResult {
  normalized: string;
  netRotation: Mat3;
}

export type Mat3 = [
  number, number, number,
  number, number, number,
  number, number, number,
];

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function mat3Equal(a: Mat3, b: Mat3, eps = 0.01): boolean {
  for (let i = 0; i < 9; i++) {
    if (Math.abs(a[i] - b[i]) > eps) return false;
  }
  return true;
}

// Simple rotation matrix tracking (for netRotation output)
function rotXMat(angle: number): Mat3 {
  const c = Math.round(Math.cos(angle));
  const s = Math.round(Math.sin(angle));
  return [1, 0, 0, 0, c, -s, 0, s, c];
}
function rotYMat(angle: number): Mat3 {
  const c = Math.round(Math.cos(angle));
  const s = Math.round(Math.sin(angle));
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}
function rotZMat(angle: number): Mat3 {
  const c = Math.round(Math.cos(angle));
  const s = Math.round(Math.sin(angle));
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}
function mulMat3(a: Mat3, b: Mat3): Mat3 {
  const r: number[] = new Array(9).fill(0);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        r[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
  return r as Mat3;
}

export function normalizeAlgorithm(algorithm: string): NormalizeResult {
  const tokens = algorithm
    .replace(/[()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((m) => m.length > 0);

  let perm: FacePerm = [...IDENTITY_PERM] as FacePerm;
  let dirs: DirFlags = [...IDENTITY_DIRS] as DirFlags;
  let M: Mat3 = [...IDENTITY];
  const output: string[] = [];

  for (const token of tokens) {
    const base = token[0];
    const modifier = token.length > 1 ? token[1] : '';

    // Whole-cube rotations: update permutation, no output
    if (base === 'x' || base === 'y' || base === 'z') {
      [perm, dirs] = applyRotation(base as 'x' | 'y' | 'z', modifier, perm, dirs);
      // Track net rotation matrix (using cubing convention: CW = negative angle for standard)
      // For netRotation, use: x CW = Rx(-π/2), y CW = Ry(-π/2), z CW = Rz(-π/2)
      const PI2 = Math.PI / 2;
      const baseAngle = -PI2;
      let effectiveAngle = baseAngle;
      if (modifier === "'") effectiveAngle = PI2;
      else if (modifier === '2') effectiveAngle = Math.PI;
      const rotFn = base === 'x' ? rotXMat : base === 'y' ? rotYMat : rotZMat;
      M = mulMat3(M, rotFn(effectiveAngle));
      continue;
    }

    // Double-layer moves: output primary + slice with appropriate modifiers
    if (DOUBLE_INFO[base]) {
      const info = DOUBLE_INFO[base];
      const sliceMod = DOUBLE_SLICE_MODIFIER[base];

      // Primary move
      const primary = remapFaceMove(info.primary, modifier, perm, dirs);
      if (primary) output.push(primary);

      // Secondary (slice) move: modifier is combined (move's own modifier × slice modifier)
      let sliceModifier = modifier;
      if (sliceMod === "'") {
        // Invert the modifier for the slice part
        if (modifier === '') sliceModifier = "'";
        else if (modifier === "'") sliceModifier = '';
        // '2' stays '2'
      }
      const secondary = remapFaceMove(info.secondary, sliceModifier, perm, dirs);
      if (secondary) output.push(secondary);
      continue;
    }

    // Single face/slice moves
    const result = remapFaceMove(base, modifier, perm, dirs);
    if (result) output.push(result);
  }

  return {
    normalized: output.join(' '),
    netRotation: M,
  };
}
