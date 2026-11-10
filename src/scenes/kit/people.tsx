// Characters for scenes: Kid (school kid / customer), Mayor, RobotChaiwala, Crowd.
// Each renders its own <svg>; `size` = rendered height in px. Feet sit on the bottom edge.
import type { CSSProperties } from 'react';
import { HAIR, HUE, INK, SKIN, type Hue } from './palette';
import { Ball } from './shapes';

export type KidPose = 'idle' | 'cheer' | 'gasp' | 'shiver' | 'hold' | 'point' | 'wave' | 'think';
export type KidMood = 'happy' | 'sad' | 'wow' | 'cold' | 'grin' | 'worried';
export type KidProps = {
  size?: number; skin?: number; hair?: number; hairStyle?: 0 | 1 | 2 | 3; shirt?: Hue; pants?: string;
  pose?: KidPose; mood?: KidMood; walking?: boolean; blush?: boolean; style?: CSSProperties; className?: string; flip?: boolean; delay?: number;
};

const ARMS: Record<KidPose, [string, string]> = {
  idle: ['M62 158 Q46 196 44 228', 'M138 158 Q154 196 156 228'],
  cheer: ['M62 156 Q36 116 32 66', 'M138 156 Q164 116 168 66'],
  gasp: ['M62 158 Q30 190 66 128', 'M138 158 Q170 190 134 128'],
  shiver: ['M62 160 Q70 200 128 190', 'M138 160 Q130 200 72 190'],
  hold: ['M62 160 Q56 200 84 206', 'M138 160 Q144 200 116 206'],
  point: ['M62 158 Q46 196 44 228', 'M138 156 Q170 130 188 100'],
  wave: ['M62 158 Q46 196 44 228', 'M138 156 Q172 120 170 72'],
  think: ['M62 158 Q46 196 44 228', 'M138 160 Q150 200 112 150'],
};
const HANDS: Record<KidPose, [[number, number], [number, number]]> = {
  idle: [[44, 230], [156, 230]], cheer: [[32, 62], [168, 62]], gasp: [[66, 126], [134, 126]], shiver: [[128, 190], [72, 190]],
  hold: [[86, 206], [114, 206]], point: [[44, 230], [190, 98]], wave: [[170, 68], [170, 68]], think: [[44, 230], [112, 148]],
};

function Face({ mood, cx, cy, blush }: { mood: KidMood; cx: number; cy: number; blush: boolean }) {
  const eyeY = cy - 4;
  return (
    <g>
      <g className="k-eyes" style={{ ['--dur' as string]: `${3.2 + (cx % 3) * 0.6}s` }}>
        <ellipse cx={cx - 20} cy={eyeY} rx={11} ry={mood === 'wow' ? 15 : 13} fill="#fff" />
        <ellipse cx={cx + 20} cy={eyeY} rx={11} ry={mood === 'wow' ? 15 : 13} fill="#fff" />
        <circle cx={cx - 18} cy={eyeY + 2} r={mood === 'wow' ? 5 : 7} fill={INK} />
        <circle cx={cx + 22} cy={eyeY + 2} r={mood === 'wow' ? 5 : 7} fill={INK} />
        <circle cx={cx - 16} cy={eyeY - 1} r={2.6} fill="#fff" />
        <circle cx={cx + 24} cy={eyeY - 1} r={2.6} fill="#fff" />
      </g>
      {(mood === 'sad' || mood === 'worried' || mood === 'cold') && (
        <g stroke={INK} strokeWidth={5} fill="none"><path d={`M${cx - 30} ${eyeY - 22} L${cx - 12} ${eyeY - 16}`} /><path d={`M${cx + 30} ${eyeY - 22} L${cx + 12} ${eyeY - 16}`} /></g>
      )}
      {blush && <><ellipse cx={cx - 34} cy={cy + 16} rx={10} ry={6} fill="#FF8F8F" opacity={0.6} /><ellipse cx={cx + 34} cy={cy + 16} rx={10} ry={6} fill="#FF8F8F" opacity={0.6} /></>}
      {mood === 'happy' && <path d={`M${cx - 14} ${cy + 18} Q${cx} ${cy + 32} ${cx + 14} ${cy + 18}`} stroke={INK} strokeWidth={5} fill="none" />}
      {mood === 'grin' && <path d={`M${cx - 18} ${cy + 14} Q${cx} ${cy + 40} ${cx + 18} ${cy + 14}Z`} fill={INK} stroke={INK} strokeWidth={3} />}
      {mood === 'sad' && <path d={`M${cx - 12} ${cy + 28} Q${cx} ${cy + 16} ${cx + 12} ${cy + 28}`} stroke={INK} strokeWidth={5} fill="none" />}
      {mood === 'worried' && <path d={`M${cx - 12} ${cy + 24} Q${cx - 6} ${cy + 18} ${cx} ${cy + 24} Q${cx + 6} ${cy + 30} ${cx + 12} ${cy + 24}`} stroke={INK} strokeWidth={5} fill="none" />}
      {mood === 'wow' && <ellipse cx={cx} cy={cy + 24} rx={9} ry={12} fill={INK} />}
      {mood === 'cold' && (
        <g>
          <rect x={cx - 16} y={cy + 16} width={32} height={14} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
          <path d={`M${cx - 8} ${cy + 16} L${cx - 8} ${cy + 30} M${cx} ${cy + 16} L${cx} ${cy + 30} M${cx + 8} ${cy + 16} L${cx + 8} ${cy + 30}`} stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
}

function Hair({ style, color }: { style: 0 | 1 | 2 | 3; color: string }) {
  const cap = <path d="M44 92 C40 40 80 26 100 28 C130 28 162 44 156 94 C150 70 132 56 100 56 C74 56 52 66 44 92Z" fill={color} />;
  if (style === 0) return <g>{cap}<path d="M70 40 Q100 22 128 38 Q110 34 96 46Z" fill={color} /></g>;
  if (style === 1) return <g><ellipse cx={164} cy={96} rx={18} ry={34} fill={color} transform="rotate(-18 164 96)" /><circle cx={154} cy={66} r={9} fill={HUE.pink.base} />{cap}</g>;
  if (style === 2) return (
    <g>
      {[[46, 1], [154, -1]].map(([x, d], i) => (
        <g key={i}>
          <rect x={x - 11} y={92} width={22} height={70} rx={11} fill={color} />
          <circle cx={x} cy={166} r={11} fill={HUE.red.base} /><circle cx={x + d * 10} cy={172} r={8} fill={HUE.red.base} />
        </g>
      ))}
      {cap}
      <path d="M100 30 L100 54" stroke={color} strokeWidth={4} />
    </g>
  );
  return <g><circle cx={100} cy={34} r={26} fill={color} /><circle cx={78} cy={44} r={20} fill={color} /><circle cx={122} cy={44} r={20} fill={color} />{cap}</g>;
}

/** A Techistan kid (or customer). Big eyes, detached-feeling limbs, school uniform by default. */
export function Kid({ size = 260, skin = 0, hair = 0, hairStyle = 0, shirt = HUE.sky, pants = '#3E6FA8', pose = 'idle', mood = 'happy', walking = false, blush = true, style, className, flip = false, delay = 0 }: KidProps) {
  const sk = SKIN[skin % SKIN.length];
  const hc = HAIR[hair % HAIR.length];
  const [a1, a2] = ARMS[pose];
  const [h1, h2] = HANDS[pose];
  const twoHandWave = pose === 'wave';
  return (
    <svg width={size * (200 / 300)} height={size} viewBox="0 0 200 300" className={className} style={{ overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {/* legs */}
      <g className={walking ? 'k-walk-a' : undefined} style={{ ['--delay' as string]: `${delay}s` }}>
        <rect x={72} y={222} width={22} height={64} rx={11} fill={pants} />
        <ellipse cx={80} cy={290} rx={20} ry={10} fill={INK} />
      </g>
      <g className={walking ? 'k-walk-b' : undefined}>
        <rect x={106} y={222} width={22} height={64} rx={11} fill={pants} />
        <ellipse cx={120} cy={290} rx={20} ry={10} fill={INK} />
      </g>
      {/* body */}
      <rect x={52} y={140} width={96} height={94} rx={40} fill={shirt.base} />
      <ellipse cx={74} cy={164} rx={14} ry={18} fill={shirt.hi} opacity={0.8} />
      <path d="M84 142 L100 162 L116 142Z" fill="#fff" />
      {/* arms */}
      {!twoHandWave && <path d={a1} stroke={shirt.base} strokeWidth={22} fill="none" />}
      {twoHandWave && <path d={a1} stroke={shirt.base} strokeWidth={22} fill="none" />}
      <circle cx={twoHandWave ? 44 : h1[0]} cy={twoHandWave ? 230 : h1[1]} r={13} fill={sk} />
      <g className={pose === 'wave' ? 'k-wiggle k-origin-bottom' : undefined} style={{ ['--wig' as string]: '14deg', ['--dur' as string]: '0.6s' }}>
        <path d={a2} stroke={shirt.base} strokeWidth={22} fill="none" />
        <circle cx={h2[0]} cy={h2[1]} r={13} fill={sk} />
      </g>
      {/* head */}
      <circle cx={46} cy={100} r={11} fill={sk} /><circle cx={154} cy={100} r={11} fill={sk} />
      <circle cx={100} cy={96} r={56} fill={sk} />
      <circle cx={112} cy={108} r={50} fill="#000" opacity={0.06} />
      <Hair style={hairStyle} color={hc} />
      <Face mood={mood} cx={100} cy={100} blush={blush} />
    </svg>
  );
}

export type MayorPose = 'wave' | 'announce' | 'trophy' | 'gasp' | 'cheer';
/** The Mayor of Techistan: round, cheerful, huge moustache, saffron pheta (turban) and a red sash. */
export function Mayor({ size = 420, pose = 'wave', mood = 'happy', style }: { size?: number; pose?: MayorPose; mood?: 'happy' | 'wow' | 'grin'; style?: CSSProperties }) {
  const sk = SKIN[0];
  const arms: Record<MayorPose, [string, string, [number, number], [number, number]]> = {
    wave: ['M50 220 Q20 270 40 310', 'M210 210 Q256 170 250 110', [40, 312], [250, 106]],
    announce: ['M50 220 Q20 270 40 310', 'M210 214 Q250 200 226 160', [40, 312], [222, 156]],
    trophy: ['M54 210 Q20 150 82 70', 'M206 210 Q240 150 178 70', [86, 66], [174, 66]],
    gasp: ['M54 214 Q10 220 86 130', 'M206 214 Q250 220 174 130', [90, 128], [170, 128]],
    cheer: ['M54 210 Q10 150 26 80', 'M206 210 Q250 150 234 80', [26, 76], [234, 76]],
  };
  const [a1, a2, h1, h2] = arms[pose];
  return (
    <svg width={size * (260 / 400)} height={size} viewBox="0 0 260 400" style={{ overflow: 'visible', ...style }}>
      {/* legs */}
      <rect x={88} y={318} width={30} height={66} rx={14} fill="#FFFFFF" /><rect x={142} y={318} width={30} height={66} rx={14} fill="#FFFFFF" />
      <ellipse cx={100} cy={388} rx={28} ry={12} fill={HUE.wood.edge} /><ellipse cx={160} cy={388} rx={28} ry={12} fill={HUE.wood.edge} />
      {/* body: cream kurta + green jacket */}
      <ellipse cx={130} cy={244} rx={104} ry={96} fill={HUE.cream.base} />
      <path d="M40 210 Q60 160 108 156 L118 340 Q60 330 36 280Z" fill={HUE.green.base} />
      <path d="M220 210 Q200 160 152 156 L142 340 Q200 330 224 280Z" fill={HUE.green.edge} />
      <ellipse cx={70} cy={210} rx={16} ry={26} fill={HUE.green.hi} opacity={0.7} />
      {[200, 236, 272].map(y => <circle key={y} cx={130} cy={y} r={6} fill={HUE.gold.base} />)}
      {/* sash */}
      <path d="M70 172 L92 160 L206 312 L184 326Z" fill={HUE.red.base} />
      <path d="M80 166 L92 160 L206 312 L196 318Z" fill={HUE.red.edge} />
      <g transform="translate(160 262)"><Ball cx={0} cy={0} r={20} hue={HUE.gold} /><path d="M-8 18 L-14 40 L0 32 L14 40 L8 18" fill={HUE.red.base} /></g>
      {/* arms */}
      <path d={a1} stroke={HUE.cream.base} strokeWidth={30} fill="none" />
      <path d={a2} stroke={HUE.cream.base} strokeWidth={30} fill="none" />
      <circle cx={h1[0]} cy={h1[1]} r={18} fill={sk} /><circle cx={h2[0]} cy={h2[1]} r={18} fill={sk} />
      {pose === 'announce' && <g transform="translate(222 150) rotate(-20)"><rect x={-7} y={0} width={14} height={40} rx={7} fill={INK} /><Ball cx={0} cy={-6} r={16} hue={HUE.steel} /></g>}
      {/* head */}
      <circle cx={130} cy={112} r={64} fill={sk} />
      <circle cx={146} cy={126} r={56} fill="#000" opacity={0.06} />
      <circle cx={66} cy={118} r={14} fill={sk} /><circle cx={194} cy={118} r={14} fill={sk} />
      {/* pheta turban */}
      <g>
        <g transform="translate(186 60)"><g className="k-sway k-origin-left" style={{ ['--sway-a' as string]: '-6deg', ['--sway-b' as string]: '10deg', ['--dur' as string]: '1.8s' }}>
          <path d="M0 0 Q40 10 56 60 Q30 44 4 26Z" fill={HUE.saffron.edge} />
        </g></g>
        <path d="M62 96 C56 40 96 18 130 18 C170 18 206 40 198 96 C170 80 92 80 62 96Z" fill={HUE.saffron.base} />
        <path d="M70 76 Q130 50 192 76" stroke={HUE.saffron.edge} strokeWidth={9} fill="none" />
        <path d="M74 56 Q130 30 186 56" stroke={HUE.red.base} strokeWidth={8} fill="none" />
        <ellipse cx={96} cy={42} rx={18} ry={10} fill={HUE.saffron.hi} transform="rotate(-20 96 42)" />
        <path d="M150 22 L164 4 L170 26" fill={HUE.red.base} />
      </g>
      {/* face */}
      <g className="k-eyes" style={{ ['--dur' as string]: '4.4s' }}>
        <ellipse cx={108} cy={108} rx={11} ry={mood === 'wow' ? 15 : 12} fill="#fff" /><ellipse cx={152} cy={108} rx={11} ry={mood === 'wow' ? 15 : 12} fill="#fff" />
        <circle cx={110} cy={110} r={6.5} fill={INK} /><circle cx={154} cy={110} r={6.5} fill={INK} />
        <circle cx={112} cy={107} r={2.4} fill="#fff" /><circle cx={156} cy={107} r={2.4} fill="#fff" />
      </g>
      <path d="M90 88 Q106 78 122 88" stroke={HAIR[0]} strokeWidth={8} fill="none" /><path d="M138 88 Q154 78 170 88" stroke={HAIR[0]} strokeWidth={8} fill="none" />
      <ellipse cx={130} cy={128} rx={12} ry={10} fill="#B97A50" />
      <ellipse cx={92} cy={134} rx={12} ry={7} fill="#FF8F8F" opacity={0.55} /><ellipse cx={168} cy={134} rx={12} ry={7} fill="#FF8F8F" opacity={0.55} />
      {mood === 'wow' ? <ellipse cx={130} cy={160} rx={10} ry={13} fill={INK} /> : <path d="M114 154 Q130 172 146 154Z" fill={INK} stroke={INK} strokeWidth={4} />}
      {/* the moustache */}
      <g className="k-sway" style={{ ['--sway-a' as string]: '-2deg', ['--sway-b' as string]: '2deg', ['--dur' as string]: '1.2s' }}>
        <path d="M130 136 C112 130 90 132 80 146 C70 160 56 150 58 136 C54 156 76 168 96 156 C110 150 122 148 130 146 C138 148 150 150 164 156 C184 168 206 156 202 136 C204 150 190 160 180 146 C170 132 148 130 130 136Z" fill={HAIR[1]} stroke={HAIR[1]} strokeWidth={6} />
      </g>
    </svg>
  );
}

/** Robot chaiwala: a happy teal robot with a Gandhi cap pouring chai from a kettle, steam curling up. */
export function RobotChaiwala({ size = 300, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size * (240 / 320)} height={size} viewBox="0 0 240 320" style={{ overflow: 'visible', ...style }}>
      {/* hover base */}
      <ellipse cx={110} cy={306} rx={58} ry={12} fill={INK} opacity={0.18} />
      <g className="k-bob" style={{ ['--bob' as string]: '-8px', ['--dur' as string]: '1.8s' }}>
        <rect x={70} y={250} width={80} height={36} rx={18} fill={HUE.steel.edge} />
        <rect x={84} y={282} width={52} height={12} rx={6} fill={HUE.orange.base} className="k-pulse" style={{ ['--dur' as string]: '0.4s', ['--pulse' as string]: '1.2' }} />
        {/* body */}
        <rect x={50} y={144} width={120} height={108} rx={36} fill={HUE.teal.base} />
        <rect x={64} y={156} width={22} height={70} rx={11} fill={HUE.teal.hi} opacity={0.8} />
        <rect x={88} y={182} width={46} height={30} rx={10} fill={HUE.cream.base} />
        <circle cx={100} cy={197} r={5} fill={HUE.red.base} /><circle cx={120} cy={197} r={5} fill={HUE.green.base} />
        {/* head */}
        <rect x={110 - 4} y={124} width={8} height={24} fill={HUE.steel.edge} />
        <rect x={44} y={40} width={132} height={88} rx={34} fill={HUE.steel.base} />
        <rect x={58} y={54} width={104} height={62} rx={24} fill="#3D5566" />
        <g className="k-eyes" style={{ ['--dur' as string]: '3.6s' }}><rect x={76} y={68} width={18} height={22} rx={9} fill="#7FE8CF" /><rect x={126} y={68} width={18} height={22} rx={9} fill="#7FE8CF" /></g>
        <path d="M92 98 Q110 110 128 98" stroke="#7FE8CF" strokeWidth={6} fill="none" />
        {/* Gandhi cap */}
        <path d="M58 46 L72 18 L164 18 L170 46Z" fill="#FFFFFF" /><path d="M72 18 L164 18 L150 30 L80 30Z" fill={HUE.cream.edge} />
        {/* arm with kettle (left) */}
        <path d="M54 176 Q14 160 30 120" stroke={HUE.teal.base} strokeWidth={18} fill="none" />
        <g transform="translate(26 106) rotate(-24)">
          <path d="M-30 -10 Q-34 -44 0 -46 Q34 -44 30 -10Z" fill={HUE.steel.base} />
          <rect x={-32} y={-14} width={64} height={30} rx={12} fill={HUE.steel.edge} />
          <path d="M30 -20 L64 -36" stroke={HUE.steel.edge} strokeWidth={10} />
          <circle cx={0} cy={-50} r={7} fill={HUE.steel.edge} />
        </g>
        {/* chai stream */}
        <path d="M82 72 Q96 100 140 136" stroke="#C98B5E" strokeWidth={6} fill="none" opacity={0.9} strokeDasharray="10 12" className="k-pulse" />
        {/* arm with cup (right) */}
        <path d="M166 176 Q196 170 172 150" stroke={HUE.teal.base} strokeWidth={18} fill="none" />
        <g transform="translate(150 140)">
          <path d="M-14 -8 L14 -8 L10 18 L-10 18Z" fill="#fff" />
          <rect x={-14} y={-12} width={28} height={8} rx={4} fill="#C98B5E" />
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(${-6 + i * 7} -18)`}>
              <path className="k-steam" d="M0 0 Q-8 -12 0 -22 Q8 -32 0 -44" stroke="#fff" strokeWidth={6} fill="none" style={{ ['--delay' as string]: `${i * 0.6}s` }} />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

const SHIRTS: Hue[] = [HUE.sky, HUE.coral, HUE.green, HUE.purple, HUE.orange, HUE.pink, HUE.teal, HUE.sun];
/** A row of kids, spread over `width`, bobbing out of phase. Use for crowds that react together. */
export function Crowd({ n = 7, width = 1600, size = 220, seed = 1, pose = 'idle', mood = 'happy', hop = false, style }: { n?: number; width?: number; size?: number; seed?: number; pose?: KidPose | ((i: number) => KidPose); mood?: KidMood | ((i: number) => KidMood); hop?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', width, height: size, ...style }}>
      {Array.from({ length: n }, (_, i) => {
        const k = i + seed * 3;
        const x = (width / n) * (i + 0.5) - size / 3;
        const s = size * (0.85 + ((k * 37) % 30) / 100);
        return (
          <div key={i} className={hop ? 'k-hop' : 'k-bob'} style={{ position: 'absolute', left: x, bottom: 0, ['--delay' as string]: `${-i * 0.37}s`, ['--dur' as string]: hop ? `${0.6 + (i % 3) * 0.08}s` : `${2.4 + (i % 3) * 0.3}s`, ['--bob' as string]: '-6px' } as CSSProperties}>
            <Kid size={s} skin={k % 5} hair={k % 4} hairStyle={((k * 7) % 4) as 0 | 1 | 2 | 3} shirt={SHIRTS[k % SHIRTS.length]}
              pose={typeof pose === 'function' ? pose(i) : pose} mood={typeof mood === 'function' ? mood(i) : mood} flip={i % 2 === 1} />
          </div>
        );
      })}
    </div>
  );
}
