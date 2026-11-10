// Scenes artist B: shared props used by more than one scene (flat, sticker bordered, light from top-left).
import type { CSSProperties, ReactNode } from 'react';
import { C, FONT, Star, Svg, starPts, useUid } from './core';

type Sx = { s?: number; style?: CSSProperties; className?: string };

export function Magnifier({ s = 360, style, className }: Sx) {
  return (
    <Svg vw={300} vh={340} w={s} style={style} className={className}>
      <path d="M205 208 L262 292" stroke="#fff" strokeWidth={46} />
      <circle cx={130} cy={130} r={98} fill="none" stroke="#fff" strokeWidth={46} />
      <path d="M203 204 L258 284" stroke={C.wood} strokeWidth={24} fill="none" />
      <path d="M198 196 L214 220" stroke={C.woodHi} strokeWidth={8} fill="none" />
      <circle cx={130} cy={130} r={98} fill="none" stroke={C.sun} strokeWidth={26} />
      <path d="M66 92 A74 74 0 0 1 112 58" stroke={C.sunHi} strokeWidth={9} fill="none" />
    </Svg>
  );
}

export function Megaphone({ s = 360, style, className }: Sx) {
  const u = useUid();
  return (
    <Svg vw={320} vh={250} w={s} style={style} className={className}>
      <defs><clipPath id={`mg${u}`}><path d="M64 86 L246 14 Q292 0 292 46 V196 Q292 242 246 228 L64 158Z" /></clipPath></defs>
      <g fill="#fff" stroke="#fff" strokeWidth={14}>
        <path d="M64 86 L246 14 Q292 0 292 46 V196 Q292 242 246 228 L64 158Z" /><rect x={14} y={86} width={64} height={72} rx={26} />
        <path d="M112 168 L140 168 L150 226 Q150 240 132 240 Q116 240 114 226Z" />
      </g>
      <path d="M112 164 L142 164 L150 224 Q150 238 132 238 Q116 238 114 224Z" fill={C.ink} />
      <path d="M64 86 L246 14 Q292 0 292 46 V196 Q292 242 246 228 L64 158Z" fill={C.bad} />
      <g clipPath={`url(#mg${u})`}>
        <path d="M170 -10 L206 -10 L206 260 L170 260Z" fill="#fff" />
        <path d="M80 70 L260 -4 L260 22 L80 96Z" fill={C.badHi} opacity={0.8} />
      </g>
      <rect x={14} y={86} width={64} height={72} rx={26} fill={C.steel} />
      <rect x={24} y={94} width={26} height={12} rx={6} fill={C.steelHi} />
      <ellipse cx={288} cy={121} rx={26} ry={96} fill={C.ink} opacity={0.88} />
      <ellipse cx={284} cy={121} rx={18} ry={80} fill={C.purpleEdge} opacity={0.0} />
    </Svg>
  );
}

export function Balloon({ s = 120, color = C.bad, edge = C.badEdge, hi = C.badHi, style, className }: Sx & { color?: string; edge?: string; hi?: string }) {
  const u = useUid();
  return (
    <Svg vw={100} vh={200} w={s} style={style} className={className}>
      <defs><clipPath id={`bl${u}`}><ellipse cx={50} cy={64} rx={42} ry={52} /></clipPath></defs>
      <path d="M50 124 Q36 150 54 170 Q64 184 48 198" stroke={C.inkSoft} strokeWidth={4} fill="none" />
      <ellipse cx={50} cy={64} rx={42} ry={52} fill="#fff" stroke="#fff" strokeWidth={10} />
      <path d="M42 116 L58 116 L50 130Z" fill={edge} stroke="#fff" strokeWidth={8} paintOrder="stroke" />
      <ellipse cx={50} cy={64} rx={42} ry={52} fill={color} />
      <g clipPath={`url(#bl${u})`}><ellipse cx={36} cy={50} rx={9} ry={15} fill={hi} transform="rotate(25 36 50)" /></g>
    </Svg>
  );
}

const POSTER_ICON = {
  star: (c: string) => <polygon points={starPts(110, 118, 54, 26)} fill={c} stroke={c} strokeWidth={10} />,
  heart: (c: string) => <path d="M110 170 C40 120 60 66 96 84 Q110 92 110 100 Q110 92 124 84 C160 66 180 120 110 170Z" fill={c} stroke={c} strokeWidth={10} />,
  smile: (c: string) => <g><circle cx={110} cy={118} r={56} fill={c} /><circle cx={92} cy={106} r={7} fill={C.ink} /><circle cx={128} cy={106} r={7} fill={C.ink} /><path d="M88 128 Q110 154 132 128" stroke={C.ink} strokeWidth={8} fill="none" /></g>,
  bolt: (c: string) => <path d="M122 60 L80 126 H108 L96 178 L144 108 H116Z" fill={c} stroke={c} strokeWidth={8} />,
};
export function Poster({ s = 200, color = C.blue, edge: _e = C.blueEdge, icon = 'star', tilt = 0, style, className }: Sx & { color?: string; edge?: string; icon?: keyof typeof POSTER_ICON; tilt?: number }) {
  return (
    <Svg vw={220} vh={290} w={s} style={{ transform: `rotate(${tilt}deg)`, ...style }} className={className}>
      <rect x={8} y={8} width={204} height={266} rx={22} fill="#fff" stroke="#fff" strokeWidth={6} />
      <rect x={24} y={24} width={172} height={234} rx={14} fill={color} />
      <rect x={34} y={34} width={60} height={14} rx={7} fill="#fff" opacity={0.45} />
      {POSTER_ICON[icon]('#fff')}
      <rect x={52} y={214} width={116} height={14} rx={7} fill="#fff" opacity={0.9} />
      <rect x={72} y={236} width={76} height={10} rx={5} fill="#fff" opacity={0.6} />
      <rect x={82} y={-6} width={56} height={26} rx={6} fill={C.sunHi} opacity={0.95} transform="rotate(-4 110 7)" />
    </Svg>
  );
}

export function CashBox({ s = 420, coins = 4, empty = false, style, className }: Sx & { coins?: number; empty?: boolean }) {
  const u = useUid();
  const pile = [[120, 92], [190, 88], [250, 94], [155, 78], [215, 76], [185, 66], [130, 70], [240, 74], [170, 54], [205, 58]];
  return (
    <Svg vw={380} vh={250} w={s} style={style} className={className}>
      <defs><clipPath id={`cb${u}`}><rect x={20} y={96} width={340} height={140} rx={34} /></clipPath></defs>
      <rect x={14} y={80} width={352} height={164} rx={38} fill="#fff" stroke="#fff" strokeWidth={10} />
      <rect x={30} y={30} width={320} height={80} rx={26} fill={C.blueEdge} stroke="#fff" strokeWidth={8} paintOrder="stroke" />
      <ellipse cx={190} cy={104} rx={150} ry={30} fill={C.blueDeep} />
      {!empty && pile.slice(0, coins).map(([x, y], i) => (
        <g key={i}><ellipse cx={x + 40} cy={y + 8} rx={30} ry={14} fill={C.coin} /><ellipse cx={x + 40} cy={y + 8} rx={16} ry={6} fill={C.coinHi} opacity={0.8} /></g>
      ))}
      {empty && <g opacity={0.9}><path d="M110 100 H270" stroke={C.blueEdge} strokeWidth={4} /><circle cx={190} cy={100} r={5} fill={C.blueEdge} /></g>}
      <rect x={20} y={96} width={340} height={140} rx={34} fill={C.blue} />
      <g clipPath={`url(#cb${u})`}><rect x={36} y={110} width={96} height={16} rx={8} fill={C.blueHi} /></g>
      <rect x={160} y={134} width={60} height={46} rx={14} fill={C.sun} />
      <circle cx={190} cy={156} r={8} fill={C.sunEdge} /><rect x={187} y={158} width={6} height={14} rx={3} fill={C.sunEdge} />
    </Svg>
  );
}

/** Friendly shark in a suit (top half, stands on its tail). */
export function Shark({ s = 260, style, className }: Sx) {
  const u = useUid();
  return (
    <Svg vw={300} vh={300} w={s} style={style} className={className}>
      <defs><clipPath id={`sk${u}`}><ellipse cx={150} cy={178} rx={96} ry={112} /></clipPath></defs>
      <g fill="#fff" stroke="#fff" strokeWidth={13}>
        <ellipse cx={150} cy={178} rx={96} ry={112} /><path d="M128 78 Q146 6 190 -4 Q176 40 188 82Z" />
        <ellipse cx={58} cy={200} rx={26} ry={44} transform="rotate(30 58 200)" /><ellipse cx={242} cy={200} rx={26} ry={44} transform="rotate(-30 242 200)" />
      </g>
      <ellipse cx={58} cy={200} rx={26} ry={44} transform="rotate(30 58 200)" fill="#6D8FB5" />
      <ellipse cx={242} cy={200} rx={26} ry={44} transform="rotate(-30 242 200)" fill="#6D8FB5" />
      <path d="M128 78 Q146 6 190 -4 Q176 40 188 82Z" fill="#6D8FB5" />
      <path d="M156 54 Q170 20 186 4 Q180 40 186 76Z" fill="#8CAAD0" />
      <ellipse cx={150} cy={178} rx={96} ry={112} fill="#8CAAD0" />
      <g clipPath={`url(#sk${u})`}>
        <ellipse cx={170} cy={248} rx={90} ry={86} fill="#F1F6FB" />
        <ellipse cx={226} cy={190} rx={30} ry={140} fill="#6D8FB5" opacity={0.55} />
        <ellipse cx={104} cy={104} rx={22} ry={12} fill="#B8CEE8" transform="rotate(-30 104 104)" />
      </g>
      {/* face */}
      <circle cx={112} cy={138} r={22} fill="#fff" /><circle cx={188} cy={138} r={22} fill="#fff" />
      <g className="blink" style={{ transformOrigin: '116px 140px' }}><circle cx={116} cy={140} r={11} fill={C.ink} /><circle cx={111} cy={134} r={4} fill="#fff" /></g>
      <g className="blink" style={{ transformOrigin: '184px 140px' }}><circle cx={184} cy={140} r={11} fill={C.ink} /><circle cx={179} cy={134} r={4} fill="#fff" /></g>
      <path d="M92 116 Q108 106 126 114" stroke={C.ink} strokeWidth={6} fill="none" /><path d="M208 116 Q192 106 174 114" stroke={C.ink} strokeWidth={6} fill="none" />
      <path d="M96 184 Q150 232 204 184 Z" fill={C.ink} stroke={C.ink} strokeWidth={6} />
      <path d="M112 186 L122 204 L132 190Z M140 190 L150 208 L160 190Z M168 190 L178 204 L188 186Z" fill="#fff" stroke="#fff" strokeWidth={3} />
      {/* tie */}
      <path d="M138 232 L162 232 L158 250 L142 250Z" fill={C.bad} stroke={C.badEdge} strokeWidth={3} />
      <path d="M142 250 L158 250 L166 290 L150 300 L134 290Z" fill={C.bad} stroke={C.badEdge} strokeWidth={3} />
    </Svg>
  );
}

/** Friendly dolphin (top half, standing). */
export function Dolphin({ s = 260, style, className }: Sx) {
  const u = useUid();
  return (
    <Svg vw={300} vh={300} w={s} style={style} className={className}>
      <defs><clipPath id={`dl${u}`}><ellipse cx={140} cy={176} rx={84} ry={112} /></clipPath></defs>
      <g fill="#fff" stroke="#fff" strokeWidth={13}>
        <ellipse cx={140} cy={176} rx={84} ry={112} /><rect x={196} y={136} width={96} height={46} rx={23} />
        <path d="M112 76 Q96 30 132 8 Q134 44 150 78Z" /><ellipse cx={56} cy={206} rx={22} ry={42} transform="rotate(32 56 206)" />
      </g>
      <ellipse cx={56} cy={206} rx={22} ry={42} transform="rotate(32 56 206)" fill="#27A5DF" />
      <path d="M112 76 Q96 30 132 8 Q134 44 150 78Z" fill="#27A5DF" />
      <rect x={196} y={136} width={96} height={46} rx={23} fill="#4FC6F2" />
      <ellipse cx={140} cy={176} rx={84} ry={112} fill="#4FC6F2" />
      <g clipPath={`url(#dl${u})`}>
        <ellipse cx={168} cy={246} rx={84} ry={76} fill="#EAF9FF" />
        <ellipse cx={206} cy={190} rx={26} ry={130} fill="#27A5DF" opacity={0.45} />
        <ellipse cx={98} cy={106} rx={20} ry={11} fill="#9DE1FA" transform="rotate(-35 98 106)" />
      </g>
      <circle cx={158} cy={130} r={21} fill="#fff" />
      <g className="blink" style={{ transformOrigin: '162px 132px' }}><circle cx={162} cy={132} r={11} fill={C.ink} /><circle cx={157} cy={126} r={4} fill="#fff" /></g>
      <path d="M146 108 Q160 98 176 106" stroke={C.ink} strokeWidth={6} fill="none" />
      <path d="M204 160 Q240 184 284 160" stroke={C.ink} strokeWidth={6} fill="none" />
      <circle cx={124} cy={160} r={9} fill={C.pink} opacity={0.5} />
      {/* little coin bag */}
      <g transform="translate(150 196)"><path d="M10 30 Q-10 60 14 90 H66 Q90 60 70 30 Q40 20 10 30Z" fill={C.good} stroke="#fff" strokeWidth={8} paintOrder="stroke" /><path d="M14 36 Q40 24 66 36" stroke={C.goodEdge} strokeWidth={8} fill="none" /><circle cx={40} cy={64} r={14} fill={C.goodHi} /></g>
    </Svg>
  );
}

/** Boat: draws back (mast/sail), then children (the passenger), then the front hull. Width 360. */
export function Boat({ hull = C.blue, edge = C.blueEdge, hi = C.blueHi, sail = '#fff', sailEdge = '#E8DDB5', flag = C.bad, s = 380, mast = true, children, style, className }: {
  hull?: string; edge?: string; hi?: string; sail?: string; sailEdge?: string; flag?: string; s?: number; mast?: boolean; children?: ReactNode; style?: CSSProperties; className?: string;
}) {
  const u = useUid();
  const k = s / 360;
  return (
    <div style={{ position: 'relative', width: s, height: 420 * k, ...style }} className={className}>
      {mast && (
        <Svg vw={360} vh={420} w={s} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M180 20 V300" stroke={C.ink} strokeWidth={9} />
          <path d="M186 40 Q290 120 290 250 H186Z" fill={sail} stroke="#fff" strokeWidth={8} paintOrder="stroke" />
          <path d="M186 160 Q250 190 288 250 H186Z" fill={sailEdge} opacity={0.7} />
          <path d="M180 22 L230 38 L180 56Z" fill={flag} />
        </Svg>
      )}
      <div style={{ position: 'absolute', left: 0, top: 0, width: s, height: 420 * k }}>{children}</div>
      <Svg vw={360} vh={420} w={s} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs><clipPath id={`bt${u}`}><path d="M8 296 H352 Q344 376 290 400 H80 Q26 376 8 296Z" /></clipPath></defs>
        <path d="M8 296 H352 Q344 376 290 400 H80 Q26 376 8 296Z" fill="#fff" stroke="#fff" strokeWidth={16} />
        <path d="M8 296 H352 Q344 376 290 400 H80 Q26 376 8 296Z" fill={hull} />
        <g clipPath={`url(#bt${u})`}>
          <rect x={0} y={300} width={360} height={16} fill={hi} />
          <rect x={0} y={330} width={360} height={14} fill="#fff" opacity={0.85} />
        </g>
        {[90, 180, 270].map(x => <g key={x}><circle cx={x} cy={364} r={17} fill={edge} /><circle cx={x} cy={364} r={11} fill={C.sky2} /></g>)}
      </Svg>
    </div>
  );
}

/** rAIvan's Copy-O-Matic. Eyes follow slow blinks. Paper slot at about (260, 330) of 520x420. */
export function Copier({ s = 520, mood = 'sneaky', lamp = true, style, className }: Sx & { mood?: 'sneaky' | 'angry'; lamp?: boolean }) {
  const u = useUid();
  return (
    <Svg vw={520} vh={440} w={s} style={style} className={className}>
      <defs><clipPath id={`cp${u}`}><rect x={20} y={176} width={480} height={220} rx={40} /></clipPath></defs>
      <rect x={40} y={396} width={70} height={30} rx={14} fill={C.rvDeep} /><rect x={410} y={396} width={70} height={30} rx={14} fill={C.rvDeep} />
      <g fill="#fff" stroke="#fff" strokeWidth={14}><rect x={20} y={176} width={480} height={220} rx={40} /><rect x={8} y={92} width={504} height={110} rx={36} /></g>
      <rect x={20} y={176} width={480} height={220} rx={40} fill={C.rv} />
      <g clipPath={`url(#cp${u})`}><rect x={36} y={192} width={150} height={16} rx={8} fill={C.rvHi} /></g>
      {/* scanner lid */}
      <rect x={8} y={90} width={504} height={110} rx={36} fill={C.rvHi} />
      <rect x={44} y={108} width={432} height={52} rx={22} fill="#F3E8FF" />
      <rect x={52} y={114} width={120} height={12} rx={6} fill="#fff" />
      {lamp && <g style={{ overflow: 'hidden' }}><rect className="copierbar" x={60} y={118} width={22} height={40} rx={11} fill={C.sunHi} /></g>}
      {/* control buttons */}
      <circle cx={430} cy={178} r={9} fill={C.good} className="pulse" style={{ transformOrigin: '430px 178px', ['--d' as string]: '.8s' } as CSSProperties} />
      <circle cx={458} cy={178} r={9} fill={C.bad} className="pulse" style={{ transformOrigin: '458px 178px', ['--d' as string]: '.8s', ['--dl' as string]: '.4s' } as CSSProperties} />
      {/* face */}
      <circle cx={170} cy={262} r={44} fill="#fff" /><circle cx={350} cy={262} r={44} fill="#fff" />
      <g className="blink" style={{ transformOrigin: '176px 266px', ['--d' as string]: '3.4s' } as CSSProperties}><circle cx={176} cy={266} r={22} fill={C.ink} /><circle cx={168} cy={256} r={7} fill="#fff" /></g>
      <g className="blink" style={{ transformOrigin: '344px 266px', ['--d' as string]: '3.4s' } as CSSProperties}><circle cx={344} cy={266} r={22} fill={C.ink} /><circle cx={336} cy={256} r={7} fill="#fff" /></g>
      {mood === 'angry'
        ? <><path d="M118 218 L206 246" stroke={C.ink} strokeWidth={10} /><path d="M402 218 L314 246" stroke={C.ink} strokeWidth={10} /></>
        : <><path d="M120 236 L204 232" stroke={C.ink} strokeWidth={10} /><path d="M400 232 L316 228" stroke={C.ink} strokeWidth={10} /></>}
      {/* paper slot */}
      <rect x={110} y={324} width={300} height={34} rx={17} fill={C.rvDeep} />
      <rect x={118} y={330} width={284} height={8} rx={4} fill="#000" opacity={0.25} />
    </Svg>
  );
}

/** A fake copied sheet: paper with a wonky purple frame and `children` art inside (max ~200x200). */
export function FakeSheet({ s = 240, children, style, className }: { s?: number; children?: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ width: s, height: s * 1.18, position: 'relative', background: '#fff', border: '6px solid #fff', borderRadius: 26, boxShadow: 'var(--sh-sm)', ...style }}>
      <div style={{ position: 'absolute', inset: 8, borderRadius: 20, background: '#F3E8FF', display: 'grid', placeItems: 'center' }}>{children}</div>
      <div style={{ position: 'absolute', right: 10, top: 10, width: s * 0.2, height: s * 0.2, borderRadius: '50%', background: C.rv, display: 'grid', placeItems: 'center' }}>
        <svg width={s * 0.12} height={s * 0.12} viewBox="0 0 20 20"><path d="M3 10 H17 M10 3 V17" stroke="#fff" strokeWidth={4} strokeLinecap="round" transform="rotate(45 10 10)" /></svg>
      </div>
    </div>
  );
}

/** Price tag with a string hole; label >= 44 px. */
export function PriceTag({ label, s = 240, color = C.sun, edge = C.sunEdge, hi = C.sunHi, textColor = C.ink, style, className }: Sx & { label: string; color?: string; edge?: string; hi?: string; textColor?: string }) {
  return (
    <Svg vw={240} vh={170} w={s} style={style} className={className}>
      <path d="M62 20 H214 Q232 20 232 38 V140 Q232 158 214 158 H62 Q50 158 42 148 L8 96 Q4 90 8 82 L42 30 Q50 20 62 20Z" fill="#fff" stroke="#fff" strokeWidth={12} />
      <path d="M62 20 H214 Q232 20 232 38 V140 Q232 158 214 158 H62 Q50 158 42 148 L8 96 Q4 90 8 82 L42 30 Q50 20 62 20Z" fill={color} />
      <path d="M72 34 H190" stroke={hi} strokeWidth={10} />
      <circle cx={46} cy={89} r={13} fill="#fff" stroke={edge} strokeWidth={5} />
      <text x={138} y={118} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={textColor}>{label}</text>
    </Svg>
  );
}

export { Star };
