// Our own flat, layered SVG art for the screen views (no image files). Light from the top-left,
// darker lips bottom-right, white sticker borders, round caps and joins.
import { useId, type CSSProperties } from 'react';

const INK = 'var(--ink)';

/** Techistan skyline, two flat layers. */
export function Skyline({ width = 1920, height = 340, style }: { width?: number; height?: number; style?: CSSProperties }) {
  const gid = 'sk' + useId().replace(/:/g, '');
  const back = [
    [40, 150, 120], [180, 210, 100], [300, 120, 140], [470, 240, 110], [600, 170, 130], [760, 260, 120], [900, 140, 150],
    [1080, 230, 110], [1210, 180, 140], [1380, 250, 120], [1520, 150, 130], [1680, 220, 120], [1820, 160, 110],
  ];
  const front = [
    { x: 0, w: 170, h: 120, c: '#FFB44D', e: '#E07F00', roof: 'flat' }, { x: 190, w: 140, h: 190, c: '#5CC8F9', e: '#1395D4', roof: 'dome' },
    { x: 350, w: 120, h: 140, c: '#FF97C9', e: '#E5539A', roof: 'flat' }, { x: 500, w: 160, h: 230, c: '#89DD45', e: '#46A302', roof: 'antenna' },
    { x: 690, w: 130, h: 160, c: '#DCA6FF', e: '#B05EE8', roof: 'dome' }, { x: 850, w: 200, h: 120, c: '#FF7A7A', e: '#E03535', roof: 'flat' },
    { x: 1080, w: 140, h: 250, c: '#FFC800', e: '#E0A100', roof: 'antenna' }, { x: 1250, w: 150, h: 150, c: '#5CC8F9', e: '#1395D4', roof: 'flat' },
    { x: 1430, w: 130, h: 200, c: '#FFB44D', e: '#E07F00', roof: 'dome' }, { x: 1590, w: 170, h: 130, c: '#89DD45', e: '#46A302', roof: 'flat' },
    { x: 1780, w: 140, h: 180, c: '#FF97C9', e: '#E5539A', roof: 'antenna' },
  ];
  return (
    <svg width={width + 800} height={height} viewBox={`-400 0 2720 ${height}`} style={{ ...style, marginLeft: -400 }} preserveAspectRatio="xMidYMax meet">
      <defs><g id={gid}>
      {back.map(([x, h, w], i) => <rect key={i} x={x} y={height - h} width={w} height={h + 20} rx={24} fill="#FFE07A" />)}
      {front.map((b, i) => {
        const y = height - b.h;
        return (
          <g key={i}>
            {b.roof === 'dome' && <circle cx={b.x + b.w / 2} cy={y + 4} r={b.w * 0.32} fill={b.e} />}
            {b.roof === 'antenna' && <><rect x={b.x + b.w / 2 - 5} y={y - 50} width={10} height={54} rx={5} fill={b.e} /><circle cx={b.x + b.w / 2} cy={y - 54} r={12} fill="var(--bad)" className="scr-blink" /></>}
            <rect x={b.x} y={y} width={b.w} height={b.h + 30} rx={22} fill={b.e} />
            <rect x={b.x} y={y} width={b.w - 12} height={b.h + 30} rx={22} fill={b.c} />
            <rect x={b.x + 16} y={y + 14} width={b.w * 0.35} height={12} rx={6} fill="#fff" opacity={0.45} />
            {Array.from({ length: Math.floor((b.h - 40) / 46) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor((b.w - 30) / 44)) }).map((__, c) => (
                <rect key={`${r}-${c}`} x={b.x + 18 + c * 44} y={y + 40 + r * 46} width={24} height={26} rx={7} fill="#FFF8DC" opacity={(r + c + i) % 3 === 0 ? 1 : 0.75} />
              )))}
          </g>
        );
      })}
      </g></defs>
      {/* the skyline tile repeats left and right so it bleeds across wider stages */}
      <use href={`#${gid}`} x={-1920} /><use href={`#${gid}`} x={1920} /><use href={`#${gid}`} />
      <rect x={-400} y={height - 26} width={2720} height={26} fill="#F2D45C" />
    </svg>
  );
}

/** Egg that hatches. `phase`: 0 whole, 1 wobbling, 2 cracked (halves fly away). */
export function Egg({ color, dark, size = 150, phase }: { color: string; dark: string; size?: number; phase: 0 | 1 | 2 }) {
  const top = 'M15 92 C15 40 42 6 75 6 C108 6 135 40 135 92 L118 80 L102 96 L88 80 L75 96 L62 80 L48 96 L32 80 Z';
  const bottom = 'M15 92 L32 80 L48 96 L62 80 L75 96 L88 80 L102 96 L118 80 L135 92 C135 150 108 184 75 184 C42 184 15 150 15 92 Z';
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 150 190" className={phase === 1 ? 'scr-wobble' : undefined} style={{ overflow: 'visible' }}>
      <g style={{ transition: 'transform .45s cubic-bezier(.34,1.56,.64,1), opacity .45s', transform: phase === 2 ? 'translate(-30px,-90px) rotate(-35deg)' : 'none', opacity: phase === 2 ? 0 : 1, transformOrigin: '75px 60px' }}>
        <path d={top} fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
        <path d={top} fill="#FFFBEA" />
        <circle cx={55} cy={40} r={9} fill={color} /><circle cx={98} cy={58} r={7} fill={color} />
        <ellipse cx={50} cy={28} rx={14} ry={7} fill="#fff" />
      </g>
      <g style={{ transition: 'transform .45s ease-in, opacity .45s', transform: phase === 2 ? 'translate(0,50px)' : 'none', opacity: phase === 2 ? 0 : 1 }}>
        <path d={bottom} fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
        <path d={bottom} fill="#FFFBEA" />
        <path d="M30 150 C45 175 105 175 120 150 C110 182 40 182 30 150 Z" fill={dark} opacity={0.25} />
        <circle cx={48} cy={130} r={8} fill={color} /><circle cx={95} cy={145} r={10} fill={color} /><circle cx={110} cy={115} r={6} fill={color} />
      </g>
    </svg>
  );
}

const SKIN = ['#F6C9A0', '#E0A878', '#C68A5A', '#A9714A'];
const SHIRTS = ['#FF4B4B', '#1CB0F6', '#58CC02', '#CE82FF', '#FF9600', '#FF6FB5', '#FFC800', '#00CD9C'];

/** One tiny customer. */
export function Person({ i = 0, size = 90, mood = 'happy' }: { i?: number; size?: number; mood?: 'happy' | 'sad' | 'wow' }) {
  const skin = SKIN[i % SKIN.length];
  const shirt = SHIRTS[(i * 3) % SHIRTS.length];
  const hair = i % 3 === 0 ? '#4A3613' : i % 3 === 1 ? '#2E2010' : '#7A4A20';
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 90 126">
      <rect x={18} y={60} width={54} height={56} rx={26} fill="#fff" />
      <rect x={22} y={64} width={46} height={50} rx={22} fill={shirt} />
      <rect x={26} y={68} width={14} height={8} rx={4} fill="#fff" opacity={0.4} />
      <rect x={28} y={108} width={12} height={16} rx={6} fill={INK} /><rect x={50} y={108} width={12} height={16} rx={6} fill={INK} />
      <circle cx={45} cy={36} r={30} fill="#fff" />
      <circle cx={45} cy={36} r={26} fill={skin} />
      <path d="M19 32 C20 10 70 8 71 32 C60 22 34 22 19 32 Z" fill={hair} />
      <circle cx={36} cy={38} r={4.5} fill={INK} /><circle cx={54} cy={38} r={4.5} fill={INK} />
      {mood === 'sad'
        ? <path d="M36 54 Q45 47 54 54" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        : mood === 'wow' ? <ellipse cx={45} cy={52} rx={6} ry={7} fill={INK} />
        : <path d="M35 49 Q45 58 55 49" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </svg>
  );
}

export function RainCloud({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 220 200" className="scr-cloud">
      <g className="scr-rain">
        {[40, 80, 120, 160, 60, 140].map((x, i) => <rect key={i} x={x} y={110 + (i % 2) * 20} width={10} height={28} rx={5} fill="#5CC8F9" style={{ animationDelay: `${i * 0.13}s` }} />)}
      </g>
      <path d="M40 110 C10 110 10 60 45 62 C50 25 105 15 120 45 C140 20 190 35 182 70 C215 75 210 115 180 115 Z" fill="#9FA8B8" transform="translate(0 8)" />
      <path d="M40 110 C10 110 10 60 45 62 C50 25 105 15 120 45 C140 20 190 35 182 70 C215 75 210 115 180 115 Z" fill="#C9D0DC" />
      <ellipse cx={80} cy={50} rx={22} ry={10} fill="#fff" opacity={0.6} />
    </svg>
  );
}

export function Sparkle({ size = 60, color = 'var(--sun)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className="scr-twinkle">
      <path d="M30 2 C33 22 38 27 58 30 C38 33 33 38 30 58 C27 38 22 33 2 30 C22 27 27 22 30 2 Z" fill={color} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
}

/** Big flat ticket shape for the auction. */
export function TicketShape({ width = 900, height = 330, color = 'var(--sun)', edge = 'var(--sun-edge)' }: { width?: number; height?: number; color?: string; edge?: string }) {
  const notch = 34;
  const d = (w: number, h: number) => `M48 0 H${w - 48} Q${w} 0 ${w} 48 V${h / 2 - notch} A${notch} ${notch} 0 0 0 ${w} ${h / 2 + notch} V${h - 48} Q${w} ${h} ${w - 48} ${h} H48 Q0 ${h} 0 ${h - 48} V${h / 2 + notch} A${notch} ${notch} 0 0 0 0 ${h / 2 - notch} V48 Q0 0 48 0 Z`;
  return (
    <svg width={width} height={height + 14} viewBox={`-8 -8 ${width + 16} ${height + 30}`} style={{ overflow: 'visible', position: 'absolute', inset: 0 }}>
      <path d={d(width, height)} fill={edge} transform="translate(0 12)" />
      <path d={d(width, height)} fill={color} stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
      <line x1={width * 0.27} y1={26} x2={width * 0.27} y2={height - 26} stroke="#fff" strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
      <rect x={40} y={26} width={width * 0.14} height={16} rx={8} fill="#fff" opacity={0.5} />
    </svg>
  );
}

export function Gavel({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
      <rect x={96} y={70} width={26} height={140} rx={13} fill="#B36500" transform="rotate(-40 109 140)" />
      <rect x={92} y={70} width={22} height={140} rx={11} fill="#E07F00" transform="rotate(-40 109 140)" />
      <g transform="rotate(-40 110 70)">
        <rect x={40} y={36} width={140} height={74} rx={26} fill="#fff" />
        <rect x={46} y={42} width={128} height={62} rx={22} fill="#8C3FC4" />
        <rect x={46} y={42} width={122} height={54} rx={22} fill="#B05EE8" />
        <rect x={60} y={50} width={40} height={12} rx={6} fill="#fff" opacity={0.5} />
      </g>
    </svg>
  );
}

export function Microphone({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 220 308" style={{ overflow: 'visible' }}>
      <g className="scr-waves">
        <path d="M30 90 Q10 130 30 170" stroke="var(--sun-edge)" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M190 90 Q210 130 190 170" stroke="var(--sun-edge)" strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
      <rect x={96} y={190} width={28} height={100} rx={14} fill="#5A4A30" />
      <rect x={60} y={286} width={100} height={20} rx={10} fill="#5A4A30" />
      <rect x={52} y={20} width={116} height={186} rx={58} fill="#fff" />
      <rect x={60} y={28} width={100} height={170} rx={50} fill="#7A6A50" />
      <rect x={60} y={28} width={92} height={160} rx={46} fill="#9E8C6C" />
      {[60, 90, 120].map(y => <rect key={y} x={74} y={y} width={72} height={10} rx={5} fill="#7A6A50" />)}
      <rect x={74} y={40} width={26} height={12} rx={6} fill="#fff" opacity={0.5} />
    </svg>
  );
}

/** Hand showing fingers (voting). */
export function Hand({ size = 260, color = '#F6C9A0', dark = '#D9A577' }: { size?: number; color?: string; dark?: string }) {
  const fingers = [[40, 70, 120], [82, 30, 150], [124, 22, 160], [166, 36, 148]];
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 240 288" className="scr-wave-hand" style={{ overflow: 'visible' }}>
      <g stroke="#fff" strokeWidth={14} strokeLinejoin="round">
        {fingers.map(([x, y, h], i) => <rect key={i} x={x} y={y} width={38} height={h} rx={19} fill={color} />)}
        <rect x={180} y={150} width={38} height={100} rx={19} fill={color} transform="rotate(35 199 200)" />
        <rect x={34} y={140} width={180} height={140} rx={60} fill={color} />
      </g>
      {fingers.map(([x, y, h], i) => <rect key={i} x={x} y={y} width={38} height={h} rx={19} fill={color} />)}
      <rect x={180} y={150} width={38} height={100} rx={19} fill={color} transform="rotate(35 199 200)" />
      <rect x={34} y={140} width={180} height={140} rx={60} fill={color} />
      <path d="M60 250 Q124 290 190 250 Q170 282 124 284 Q80 282 60 250 Z" fill={dark} />
      {fingers.map(([x, y], i) => <rect key={`h${i}`} x={x + 8} y={y + 10} width={12} height={26} rx={6} fill="#fff" opacity={0.5} />)}
    </svg>
  );
}

export function Heart({ size = 200, broken }: { size?: number; broken?: boolean }) {
  const d = 'M100 178 C40 130 10 100 10 62 C10 30 36 12 60 12 C80 12 94 24 100 40 C106 24 120 12 140 12 C164 12 190 30 190 62 C190 100 160 130 100 178 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      <g className={broken ? 'scr-heart-left' : undefined}>
        <path d={d} fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" clipPath={broken ? 'url(#hl)' : undefined} />
        <path d={d} fill="var(--bad)" clipPath={broken ? 'url(#hl)' : undefined} />
      </g>
      {broken && (
        <g className="scr-heart-right">
          <path d={d} fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" clipPath="url(#hr)" />
          <path d={d} fill="var(--bad)" clipPath="url(#hr)" />
        </g>
      )}
      <ellipse cx={60} cy={50} rx={22} ry={12} fill="#fff" opacity={0.5} />
      <defs>
        <clipPath id="hl"><path d="M0 0 H104 L88 60 L110 100 L92 140 L100 200 H0 Z" /></clipPath>
        <clipPath id="hr"><path d="M104 0 H200 V200 H100 L92 140 L110 100 L88 60 Z" /></clipPath>
      </defs>
    </svg>
  );
}

/** Two hands meeting in a handshake. */
export function Handshake({ size = 260, left = '#1CB0F6', right = '#FF9600' }: { size?: number; left?: string; right?: string }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 260 156" style={{ overflow: 'visible' }}>
      <g className="scr-shake">
        <rect x={0} y={50} width={110} height={56} rx={28} fill="#fff" />
        <rect x={6} y={56} width={100} height={44} rx={22} fill={left} />
        <rect x={150} y={50} width={110} height={56} rx={28} fill="#fff" />
        <rect x={154} y={56} width={100} height={44} rx={22} fill={right} />
        <path d="M88 52 C110 30 150 30 172 52 L172 104 C150 126 110 126 88 104 Z" fill="#fff" />
        <path d="M96 58 C114 40 146 40 164 58 L164 98 C146 116 114 116 96 98 Z" fill="#F6C9A0" />
        <path d="M104 70 H156 M104 84 H156" stroke="#D9A577" strokeWidth={7} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Medal on a ribbon for the leaderboards. Gold, silver or bronze. No numbers: the colour says the place. */
const MEDALS = {
  gold: { rim: '#E0A100', face: '#FFC800', hi: '#FFE277', ribbonA: '#FF4B4B', ribbonB: '#D93636' },
  silver: { rim: '#8E99AD', face: '#C9D0DC', hi: '#EEF1F6', ribbonA: '#1CB0F6', ribbonB: '#1290CC' },
  bronze: { rim: '#B8651F', face: '#E58A3B', hi: '#F7B77C', ribbonA: '#58CC02', ribbonB: '#45A302' },
} as const;
export type MedalKind = keyof typeof MEDALS;
export function Medal({ kind, size = 72 }: { kind: MedalKind; size?: number }) {
  const m = MEDALS[kind];
  const star = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 9 : 20, a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${50 + r * Math.cos(a)},${66 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', flex: 'none' }} aria-hidden>
      <path d="M22 0 H44 L58 40 H38 Z" fill={m.ribbonB} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M78 0 H56 L42 40 H62 Z" fill={m.ribbonA} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <circle cx={50} cy={66} r={33} fill="#fff" />
      <circle cx={50} cy={69} r={29} fill={m.rim} />
      <circle cx={50} cy={66} r={29} fill={m.face} />
      <circle cx={50} cy={66} r={22} fill="none" stroke={m.hi} strokeWidth={3.5} />
      <polygon points={star} fill={m.hi} stroke={m.rim} strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={38} cy={52} rx={8} ry={4} fill="#fff" opacity={0.6} transform="rotate(-35 38 52)" />
    </svg>
  );
}

/** Small friendly crown for whoever is on top. */
export function Crown({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 120 84" style={{ overflow: 'visible', flex: 'none' }} aria-hidden>
      <path d="M12 70 L6 20 L38 44 L60 8 L82 44 L114 20 L108 70 Z" fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
      <path d="M12 74 L6 24 L38 48 L60 12 L82 48 L114 24 L108 74 Z" fill="#E0A100" strokeLinejoin="round" stroke="#E0A100" strokeWidth={4} />
      <path d="M12 70 L6 20 L38 44 L60 8 L82 44 L114 20 L108 70 Z" fill="#FFC800" strokeLinejoin="round" stroke="#FFC800" strokeWidth={4} />
      <circle cx={60} cy={54} r={8} fill="#FF4B4B" /><circle cx={30} cy={56} r={6} fill="#1CB0F6" /><circle cx={90} cy={56} r={6} fill="#58CC02" />
    </svg>
  );
}

/** A small up or down arrow for "moved up / moved down". */
export function MoveArrow({ up, size = 34 }: { up: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flex: 'none' }} aria-hidden>
      <path d={up ? 'M20 6 L35 24 H25 V34 H15 V24 H5 Z' : 'M20 34 L35 16 H25 V6 H15 V16 H5 Z'} fill={up ? '#58CC02' : '#FF4B4B'} stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  );
}

/** A calm kid doing a big stretch: arms float up when `up` is true and relax when it is false. Pure CSS transition, so it can follow a breathing rhythm. */
export function Stretcher({ up, size = 360, seconds = 4 }: { up: boolean; size?: number; seconds?: number }) {
  const arm = (side: 'l' | 'r'): CSSProperties => ({
    transformOrigin: side === 'l' ? '72px 128px' : '128px 128px',
    transform: `rotate(${(side === 'l' ? 1 : -1) * (up ? 164 : 14)}deg)`,
    transition: `transform ${seconds}s ease-in-out`,
  });
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 200 300" style={{ overflow: 'visible' }} aria-hidden>
      <g style={arm('l')}>
        <rect x={61} y={118} width={22} height={92} rx={11} fill="#fff" />
        <rect x={65} y={122} width={14} height={84} rx={7} fill="#1CB0F6" />
        <circle cx={72} cy={212} r={13} fill="#fff" /><circle cx={72} cy={212} r={9} fill="#F6C9A0" />
      </g>
      <g style={arm('r')}>
        <rect x={117} y={118} width={22} height={92} rx={11} fill="#fff" />
        <rect x={121} y={122} width={14} height={84} rx={7} fill="#1CB0F6" />
        <circle cx={128} cy={212} r={13} fill="#fff" /><circle cx={128} cy={212} r={9} fill="#F6C9A0" />
      </g>
      <rect x={72} y={206} width={26} height={80} rx={13} fill="#fff" /><rect x={102} y={206} width={26} height={80} rx={13} fill="#fff" />
      <rect x={77} y={210} width={16} height={72} rx={8} fill="#4A3613" /><rect x={107} y={210} width={16} height={72} rx={8} fill="#4A3613" />
      <rect x={70} y={270} width={30} height={16} rx={8} fill="#FF9600" /><rect x={100} y={270} width={30} height={16} rx={8} fill="#FF9600" />
      <rect x={60} y={104} width={80} height={118} rx={34} fill="#fff" />
      <rect x={65} y={109} width={70} height={108} rx={30} fill="#1CB0F6" />
      <rect x={74} y={118} width={20} height={9} rx={4.5} fill="#fff" opacity={0.45} />
      <circle cx={100} cy={64} r={46} fill="#fff" />
      <circle cx={100} cy={64} r={41} fill="#F6C9A0" />
      <path d="M58 58 C58 22 142 22 142 58 C124 44 76 44 58 58 Z" fill="#4A3613" />
      <path d="M80 70 Q86 76 92 70 M108 70 Q114 76 120 70" stroke="#4A3613" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M88 86 Q100 96 112 86" stroke="#4A3613" strokeWidth={4.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}
