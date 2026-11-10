// Avatars: ONE bold, flat, single-colour character per avatar with a plain white sticker border.
// Shape = seed % AVATAR_SHAPES (so the game can hand each team a different shape). Colour = team colour family,
// members use other shades of the same family. At most: two eyes, a tiny mouth, and one small accent colour.
import { useId, memo } from 'react';
import { AVATAR_SHAPES, TEAM_COLORS } from '../game/content';
import { hash, roundedPoly, starPoints } from './svg';
import { darken, lighten } from './palette';

type Kind = 'b' | 'a' | 'l'; // body colour, accent (darker), light accent
interface Part { d: string; k: Kind; w?: number; tf?: string; clip?: boolean } // w set => stroke-only line of that width
interface Face { x: number; y: number; s: number; ex?: number; mo?: number; bg?: boolean }
interface Shape { name: string; parts: Part[]; face: Face }

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h - r}a${r} ${r} 0 0 1 ${-r} ${r}H${x + r}a${r} ${r} 0 0 1 ${-r} ${-r}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
const b = (d: string, extra: Partial<Part> = {}): Part => ({ d, k: 'b', ...extra });
const a = (d: string, extra: Partial<Part> = {}): Part => ({ d, k: 'a', ...extra });
const l = (d: string, extra: Partial<Part> = {}): Part => ({ d, k: 'l', ...extra });

const star = roundedPoly(starPoints(50, 55, 5, 46, 24), 7);

export const SHAPES: Shape[] = [
  { name: 'rocket', face: { x: 50, y: 44, s: 0.8, ex: 8.5, mo: 9 }, parts: [
    a('M33 52L15 78L34 70Z'), a('M67 52L85 78L66 70Z'), a('M40 72L50 94L60 72Z'),
    b('M50 6C68 20 73 46 69 72H31C27 46 32 20 50 6Z'),
  ] },
  { name: 'star', face: { x: 50, y: 56, s: 0.85, ex: 9 }, parts: [b(star)] },
  { name: 'cactus', face: { x: 50, y: 38, s: 0.9 }, parts: [
    b(rect(12, 30, 16, 36, 8)), b(rect(20, 54, 22, 14, 7)), b(rect(72, 22, 16, 34, 8)), b(rect(58, 44, 22, 14, 7)),
    b(rect(32, 8, 36, 80, 18)), a(rect(26, 76, 48, 18, 6)),
  ] },
  { name: 'cat', face: { x: 50, y: 56, s: 1, ex: 11, mo: 10 }, parts: [
    b('M14 38L16 8L40 24Q50 22 60 24L84 8L86 38C94 54 88 76 66 85Q50 90 34 85C12 76 6 54 14 38Z'),
  ] },
  { name: 'fish', face: { x: 33, y: 48, s: 0.75, ex: 8, mo: 9 }, parts: [
    a('M40 32Q52 8 68 32Z'),
    b('M8 50C22 22 62 18 76 44L94 26V74L76 56C62 82 22 78 8 50Z'),
  ] },
  { name: 'ghost', face: { x: 50, y: 44, s: 1, ex: 10 }, parts: [
    b('M16 90V46C16 22 31 8 50 8C69 8 84 22 84 46V90L72 80L61 90L50 80L39 90L28 80Z'),
  ] },
  { name: 'cloud', face: { x: 50, y: 56, s: 0.95, ex: 10 }, parts: [
    b('M26 80C6 80 4 52 24 50C22 28 50 20 58 38C70 28 88 38 82 54C98 58 94 80 76 80Z'),
  ] },
  { name: 'flame', face: { x: 50, y: 66, s: 0.85, ex: 9 }, parts: [
    b('M50 6C56 26 82 36 82 62C82 82 68 94 50 94C32 94 18 82 18 62C18 48 26 42 30 30C36 42 42 42 46 38C48 28 46 16 50 6Z'),
    l('M50 52C58 62 66 68 66 78C66 87 59 92 50 92C41 92 34 87 34 78C34 68 42 62 50 52Z'),
  ] },
  { name: 'crown', face: { x: 50, y: 48, s: 0.8, ex: 10, mo: 9 }, parts: [
    b('M12 76L7 28L32 48L50 14L68 48L93 28L88 76Q88 86 78 86H22Q12 86 12 76Z'),
    a('M12 68H88L88 76Q88 86 78 86H22Q12 86 12 76Z'),
  ] },
  { name: 'planet', face: { x: 50, y: 42, s: 0.9, ex: 10 }, parts: [
    b(circle(50, 50, 32)),
    a(ellipse(50, 58, 47, 12), { w: 7, tf: 'rotate(-18 50 58)' }),
  ] },
  { name: 'robot', face: { x: 50, y: 54, s: 1, ex: 12, mo: 11 }, parts: [
    a(rect(46, 6, 8, 22, 4)), a(circle(50, 8, 7)), a(rect(6, 44, 14, 22, 6)), a(rect(80, 44, 14, 22, 6)),
    b(rect(16, 26, 68, 62, 18)),
  ] },
  { name: 'icecream', face: { x: 50, y: 36, s: 0.85, ex: 10 }, parts: [
    a('M26 54H74L50 94Z'),
    b('M18 58C10 28 28 8 50 8C72 8 90 28 82 58C78 66 70 64 66 58C62 70 54 66 50 58C46 68 38 68 34 58C30 64 22 66 18 58Z'),
  ] },
  { name: 'frog', face: { x: 50, y: 30, s: 0.9, ex: 21, mo: 36, bg: true }, parts: [
    b(circle(29, 30, 15)), b(circle(71, 30, 15)), b(ellipse(50, 62, 42, 28)),
  ] },
  { name: 'owl', face: { x: 50, y: 42, s: 1, ex: 15, mo: 24, bg: true }, parts: [
    a('M12 56C4 68 10 88 28 86C28 72 24 62 12 56Z'), a('M88 56C96 68 90 88 72 86C72 72 76 62 88 56Z'),
    b('M20 34L18 8L40 22Q50 19 60 22L82 8L80 34C92 56 86 92 50 92C14 92 8 56 20 34Z'),
    l('M44 54H56L50 64Z'),
  ] },
  { name: 'bee', face: { x: 50, y: 50, s: 0.9, ex: 11 }, parts: [
    l(ellipse(17, 36, 17, 9), { tf: 'rotate(-30 17 36)' }), l(ellipse(83, 36, 17, 9), { tf: 'rotate(30 83 36)' }),
    a('M40 30Q36 16 28 14M60 30Q64 16 72 14', { w: 4.5 }),
    b(ellipse(50, 58, 38, 32)),
    a('M0 72H100', { w: 8, clip: true }), a('M0 86H100', { w: 7, clip: true }),
  ] },
  { name: 'whale', face: { x: 36, y: 56, s: 0.85, ex: 9, mo: 9 }, parts: [
    l('M36 30V18M36 18Q30 10 24 12M36 18Q42 10 48 12', { w: 5 }),
    b('M8 62C8 40 28 28 52 30C68 32 76 44 78 54C84 46 86 36 82 26C94 30 96 46 91 60C86 76 74 86 50 86C24 86 8 80 8 62Z'),
  ] },
  { name: 'heart', face: { x: 50, y: 46, s: 0.95, ex: 11 }, parts: [
    b('M50 90C20 68 6 50 10 32C14 14 38 12 50 30C62 12 86 14 90 32C94 50 80 68 50 90Z'),
  ] },
  { name: 'mushroom', face: { x: 50, y: 66, s: 0.85, ex: 9 }, parts: [
    l(rect(30, 46, 40, 46, 14)),
    b('M6 52C6 24 26 8 50 8C74 8 94 24 94 52Q94 58 88 58H12Q6 58 6 52Z'),
    l(circle(30, 34, 7)), l(circle(68, 28, 6)), l(circle(54, 44, 4.5)),
  ] },
  { name: 'bunny', face: { x: 50, y: 66, s: 1, ex: 12, mo: 10 }, parts: [
    b(rect(24, 4, 17, 50, 8.5)), b(rect(59, 4, 17, 50, 8.5)),
    b(ellipse(50, 66, 38, 28)),
  ] },
  { name: 'drop', face: { x: 50, y: 64, s: 1, ex: 11 }, parts: [
    b('M50 6C62 28 82 44 82 64C82 82 68 94 50 94C32 94 18 82 18 64C18 44 38 28 50 6Z'),
  ] },
];

if (SHAPES.length !== AVATAR_SHAPES) console.warn(`avatar: AVATAR_SHAPES (${AVATAR_SHAPES}) != SHAPES (${SHAPES.length})`);

type Mood = 'happy' | 'sad' | 'wow' | 'cool';
const INK = '#3B2A0E';

function FaceArt({ face, mood }: { face: Face; mood: Mood }) {
  const K = 1.3; // faces are drawn big: bold and readable at 40px
  const { x, y } = face;
  const s = face.s * K;
  const ex = (face.ex ?? 10 * face.s) * 1.18;
  const my = y + (face.mo ?? 10 * face.s) * K;
  const eye = (cx: number) => {
    const bg = face.bg ? <circle cx={cx} cy={y} r={8.5 * s} fill="#fff" /> : null;
    if (mood === 'sad') return <g>{bg}<ellipse cx={cx} cy={y + 0.5 * s} rx={3.6 * s} ry={4.2 * s} fill={INK} /><path d={`M${cx - 6 * s} ${y - 6 * s}L${cx + 5 * s} ${y - 9 * s}`} stroke={INK} strokeWidth={2.4 * s} strokeLinecap="round" transform={cx < x ? '' : `scale(-1 1) translate(${-2 * cx} 0)`} /></g>;
    if (mood === 'cool') return <g>{bg}<path d={`M${cx - 4.6 * s} ${y + 1.5 * s}q${4.6 * s} ${-7 * s} ${9.2 * s} 0`} stroke={INK} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" /></g>;
    const r = (mood === 'wow' ? 5 : 3.9) * s;
    return <g>{bg}<ellipse cx={cx} cy={y} rx={r} ry={r * 1.12} fill={INK} /><circle cx={cx + r * 0.35} cy={y - r * 0.4} r={r * 0.36} fill="#fff" /></g>;
  };
  const mouth = mood === 'sad'
    ? <path d={`M${x - 5 * s} ${my + 3 * s}q${5 * s} ${-6 * s} ${10 * s} 0`} stroke={INK} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
    : mood === 'wow'
      ? <ellipse cx={x} cy={my + 1 * s} rx={3.6 * s} ry={4.6 * s} fill={INK} />
      : mood === 'cool'
        ? <path d={`M${x - 5 * s} ${my}q${6 * s} ${5 * s} ${11 * s} ${-2 * s}`} stroke={INK} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
        : <path d={`M${x - 6 * s} ${my - 1 * s}Q${x} ${my + 8 * s} ${x + 6 * s} ${my - 1 * s}Z`} fill={INK} stroke={INK} strokeWidth={1.6 * s} strokeLinejoin="round" />;
  return (
    <g>
      <g className="ui-blink" style={{ ['--dur' as string]: `${3.4 + (s * 7) % 2}s` }}>{eye(x - ex)}{eye(x + ex)}</g>
      {mouth}
    </g>
  );
}

export function avatarParts(seed: number) {
  const n = SHAPES.length;
  const idx = ((Math.floor(seed) % n) + n) % n;
  const h = hash(seed);
  return { obj: SHAPES[idx], shape: idx, tilt: ((h >>> 11) % 7) - 3 };
}
export const avatarName = (seed: number) => avatarParts(seed).obj.name;

function AvatarImpl({ seed, colorIndex, shade = 2, size = 96, mood = 'happy', ring = true }: { seed: number; colorIndex: number; shade?: number; size?: number; mood?: Mood; ring?: boolean }) {
  const clipId = 'av' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const fam = TEAM_COLORS[((colorIndex % TEAM_COLORS.length) + TEAM_COLORS.length) % TEAM_COLORS.length];
  const sh = Math.max(0, Math.min(4, shade));
  const base = fam.shades[sh];
  const col: Record<Kind, string> = { b: base, a: darken(base, 0.14), l: lighten(base, 0.5) };
  const p = avatarParts(seed);
  const h = hash(seed);
  const parts = p.obj.parts;
  const BW = 12; // white border width (6 units each side)
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="-6 -6 112 112" aria-hidden style={{ flex: 'none' }}>
      <defs><clipPath id={clipId}>{parts.filter(q => q.k === 'b').map((q, i) => <path key={i} d={q.d} transform={q.tf} />)}</clipPath></defs>
      <g className="ui-bob" style={{ ['--d' as string]: `${-(h % 2700) / 1000}s`, ['--amp' as string]: '2.5px', ['--dur' as string]: `${2.4 + (h % 7) / 10}s` }}>
        <g transform={`rotate(${p.tilt} 50 52)`}>
          {ring && parts.filter(q => !q.clip).map((q, i) => q.w
            ? <path key={i} d={q.d} transform={q.tf} fill="none" stroke="#fff" strokeWidth={q.w + BW} strokeLinecap="round" strokeLinejoin="round" />
            : <path key={i} d={q.d} transform={q.tf} fill="#fff" stroke="#fff" strokeWidth={BW + 5} strokeLinejoin="round" />)}
          {parts.map((q, i) => {
            const el = q.w
              ? <path d={q.d} transform={q.tf} fill="none" stroke={col[q.k]} strokeWidth={q.w} strokeLinecap="round" />
              : <path d={q.d} transform={q.tf} fill={col[q.k]} stroke={col[q.k]} strokeWidth={5} strokeLinejoin="round" />;
            return q.clip ? <g key={i} clipPath={`url(#${clipId})`}>{el}</g> : <g key={i}>{el}</g>;
          })}
          <FaceArt face={p.obj.face} mood={mood} />
        </g>
      </g>
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
