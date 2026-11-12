import type { CSSProperties } from 'react';
import { darken, T } from './palette';
import { Shaded, Sticker, circ, path, roundedPoly, starPoints } from './svg';

// ---------------------------------------------------------------------------
// OptionShape: circle / square / triangle / star as a HOLLOW outline icon with a sandwich border:
// white outer ring, the themed colour ring in the middle, white inner ring, and an empty (transparent) inside.
// ---------------------------------------------------------------------------
export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star';
const SHAPES: Record<ShapeKind, string> = {
  circle: 'M50 8a42 42 0 1 1 0 84a42 42 0 1 1 0-84Z',
  square: 'M28 10H72Q90 10 90 28V72Q90 90 72 90H28Q10 90 10 72V28Q10 10 28 10Z',
  triangle: roundedPoly([[50, 8], [94, 88], [6, 88]], 15),
  star: roundedPoly(starPoints(50, 52, 5, 48, 23), 7),
};
const SHAPE_K = 0.78;           // the outline path is shrunk so the OUTER white ring ends where the old filled shape ended
const RING = { white: 21, colour: 11 };   // total ring thickness and the colour band, in icon units (the 2 white bands are (21 - 11) / 2 each)

export function OptionShape({ shape, color, size = 64, style }: { shape: ShapeKind; color: string; size?: number; edge?: string; style?: CSSProperties }) {
  const d = SHAPES[shape];
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="-4 -4 108 108" style={{ flex: 'none', ...style }} aria-hidden>
      <g transform={`translate(50 50) scale(${SHAPE_K}) translate(-50 -50)`} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={d} stroke="#fff" strokeWidth={RING.white / SHAPE_K} />
        <path d={d} stroke={color} strokeWidth={RING.colour / SHAPE_K} />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MeterIcon: our own icons for customers (group of people), happiness (smiley), coins (coin stack).
// ---------------------------------------------------------------------------
export type MeterKind = 'customers' | 'happiness' | 'coins';

function Person({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  const sh = darken(c, 0.12);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Shaded shape={path('M-24 40Q-24 6 0 6Q24 6 24 40Q24 46 18 46H-18Q-24 46-24 40Z')} fill={c} shade={sh} off={[3, 4]}>
        <ellipse cx={-11} cy={20} rx={5} ry={8} fill="#fff" opacity={0.45} />
      </Shaded>
      <Shaded shape={circ(0, -12, 16)} fill={c} shade={sh} off={[3, 3]}>
        <ellipse cx={-6} cy={-19} rx={5} ry={3.5} fill="#fff" opacity={0.75} transform="rotate(-30 -6 -19)" />
      </Shaded>
    </g>
  );
}

export function MeterIcon({ kind, size = 48, style }: { kind: MeterKind; size?: number; style?: CSSProperties }) {
  const bw = size < 60 ? 8 : 6;
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="-4 -4 108 108" style={{ display: 'inline-block', verticalAlign: 'middle', flex: 'none', ...style }} aria-hidden>
      <Sticker w={bw}>
        {kind === 'customers' && (
          <g>
            <Person x={24} y={44} s={0.82} c="#7CD3FA" />
            <Person x={76} y={44} s={0.82} c="#7CD3FA" />
            <Person x={50} y={50} s={1.02} c={T.blue} />
          </g>
        )}
        {kind === 'happiness' && (
          <g>
            <circle cx={50} cy={56} r={42} fill={T.sunEdge} />
            <Shaded shape={circ(50, 50, 42)} fill={T.sun} shade="#F5B400" off={[4, 5]}>
              <ellipse cx={30} cy={27} rx={11} ry={6} fill="#fff" opacity={0.7} transform="rotate(-35 30 27)" />
            </Shaded>
            <g className="in">
              <ellipse cx={36} cy={42} rx={6} ry={8.5} fill={T.ink} />
              <ellipse cx={64} cy={42} rx={6} ry={8.5} fill={T.ink} />
              <circle cx={34} cy={39} r={2.2} fill="#fff" />
              <circle cx={62} cy={39} r={2.2} fill="#fff" />
              <ellipse cx={25} cy={58} rx={7} ry={4.5} fill="#FF8A7A" opacity={0.8} />
              <ellipse cx={75} cy={58} rx={7} ry={4.5} fill="#FF8A7A" opacity={0.8} />
              <path d="M30 58Q50 84 70 58Q50 66 30 58Z" fill={T.ink} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d="M40 66Q50 74 60 66Q50 69 40 66Z" fill="#FF6F6F" />
            </g>
          </g>
        )}
        {kind === 'coins' && <CoinStack />}
      </Sticker>
    </svg>
  );
}

function CoinDisc({ y }: { y: number }) {
  return (
    <g>
      <path d={`M10 ${y}v10a40 15 0 0 0 80 0v-10Z`} fill={T.coinEdge} />
      <ellipse cx={50} cy={y + 10} rx={40} ry={15} fill={T.coinEdge} />
      <ellipse cx={50} cy={y} rx={40} ry={15} fill={T.coin} />
    </g>
  );
}
function CoinStack() {
  return (
    <g>
      <CoinDisc y={78} />
      <CoinDisc y={64} />
      {/* front coin standing up */}
      <circle cx={56} cy={44} r={34} fill={T.coinEdge} />
      <Shaded shape={circ(52, 40, 34)} fill={T.coin} shade="#F0A400" off={[3, 4]}>
        <ellipse cx={36} cy={22} rx={9} ry={5} fill="#fff" opacity={0.75} transform="rotate(-35 36 22)" />
      </Shaded>
      <g className="in">
        <circle cx={52} cy={40} r={23} fill="none" stroke={T.coinEdge} strokeWidth={5} />
        {/* rupee mark, chunky */}
        <path d="M42 29H63M42 37H63M45 29Q60 29 60 37Q60 45 46 45L60 55" fill="none" stroke={T.coinEdge} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Recipe step icons (used by RecipeBar): magnifier, toolbox, megaphone, money bag, rocket, trophy.
// ---------------------------------------------------------------------------
export function RecipeIcon({ act, size = 56 }: { act: number; size?: number }) {
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ flex: 'none' }}>
      {act === 1 && <Magnifier />}
      {act === 2 && <Hammer />}
      {act === 3 && <Megaphone />}
      {act === 4 && <MoneyBag />}
      {act === 5 && <Rocket />}
      {act === 6 && <Trophy />}
    </svg>
  );
}
const Magnifier = () => (
  <g>
    <path d="M60 60L84 84" stroke="#8A5A1C" strokeWidth={16} strokeLinecap="round" />
    <path d="M62 62L82 82" stroke="#B37A2E" strokeWidth={9} strokeLinecap="round" />
    <circle cx={42} cy={42} r={30} fill="#5B6B7A" />
    <circle cx={42} cy={42} r={21} fill="#BEEBFF" />
    <path d="M28 36Q32 26 42 24" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" />
  </g>
);
const Hammer = () => (
  <g transform="rotate(-35 50 50)">
    <rect x={44} y={34} width={12} height={58} rx={6} fill="#B37A2E" />
    <rect x={44} y={34} width={5} height={58} rx={2.5} fill="#D49A4A" />
    <rect x={20} y={14} width={60} height={26} rx={9} fill="#5B6B7A" />
    <rect x={20} y={14} width={60} height={12} rx={6} fill="#8496A8" />
  </g>
);
const Megaphone = () => (
  <g>
    <path d="M18 40H34L72 18V82L34 60H18Q12 60 12 54V46Q12 40 18 40Z" fill="#FF4B4B" stroke="#FF4B4B" strokeWidth={6} strokeLinejoin="round" />
    <path d="M34 44L72 24V40L34 50Z" fill="#FF8A8A" />
    <rect x={64} y={14} width={14} height={72} rx={7} fill="#D93636" />
    <path d="M30 60L36 82Q37 86 41 86H46Q50 86 49 82L44 62" fill="#D93636" />
    <path d="M84 36Q92 50 84 64" stroke="#FF9600" strokeWidth={7} strokeLinecap="round" fill="none" />
  </g>
);
const MoneyBag = () => (
  <g>
    <path d="M30 34Q14 52 16 70Q18 90 50 90Q82 90 84 70Q86 52 70 34Z" fill="#46A302" />
    <path d="M34 34Q20 52 22 68Q24 82 46 84Q30 70 34 34Z" fill="#89DD45" />
    <path d="M36 30L30 14Q42 20 50 12Q58 20 70 14L64 30Z" fill="#58CC02" stroke="#58CC02" strokeWidth={5} strokeLinejoin="round" />
    <rect x={32} y={28} width={36} height={9} rx={4.5} fill="#E0A100" />
    <text x={50} y={78} textAnchor="middle" fontSize={34} fontWeight={800} fill="#FFE277" fontFamily="Baloo 2, sans-serif">₹</text>
  </g>
);
const Rocket = () => (
  <g transform="rotate(35 50 50)">
    <path d="M38 74Q50 98 62 74Z" fill="#FF9600" />
    <path d="M43 74Q50 90 57 74Z" fill="#FFC800" />
    <path d="M36 58L22 76L38 72Z M64 58L78 76L62 72Z" fill="#D93636" stroke="#D93636" strokeWidth={4} strokeLinejoin="round" />
    <path d="M50 6Q70 24 68 62Q68 74 60 76H40Q32 74 32 62Q30 24 50 6Z" fill="#F4F1EA" />
    <path d="M50 6Q38 22 38 60Q38 72 44 76H40Q32 74 32 62Q30 24 50 6Z" fill="#fff" />
    <path d="M50 6Q60 15 64 26H36Q40 15 50 6Z" fill="#FF4B4B" />
    <circle cx={50} cy={44} r={10} fill="#1395D4" />
    <circle cx={50} cy={44} r={6.5} fill="#7CD3FA" />
  </g>
);
const Trophy = () => (
  <g>
    <path d="M26 24Q8 24 12 40Q16 54 32 54" stroke="#E0A100" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M74 24Q92 24 88 40Q84 54 68 54" stroke="#E0A100" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M24 14H76V36Q76 64 50 66Q24 64 24 36Z" fill="#FFC800" />
    <path d="M30 16H44V36Q44 56 54 64Q30 62 30 36Z" fill="#FFE277" />
    <rect x={44} y={62} width={12} height={14} fill="#E0A100" />
    <rect x={30} y={74} width={40} height={16} rx={6} fill="#B37A2E" />
    <rect x={30} y={74} width={40} height={6} rx={3} fill="#D49A4A" />
    <path d="M50 26L54 34L62 35L56 40L58 48L50 44L42 48L44 40L38 35L46 34Z" fill="#fff" opacity={0.85} />
  </g>
);

// A tiny check badge (green circle with a white tick), used by RecipeBar and handy elsewhere.
export function CheckBadge({ size = 34 }: { size?: number }) {
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="-6 -6 112 112" aria-hidden>
      <Sticker w={8}>
        <circle cx={50} cy={56} r={44} fill={T.goodEdge} />
        <circle cx={50} cy={50} r={44} fill={T.good} />
        <path className="in" d="M28 52L44 67L73 36" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </Sticker>
    </svg>
  );
}

