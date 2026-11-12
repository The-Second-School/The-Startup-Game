// Building (the startup's look by stage) and ProductArt (the 10 products, see PRODUCTS in game/content.ts). Flat layered SVG.
import { memo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Sticker, Shaded, rrect, circ, path } from './svg';
import { darken, lighten } from './palette';

type Stage = 'stall' | 'shop' | 'office' | 'tower';

function Win({ x, y, w = 14, h = 16, d = 0 }: { x: number; y: number; w?: number; h?: number; d?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="#FFE277" className="ui-blinklight in" style={{ ['--d' as string]: `${-d}s` }} />;
}

/** viewBox 0 0 200 240; ground at y 232. */
function BuildingImpl({ stage, color, size = 160, animateIn }: { stage: Stage; color: string; size?: number; animateIn?: boolean }) {
  const base = color, sh = darken(color, 0.1), edge = darken(color, 0.2), hi = lighten(color, 0.45), pale = lighten(color, 0.7);
  let art: ReactNode;
  if (stage === 'stall') {
    art = (<>
      <circle cx={62} cy={214} r={16} fill="#4A3613" /><circle cx={62} cy={214} r={7} fill="#B8C3D6" className="in" />
      <circle cx={142} cy={214} r={16} fill="#4A3613" /><circle cx={142} cy={214} r={7} fill="#B8C3D6" className="in" />
      <rect x={60} y={110} width={8} height={70} rx={4} fill="#9AA7BC" /><rect x={132} y={110} width={8} height={70} rx={4} fill="#9AA7BC" />
      <Shaded shape={rrect(36, 150, 128, 58, 16)} fill={base} shade={sh} off={[4, 4]}><rect x={44} y={156} width={40} height={8} rx={4} fill={hi} /></Shaded>
      <rect x={52} y={170} width={96} height={22} rx={8} fill={pale} className="in" />
      <path d="M20 112 Q100 50 180 112 Z" fill="#fff" />
      <g className="in">{[0, 1, 2, 3].map(i => <path key={i} d={`M${20 + i * 40} 112 Q${40 + i * 40} ${i === 0 || i === 3 ? 84 : 70} ${60 + i * 40} 112Z`} fill={i % 2 ? '#fff' : base} />)}</g>
      <circle cx={100} cy={64} r={7} fill={edge} />
    </>);
  } else if (stage === 'shop') {
    art = (<>
      <Shaded shape={rrect(24, 80, 152, 152, 18)} fill={base} shade={sh} off={[5, 5]}><rect x={34} y={90} width={10} height={60} rx={5} fill={hi} /></Shaded>
      <rect x={14} y={60} width={172} height={30} rx={14} fill={edge} />
      <rect x={50} y={30} width={100} height={36} rx={14} fill="#fff" />
      <rect x={58} y={38} width={84} height={20} rx={8} fill="#FFC800" className="in" />
      <path d="M16 96 H184 L176 122 H24Z" fill="#fff" />
      <g className="in">{[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${20 + i * 32} 96 h32 l-2 26 q-14 8 -28 0Z`} fill={i % 2 ? '#fff' : '#FF4B4B'} />)}</g>
      <rect x={40} y={140} width={56} height={46} rx={10} fill={pale} className="in" />
      <Win x={48} y={148} w={18} h={30} /><Win x={70} y={148} w={18} h={30} d={0.7} />
      <rect x={112} y={140} width={48} height={92} rx={12} fill={edge} className="in" />
      <circle cx={150} cy={190} r={4} fill="#FFC800" className="in" />
    </>);
  } else if (stage === 'office') {
    art = (<>
      <Shaded shape={rrect(30, 40, 140, 192, 20)} fill={base} shade={sh} off={[5, 5]}><rect x={40} y={50} width={10} height={90} rx={5} fill={hi} /></Shaded>
      <rect x={60} y={20} width={80} height={26} rx={12} fill={edge} />
      <g className="in">{[0, 1, 2].map(r => [0, 1, 2].map(c => <Win key={`${r}${c}`} x={52 + c * 36} y={64 + r * 44} w={24} h={28} d={r * 0.6 + c * 0.3} />))}</g>
      <rect x={80} y={190} width={40} height={42} rx={10} fill={edge} className="in" />
      <rect x={14} y={226} width={172} height={10} rx={5} fill="#9AA7BC" />
    </>);
  } else {
    art = (<>
      <path d="M100 0 V24" stroke="#9AA7BC" strokeWidth={6} strokeLinecap="round" className="ln" style={{ ['--lw' as string]: '6px' }} />
      <circle cx={100} cy={4} r={7} fill="#FF4B4B" className="ui-blinklight" />
      <g className="ui-sway" style={{ ['--dur' as string]: '1.6s' }}><path d="M102 30 L132 38 L102 46Z" fill="#FFC800" /></g>
      <rect x={100} y={26} width={4} height={30} rx={2} fill="#9AA7BC" />
      <Shaded shape={path('M64 56 H136 L146 232 H54Z')} fill={base} shade={sh} off={[5, 5]}><rect x={72} y={64} width={8} height={120} rx={4} fill={hi} /></Shaded>
      <g className="in">{[0, 1, 2, 3, 4, 5].map(r => [0, 1].map(c => <Win key={`${r}${c}`} x={80 + c * 26} y={70 + r * 26} w={16} h={16} d={r * 0.4 + c * 0.9} />))}</g>
      <Shaded shape={rrect(18, 140, 44, 92, 12)} fill={sh} shade={edge} off={[3, 3]} />
      <Shaded shape={rrect(138, 120, 46, 112, 12)} fill={sh} shade={edge} off={[3, 3]} />
      <g className="in">{[0, 1, 2].map(r => <Win key={r} x={30} y={152 + r * 24} w={20} h={12} d={r} />)}{[0, 1, 2, 3].map(r => <Win key={`b${r}`} x={152} y={132 + r * 24} w={20} h={12} d={r + 0.5} />)}</g>
      <rect x={86} y={196} width={28} height={36} rx={8} fill={edge} className="in" />
    </>);
  }
  const svg = (
    <svg className="ui-svg-art" width={size} height={size * 1.2} viewBox="0 0 200 240" aria-hidden>
      <ellipse cx={100} cy={234} rx={86} ry={8} fill="#000" opacity={0.08} />
      <Sticker w={5}>{art}</Sticker>
    </svg>
  );
  if (!animateIn) return svg;
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.2 }}>
      <motion.div initial={{ scaleY: 0.1, scaleX: 1.2, y: 20, opacity: 0 }} animate={{ scaleY: 1, scaleX: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} style={{ originY: 1 }}>
        {svg}
      </motion.div>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div key={i} initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.9 }} animate={{ x: (i - 2) * size * 0.25, y: -size * 0.08, scale: 1.4, opacity: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ position: 'absolute', left: size / 2 - 18, bottom: 0, width: 36, height: 36, borderRadius: 99, background: '#fff' }} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductArt: viewBox 0 0 120 120.
const PROD: Record<string, () => ReactNode> = {
  tiffingo: () => (<>
    <path d="M38 18 Q60 0 82 18" stroke="#9AA7BC" strokeWidth={7} fill="none" className="ln" style={{ ['--lw' as string]: '7px' }} />
    {[0, 1, 2].map(i => <Shaded key={i} shape={rrect(26, 26 + i * 28, 68, 28, 10)} fill={['#FF9600', '#FFC800', '#FF4B4B'][i]} shade={['#E07F00', '#E0A100', '#D93636'][i]} off={[3, 3]} />)}
    <rect x={20} y={22} width={80} height={10} rx={5} fill="#B8C3D6" />
    <g className="in ui-steam"><path d="M48 14 q4 -6 0 -12 M62 12 q4 -6 0 -12" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" /></g>
  </>),
  cycleshare: () => (<>
    <circle cx={30} cy={78} r={22} fill="none" stroke="#4A3613" strokeWidth={8} className="ln" style={{ ['--lw' as string]: '8px' }} />
    <circle cx={90} cy={78} r={22} fill="none" stroke="#4A3613" strokeWidth={8} className="ln" style={{ ['--lw' as string]: '8px' }} />
    <path d="M30 78 L52 46 H84 L90 78 M52 46 L62 78 L84 46 M46 36 H60 M84 46 L80 32 H92" stroke="#1CB0F6" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" className="ln" style={{ ['--lw' as string]: '7px' }} />
    <circle cx={62} cy={78} r={6} fill="#FFC800" />
  </>),
  mathmagic: () => (<>
    <Shaded shape={rrect(10, 30, 100, 62, 26)} fill="#CE82FF" shade="#B05EE8" off={[4, 4]}><rect x={22} y={36} width={30} height={6} rx={3} fill="#EBCBFF" /></Shaded>
    <rect x={38} y={42} width={44} height={36} rx={8} fill="#2E3A59" className="in" />
    <text x={60} y={68} textAnchor="middle" fontSize={22} fontWeight={800} fill="#7CF3FF" className="in">2+2</text>
    <g className="in"><path d="M18 60 h14 M25 53 v14" stroke="#fff" strokeWidth={5} strokeLinecap="round" /><circle cx={94} cy={54} r={5} fill="#FF4B4B" /><circle cx={94} cy={68} r={5} fill="#58CC02" /></g>
  </>),
  farmfriend: () => (<>
    <Shaded shape={path('M24 80 H96 L88 110 H32Z')} fill="#E07F00" shade="#B36500" off={[3, 3]} />
    <path d="M60 80 V40" stroke="#46A302" strokeWidth={7} strokeLinecap="round" className="ln" style={{ ['--lw' as string]: '7px' }} />
    <Shaded shape={path('M60 50 Q30 50 26 26 Q54 24 60 50Z')} fill="#58CC02" shade="#46A302" off={[2, 2]} />
    <Shaded shape={path('M60 44 Q90 44 94 18 Q66 16 60 44Z')} fill="#89DD45" shade="#58CC02" off={[2, 2]} />
    <path d="M98 50 Q106 62 98 68 Q90 62 98 50Z" fill="#1CB0F6" className="ui-bob" />
  </>),
  petpal: () => (<>
    <Shaded shape={path('M26 30 Q14 30 16 56 Q22 66 30 56Z')} fill="#B36500" shade="#8A4D00" off={[2, 2]} />
    <Shaded shape={path('M94 30 Q106 30 104 56 Q98 66 90 56Z')} fill="#B36500" shade="#8A4D00" off={[2, 2]} />
    <Shaded shape={circ(60, 60, 38)} fill="#FFB44D" shade="#E09A3A" off={[4, 4]}><ellipse cx={44} cy={42} rx={8} ry={5} fill="#FFD199" transform="rotate(-30 44 42)" /></Shaded>
    <g className="in"><circle cx={46} cy={54} r={5} fill="#3B2A0E" /><circle cx={74} cy={54} r={5} fill="#3B2A0E" /><ellipse cx={60} cy={70} rx={10} ry={8} fill="#FFF4E0" /><ellipse cx={60} cy={66} rx={5} ry={4} fill="#3B2A0E" /><path d="M56 78 q4 8 8 0" fill="#FF6FB5" /></g>
  </>),
  homeworkbuddy: () => (<>
    {/* study tablet with a to-do list, and a visor-bot popping out of it */}
    <Shaded shape={rrect(14, 56, 92, 58, 14)} fill="#2E3A59" shade="#1F2940" off={[3, 3]}><rect x={20} y={61} width={44} height={6} rx={3} fill="#4A5A80" /></Shaded>
    <g className="in">
      {[0, 1, 2].map(r => (<g key={r}>
        <rect x={24} y={72 + r * 13} width={9} height={9} rx={3} fill={r < 2 ? '#58CC02' : 'none'} stroke="#7CF3FF" strokeWidth={2.4} />
        {r < 2 && <path d={`M26 ${76 + r * 13} l2 2.4 l4 -5`} stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        <rect x={40} y={74 + r * 13} width={r === 1 ? 40 : 52} height={5} rx={2.5} fill="#7CF3FF" opacity={r < 2 ? 0.45 : 0.9} />
      </g>))}
    </g>
    <g className="ui-bob" style={{ ['--amp' as string]: '3px', ['--dur' as string]: '2.2s' }}>
      <rect x={58} y={2} width={4} height={12} rx={2} fill="#9AA7BC" /><circle cx={60} cy={4} r={5.5} fill="#FF9600" className="ui-blinklight" />
      <rect x={24} y={22} width={8} height={18} rx={4} fill="#00A57E" /><rect x={88} y={22} width={8} height={18} rx={4} fill="#00A57E" />
      <Shaded shape={rrect(30, 12, 60, 46, 20)} fill="#00CD9C" shade="#00A57E" off={[3, 4]}><ellipse cx={44} cy={20} rx={9} ry={3.5} fill="#7FF0D4" transform="rotate(-12 44 20)" /></Shaded>
      <rect x={37} y={24} width={46} height={22} rx={11} fill="#1F2940" className="in" />
      <g className="in"><ellipse cx={50} cy={35} rx={5} ry={5.5} fill="#7CF3FF" /><ellipse cx={70} cy={35} rx={5} ry={5.5} fill="#7CF3FF" /><circle cx={48.5} cy={33} r={1.6} fill="#fff" /><circle cx={68.5} cy={33} r={1.6} fill="#fff" /></g>
    </g>
  </>),
  sipbottle: () => (<>
    {/* smart bottle: dark smart cap with an LED, water level, a little drop screen and a glowing hydration ring */}
    <Shaded shape={rrect(42, 4, 36, 22, 9)} fill="#2E3A59" shade="#1F2940" off={[2, 3]} />
    <circle cx={60} cy={15} r={4} fill="#7CF3FF" className="ui-blinklight in" />
    <Shaded shape={rrect(34, 22, 52, 94, 22)} fill="#7FD6FF" shade="#1CB0F6" off={[4, 4]}><rect x={41} y={32} width={7} height={52} rx={3.5} fill="#D6F1FF" /></Shaded>
    <g className="in">
      <path d="M34 70 Q47 62 60 70 T86 70 V94 Q86 116 64 116 H56 Q34 116 34 94Z" fill="#1CB0F6" opacity={0.85} />
      <rect x={46} y={36} width={28} height={26} rx={9} fill="#1F2940" />
      <path d="M60 41 q-7 9 -7 13 a7 7 0 0 0 14 0 q0 -4 -7 -13z" fill="#7CF3FF" />
      {[0, 1, 2].map(i => <rect key={i} x={78} y={32 + i * 8} width={5} height={3} rx={1.5} fill="#fff" opacity={0.8 - i * 0.2} />)}
    </g>
  </>),
  roombot: () => (<>
    {/* round robot vacuum: white shell, dark smart top, glowing ring, little lidar and a happy face */}
    <ellipse cx={60} cy={92} rx={52} ry={18} fill="#1F2940" />
    <Shaded shape={path('M8 76 Q8 100 60 100 Q112 100 112 76 L112 66 Q112 40 60 40 Q8 40 8 66Z')} fill="#F4F1EA" shade="#CFC8B8" off={[4, 5]}><ellipse cx={34} cy={52} rx={14} ry={5} fill="#fff" transform="rotate(-16 34 52)" /></Shaded>
    <path d="M10 80 Q12 98 60 98 Q108 98 110 80" stroke="#FF4B4B" strokeWidth={7} fill="none" strokeLinecap="round" className="in" />
    <ellipse cx={60} cy={62} rx={40} ry={15} fill="#2E3A59" className="in" />
    <ellipse cx={60} cy={62} rx={40} ry={15} fill="none" stroke="#7CF3FF" strokeWidth={2.5} opacity={0.7} className="in ui-blinklight" />
    <g className="in"><ellipse cx={47} cy={61} rx={5} ry={6} fill="#7CF3FF" /><ellipse cx={73} cy={61} rx={5} ry={6} fill="#7CF3FF" /><path d="M53 69 q7 5 14 0" stroke="#7CF3FF" strokeWidth={3} fill="none" strokeLinecap="round" /></g>
    <rect x={54} y={30} width={12} height={14} rx={5} fill="#5B6B7A" /><circle cx={60} cy={30} r={6} fill="#FF4B4B" className="ui-blinklight" />
    <g className="ui-spin-slow" style={{ ['--dur' as string]: '1.2s' }}><path d="M12 106 l10 -6 M12 106 l10 6 M12 106 h12" stroke="#FFC800" strokeWidth={4} strokeLinecap="round" /></g>
    <g className="in"><path d="M100 18 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#FFC800" /></g>
  </>),
  solarbuddy: () => (<>
    {/* solar lamp: tilted solar panel on a stem, a glowing lantern below, rays of light */}
    <path d="M60 36 V50" stroke="#5B6B7A" strokeWidth={7} strokeLinecap="round" className="ln" style={{ ['--lw' as string]: '7px' }} />
    <Shaded shape={path('M24 36 L96 36 L108 10 L36 10Z')} fill="#2B72E0" shade="#1B4FAE" off={[3, 3]}><path d="M32 12 H46 L38 34 H26Z" fill="#6FA8FF" opacity={0.5} /></Shaded>
    <g className="in" stroke="#BFD8FF" strokeWidth={1.8} opacity={0.85}><path d="M56 10 L48 36 M76 10 L72 36 M97 10 L89 36 M32 23 H102" /></g>
    <Shaded shape={rrect(32, 50, 56, 58, 22)} fill="#FFC800" shade="#E0A100" off={[4, 4]} />
    <rect x={40} y={58} width={40} height={36} rx={15} fill="#FFF6BF" className="in" />
    <g className="in"><circle cx={60} cy={77} r={9} fill="#fff" /><circle cx={60} cy={77} r={14} fill="#FFE277" opacity={0.55} className="ui-glow" /></g>
    <rect x={38} y={102} width={44} height={10} rx={5} fill="#5B6B7A" />
    <g className="ui-pulse in" style={{ ['--dur' as string]: '1.8s' }}><path d="M18 62 H6 M20 78 H4 M22 94 L10 100 M102 62 H114 M100 78 H116 M98 94 L110 100" stroke="#FFC800" strokeWidth={5} strokeLinecap="round" /></g>
  </>),
  cleanstreet: () => (<>
    {/* green recycling bin with the three-arrows mark, a leaf and a bottle dropping in */}
    <Shaded shape={path('M26 44 H94 L86 110 Q85 114 80 114 H40 Q35 114 34 110Z')} fill="#58CC02" shade="#46A302" off={[4, 4]}><rect x={32} y={52} width={7} height={52} rx={3.5} fill="#A5ED6E" /></Shaded>
    <Shaded shape={rrect(18, 30, 84, 18, 9)} fill="#46A302" shade="#357D00" off={[2, 3]} />
    <rect x={48} y={22} width={24} height={10} rx={5} fill="#357D00" />
    <g className="in" fill="none" stroke="#fff" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 58 L71 76" /><path d="M72 88 H50" /><path d="M49 76 L56 62" />
    </g>
    <g className="in" fill="#fff"><path d="M75 70 L76 82 L65 78Z" /><path d="M54 94 L52 83 L63 88Z" /><path d="M43 71 L55 69 L50 80Z" /></g>
    <g className="ui-bob" style={{ ['--amp' as string]: '5px', ['--dur' as string]: '1.8s' }}>
      <path d="M90 6 Q112 8 110 28 Q90 28 90 6Z" fill="#89DD45" />
      <path d="M92 8 Q100 16 108 26" stroke="#46A302" strokeWidth={2.5} fill="none" strokeLinecap="round" className="in" />
    </g>
    <g className="ui-bob" style={{ ['--amp' as string]: '5px', ['--dur' as string]: '2.2s', ['--d' as string]: '-0.8s' }}>
      <rect x={8} y={6} width={13} height={24} rx={5} fill="#7FD6FF" /><rect x={11} y={2} width={7} height={7} rx={2} fill="#1CB0F6" />
    </g>
  </>),
};

function ProductArtImpl({ productId, size = 120 }: { productId: string; size?: number }) {
  const draw = PROD[productId];
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="-6 -6 132 132" aria-hidden style={{ flex: 'none' }}>
      {draw ? <Sticker w={5}>{draw()}</Sticker> : <circle cx={60} cy={60} r={50} fill="#FFC800" />}
    </svg>
  );
}

export const Building = memo(BuildingImpl);

export const ProductArt = memo(ProductArtImpl);
