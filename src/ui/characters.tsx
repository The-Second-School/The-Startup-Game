// Bolt (the yellow robot guide) and rAIvan (the silly 10-headed AI villain). Flat layered SVG with white sticker borders.
import { motion } from 'motion/react';
import { Sticker, Shaded, rrect, path } from './svg';

type BoltPose = 'idle' | 'wave' | 'talk' | 'think' | 'cheer' | 'sad' | 'point' | 'shock';

const Y = { hi: '#FFE277', base: '#FFC800', shade: '#F2B200', edge: '#E0A100' };
const SCREEN = '#2E3A59', SCREEN_HI = '#3E4D72', GLOW = '#7CF3FF';

/** Bolt: TV-head robot. viewBox 0 0 200 240, feet on the bottom. */
export function Bolt({ pose = 'idle', size = 160, talking }: { pose?: BoltPose; size?: number; talking?: boolean }) {
  const sad = pose === 'sad', shock = pose === 'shock', cheer = pose === 'cheer', think = pose === 'think';
  const mouthOpen = talking || pose === 'talk' || shock || cheer;
  // arm angles (deg) around the shoulder: left arm, right arm
  const arms: Record<BoltPose, [number, number]> = {
    idle: [10, -10], talk: [20, -30], wave: [10, -150], think: [10, -125], cheer: [150, -150], sad: [-5, 5], point: [10, -95], shock: [120, -120],
  };
  const [la, ra] = arms[pose];
  const bodyCls = cheer ? 'ui-jump' : 'ui-bob';
  return (
    <svg className="ui-svg-art" width={size} height={size * 1.2} viewBox="0 0 200 240" aria-hidden>
      <g className={bodyCls} style={{ ['--amp' as string]: '6px', ['--dur' as string]: cheer ? '0.9s' : '2.8s' }}>
        <Sticker w={6}>
          {/* feet */}
          <rect x={58} y={206} width={34} height={22} rx={11} fill={Y.edge} />
          <rect x={108} y={206} width={34} height={22} rx={11} fill={Y.edge} />
          {/* arms */}
          <g transform={`rotate(${-la} 48 150)`}>
            <g className={pose === 'wave' ? 'ui-wiggle' : undefined} style={{ ['--rot' as string]: '14deg', ['--dur' as string]: '0.6s', transformOrigin: '48px 150px', transformBox: 'view-box' }}>
              <rect x={40} y={146} width={16} height={46} rx={8} fill="#B8C3D6" />
              <circle cx={48} cy={196} r={13} fill={Y.base} />
            </g>
          </g>
          <g transform={`rotate(${-ra} 152 150)`}>
            <g className={pose === 'wave' ? 'ui-wiggle' : undefined} style={{ ['--rot' as string]: '18deg', ['--dur' as string]: '0.5s', transformOrigin: '152px 150px', transformBox: 'view-box' }}>
              <rect x={144} y={146} width={16} height={46} rx={8} fill="#B8C3D6" />
              <circle cx={152} cy={196} r={13} fill={Y.base} />
              {pose === 'point' && <circle cx={152} cy={208} r={6} fill={Y.edge} />}
            </g>
          </g>
          {/* body */}
          <Shaded shape={rrect(56, 132, 88, 82, 30)} fill={Y.base} shade={Y.shade} off={[6, 6]}>
            <ellipse cx={76} cy={148} rx={14} ry={7} fill={Y.hi} transform="rotate(-20 76 148)" />
          </Shaded>
          <g className="in">
            <rect x={80} y={160} width={40} height={28} rx={10} fill={Y.edge} />
            <circle cx={92} cy={174} r={6} fill="#FF4B4B" />
            <circle cx={108} cy={174} r={6} fill="#58CC02" className="ui-blinklight" />
          </g>
          {/* antenna */}
          <g className={shock ? 'ui-shake' : 'ui-wiggle'} style={{ ['--rot' as string]: '8deg', ['--dur' as string]: '1.6s', transformOrigin: '100px 30px', transformBox: 'view-box' }}>
            <rect x={96} y={8} width={8} height={26} rx={4} fill="#B8C3D6" />
            <circle cx={100} cy={10} r={11} fill={shock ? '#FF4B4B' : '#FF9600'} />
            <circle cx={96} cy={6} r={3.5} fill="#fff" className="in" />
          </g>
          {/* head */}
          <Shaded shape={rrect(26, 30, 148, 110, 40)} fill={Y.base} shade={Y.shade} off={[7, 7]}>
            <ellipse cx={58} cy={46} rx={22} ry={9} fill={Y.hi} transform="rotate(-18 58 46)" />
          </Shaded>
          {/* ear bolts */}
          <circle cx={24} cy={86} r={12} fill={Y.edge} />
          <circle cx={176} cy={86} r={12} fill={Y.edge} />
        </Sticker>
        {/* screen face */}
        <rect x={44} y={46} width={112} height={78} rx={26} fill={SCREEN} />
        <rect x={50} y={50} width={60} height={14} rx={7} fill={SCREEN_HI} />
        <g className="ui-blink" style={{ ['--dur' as string]: '4.2s', transformOrigin: '100px 82px', transformBox: 'view-box' }}>
          {sad ? (
            <>
              <path d="M66 86 Q76 76 86 86" stroke={GLOW} strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d="M114 86 Q124 76 134 86" stroke={GLOW} strokeWidth={7} fill="none" strokeLinecap="round" />
            </>
          ) : cheer ? (
            <>
              <path d="M64 88 Q76 70 88 88" stroke={GLOW} strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d="M112 88 Q124 70 136 88" stroke={GLOW} strokeWidth={8} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={76} cy={82} rx={shock ? 13 : 11} ry={shock ? 15 : 13} fill={GLOW} />
              <ellipse cx={124} cy={82} rx={shock ? 13 : 11} ry={shock ? 15 : 13} fill={GLOW} />
              <circle cx={think ? 80 : 79} cy={think ? 76 : 78} r={4} fill="#fff" />
              <circle cx={think ? 128 : 127} cy={think ? 76 : 78} r={4} fill="#fff" />
            </>
          )}
        </g>
        {/* cheeks */}
        <ellipse cx={62} cy={104} rx={8} ry={5} fill="#FF86A8" opacity={0.85} />
        <ellipse cx={138} cy={104} rx={8} ry={5} fill="#FF86A8" opacity={0.85} />
        {/* mouth */}
        {mouthOpen ? (
          <g className={talking || pose === 'talk' ? 'ui-talk' : undefined}>
            <path d={shock ? 'M90 104 Q100 122 110 104 Q100 98 90 104Z' : 'M86 102 Q100 120 114 102 Z'} fill={GLOW} />
          </g>
        ) : sad ? (
          <path d="M88 112 Q100 102 112 112" stroke={GLOW} strokeWidth={6} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M86 104 Q100 116 114 104" stroke={GLOW} strokeWidth={6} fill="none" strokeLinecap="round" />
        )}
        {think && (
          <g className="ui-float">
            <circle cx={182} cy={30} r={6} fill="#fff" />
            <circle cx={192} cy={12} r={9} fill="#fff" />
          </g>
        )}
        {sad && <ellipse cx={136} cy={100} rx={5} ry={8} fill={GLOW} opacity={0.9} className="ui-bob" />}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
type RMood = 'laugh' | 'angry' | 'sneaky' | 'dizzy' | 'shock';
const P = { hi: '#A982E8', base: '#7B4BC9', shade: '#6A3CB6', edge: '#5A2F9E' };
const SMALL_FACES = ['grin', 'wink', 'tongue', 'smirk', 'o', 'grin', 'smirk', 'wink', 'tongue'] as const;

function Face({ cx, cy, s, kind, mood }: { cx: number; cy: number; s: number; kind: string; mood: RMood }) {
  const eye = (x: number, wink = false) => {
    if (mood === 'dizzy') return <path d={`M${x - 5 * s} ${cy - 4 * s} q${5 * s} ${-6 * s} ${8 * s} 0 q${-2 * s} ${6 * s} ${-6 * s} ${3 * s}`} stroke="#FFE14D" strokeWidth={2.4 * s} fill="none" strokeLinecap="round" />;
    if (wink) return <path d={`M${x - 5 * s} ${cy - 3 * s} q${5 * s} ${-4 * s} ${10 * s} 0`} stroke="#FFE14D" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
    const dx = mood === 'sneaky' ? 2.5 * s : 0;
    return (
      <g>
        <ellipse cx={x} cy={cy - 3 * s} rx={4.8 * s} ry={mood === 'shock' ? 6.5 * s : 5.5 * s} fill="#FFE14D" />
        <circle cx={x + dx} cy={cy - 3 * s} r={2.2 * s} fill="#2A1550" />
        {mood === 'angry' && <path d={`M${x - 6 * s} ${cy - 11 * s} L${x + 6 * s} ${cy - 7 * s}`} stroke="#2A1550" strokeWidth={2.6 * s} strokeLinecap="round" transform={x < cx ? '' : `scale(-1 1) translate(${-2 * x} 0)`} />}
      </g>
    );
  };
  const mouth = () => {
    if (mood === 'shock') return <ellipse cx={cx} cy={cy + 8 * s} rx={4 * s} ry={5 * s} fill="#2A1550" />;
    if (mood === 'angry') return <path d={`M${cx - 7 * s} ${cy + 10 * s} q${7 * s} ${-6 * s} ${14 * s} 0`} stroke="#2A1550" strokeWidth={2.8 * s} fill="none" strokeLinecap="round" />;
    if (kind === 'o') return <circle cx={cx} cy={cy + 8 * s} r={3.4 * s} fill="#2A1550" />;
    if (kind === 'smirk' || mood === 'sneaky') return <path d={`M${cx - 6 * s} ${cy + 8 * s} q${8 * s} ${5 * s} ${12 * s} ${-3 * s}`} stroke="#2A1550" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
    return (
      <g>
        <path d={`M${cx - 8 * s} ${cy + 5 * s} Q${cx} ${cy + 17 * s} ${cx + 8 * s} ${cy + 5 * s} Z`} fill="#2A1550" />
        {kind === 'tongue' && <ellipse cx={cx + 2 * s} cy={cy + 11 * s} rx={3.4 * s} ry={2.6 * s} fill="#FF6FB5" />}
        <path d={`M${cx - 6 * s} ${cy + 6 * s} H${cx + 6 * s}`} stroke="#fff" strokeWidth={2 * s} strokeLinecap="round" />
      </g>
    );
  };
  return <g>{eye(cx - 7 * s, kind === 'wink')}{eye(cx + 7 * s)}{mouth()}</g>;
}

/** rAIvan: a big middle screen-head plus 9 small screen-heads in a fan = 10 heads. viewBox 0 0 300 300. */
export function Raivan({ mood = 'laugh', size = 160 }: { mood?: RMood; size?: number }) {
  const heads = Array.from({ length: 9 }, (_, i) => {
    const a = (-160 + (i / 8) * 140) * (Math.PI / 180);
    const ring = i % 2 === 0 ? 112 : 96;
    return { x: 150 + Math.cos(a) * ring * 1.15, y: 150 + Math.sin(a) * ring * 0.95 + 30, i };
  });
  const wob = mood === 'dizzy' ? 'ui-wiggle' : mood === 'laugh' ? 'ui-bob' : mood === 'angry' ? 'ui-shake' : 'ui-float';
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="0 0 300 300" aria-hidden>
      <g className={mood === 'laugh' ? 'ui-jump' : undefined} style={{ ['--dur' as string]: '0.8s', ['--amp' as string]: '5px' }}>
        <Sticker w={6}>
          {/* cape body */}
          <Shaded shape={path('M80 296 Q86 210 150 196 Q214 210 220 296 Z')} fill={P.base} shade={P.shade} off={[6, 4]} />
          <path d="M126 204 L150 236 L174 204 Z" fill="#FFC800" className="in" />
          {/* necks */}
          {heads.map(h => <path key={`n${h.i}`} d={`M150 200 Q${(150 + h.x) / 2} ${(200 + h.y) / 2 + 20} ${h.x} ${h.y + 14}`} stroke={P.edge} strokeWidth={10} fill="none" className="ln" style={{ ['--lw' as string]: '10px' }} />)}
          {heads.map(h => (
            <g key={`h${h.i}`} className={wob} style={{ ['--d' as string]: `${-h.i * 0.27}s`, ['--rot' as string]: '10deg', ['--dur' as string]: mood === 'angry' ? '0.4s' : '2.4s', ['--amp' as string]: '5px' }}>
              <Shaded shape={rrect(h.x - 24, h.y - 20, 48, 40, 14)} fill={h.i % 2 ? P.hi : P.base} shade={P.edge} off={[3, 3]} />
            </g>
          ))}
          {/* crown spikes on the big head */}
          <path d="M104 92 L116 60 L132 84 L150 50 L168 84 L184 60 L196 92 Z" fill="#FFC800" />
          {/* big head */}
          <Shaded shape={rrect(96, 86, 108, 96, 34)} fill={P.base} shade={P.shade} off={[6, 6]}>
            <ellipse cx={120} cy={100} rx={16} ry={7} fill={P.hi} transform="rotate(-18 120 100)" />
          </Shaded>
        </Sticker>
        {/* small screens + faces */}
        {heads.map(h => (
          <g key={`f${h.i}`} className={wob} style={{ ['--d' as string]: `${-h.i * 0.27}s`, ['--rot' as string]: '10deg', ['--dur' as string]: mood === 'angry' ? '0.4s' : '2.4s', ['--amp' as string]: '5px' }}>
            <rect x={h.x - 18} y={h.y - 14} width={36} height={28} rx={9} fill="#2A1550" />
            <Face cx={h.x} cy={h.y - 2} s={0.82} kind={SMALL_FACES[h.i]} mood={mood} />
          </g>
        ))}
        <rect x={110} y={102} width={80} height={64} rx={20} fill="#2A1550" />
        <Face cx={150} cy={128} s={2.3} kind="grin" mood={mood} />
        {mood === 'angry' && [120, 180].map((x, i) => (
          <g key={x} className="ui-steam" style={{ ['--d' as string]: `${i * 0.5}s` }}>
            <circle cx={x} cy={70} r={12} fill="#fff" opacity={0.9} />
          </g>
        ))}
        {mood === 'shock' && <text x={226} y={70} fontSize={56} fontWeight={800} fill="#FF4B4B" stroke="#fff" strokeWidth={6} paintOrder="stroke">!</text>}
      </g>
    </svg>
  );
}

/** Simple motion wrapper so callers can make characters hop in. */
export const HopIn = motion.div;
