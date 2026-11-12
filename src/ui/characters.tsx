// Bolt (the yellow robot guide) and Fibbot (the fibbing, copying, cheating purple robot villain). Flat layered SVG with white sticker borders.
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
// Fibbot: THE villain. One cheeky purple robot who fibs, copies and cheats. His Pinocchio nose grows every time he fibs.
// Same flat sticker style as Bolt: white border, darker edge layer, a little shine. Every Fibbot in the app is this component.
// ---------------------------------------------------------------------------
export type FibbotMood = 'laugh' | 'angry' | 'sneaky' | 'dizzy' | 'shock';
const P = { hi: '#A982E8', base: '#7B4BC9', shade: '#6A3CB6', edge: '#5A2F9E' };
const SCR = '#2A1550', EYE = '#FFE14D', MOUTH = '#12072B', NOSE = { base: '#FF9600', shade: '#E07F00', hi: '#FFC266' };
const CX = 140, NOSE_Y = 121, NOSE_LEN = 150;

/** Pinocchio nose pointing right, from (CX, NOSE_Y). Full length = NOSE_LEN, scaled by the caller. */
const NOSE_D = `M${CX} ${NOSE_Y - 9} L${CX + NOSE_LEN - 12} ${NOSE_Y - 5} A6 6 0 0 1 ${CX + NOSE_LEN - 12} ${NOSE_Y + 7} L${CX} ${NOSE_Y + 9} Z`;

function FibbotEyes({ mood }: { mood: FibbotMood }) {
  const L = 108, R = 172, Y = 94;
  if (mood === 'laugh') {
    return (
      <g stroke={EYE} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d={`M${L - 12} ${Y + 4} Q${L} ${Y - 16} ${L + 12} ${Y + 4}`} />
        <path d={`M${R - 12} ${Y + 4} Q${R} ${Y - 16} ${R + 12} ${Y + 4}`} />
      </g>
    );
  }
  if (mood === 'angry') {
    const red = '#FF6A4D';
    return (
      <g>
        <ellipse cx={L} cy={Y + 3} rx={11} ry={9} fill={red} /><ellipse cx={R} cy={Y + 3} rx={11} ry={9} fill={red} />
        <circle cx={L + 2} cy={Y + 5} r={4} fill={SCR} /><circle cx={R - 2} cy={Y + 5} r={4} fill={SCR} />
        <path d={`M${L - 17} ${Y - 14} L${L + 13} ${Y - 3}`} stroke={EYE} strokeWidth={7} strokeLinecap="round" />
        <path d={`M${R + 17} ${Y - 14} L${R - 13} ${Y - 3}`} stroke={EYE} strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'sneaky') {
    return (
      <g>
        {[L, R].map(x => (
          <g key={x}>
            <path d={`M${x - 13} ${Y - 2} A13 13 0 0 0 ${x + 13} ${Y - 2} Z`} fill={EYE} />
            <circle cx={x + 5} cy={Y + 2} r={4.5} fill={SCR} />
            <path d={`M${x - 15} ${Y - 3} H${x + 15}`} stroke={EYE} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  }
  if (mood === 'dizzy') {
    return (
      <g fill="none" stroke={EYE} strokeWidth={4.5} strokeLinecap="round">
        {[L, R].map(x => (
          <g key={x} className="ui-spin-slow" style={{ ['--dur' as string]: '1.1s' }}>
            <path d={`M${x} ${Y} m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 16 0 a11 11 0 1 1 -22 0`} />
          </g>
        ))}
      </g>
    );
  }
  // shock
  return (
    <g>
      <ellipse cx={L} cy={Y} rx={14} ry={17} fill={EYE} /><ellipse cx={R} cy={Y} rx={14} ry={17} fill={EYE} />
      <circle cx={L} cy={Y + 1} r={4} fill={SCR} /><circle cx={R} cy={Y + 1} r={4} fill={SCR} />
    </g>
  );
}

function FibbotMouth({ mood }: { mood: FibbotMood }) {
  if (mood === 'laugh') {
    return (
      <g>
        <path d="M102 138 Q140 184 178 138 Z" fill={MOUTH} />
        <ellipse cx={140} cy={160} rx={14} ry={7} fill="#FF6FB5" />
        <path d="M106 138 H174 Q172 148 164 150 H116 Q108 148 106 138Z" fill="#fff" />
      </g>
    );
  }
  if (mood === 'angry') {
    return (
      <g>
        <path d="M106 158 Q140 128 174 158 Z" fill={MOUTH} />
        <path d="M114 148 L122 156 L130 144 L140 156 L150 144 L158 156 L166 148 Q140 134 114 148Z" fill="#fff" />
      </g>
    );
  }
  if (mood === 'sneaky') {
    return (
      <g>
        <path d="M104 146 Q136 168 180 136" stroke={EYE} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M168 146 L174 156 L180 142Z" fill="#fff" />
      </g>
    );
  }
  if (mood === 'dizzy') {
    return (
      <g>
        <path d="M108 148 q8 -10 16 0 t16 0 t16 0 t16 0" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M146 150 Q146 168 158 168 Q170 168 170 152Z" fill="#FF6FB5" />
      </g>
    );
  }
  return <ellipse cx={140} cy={152} rx={12} ry={15} fill={MOUTH} stroke={EYE} strokeWidth={4} />;
}

/** Fibbot: a cheeky round-square purple robot with horn antennas, a copyright badge and a long fibbing nose. viewBox 0 0 300 300 (feet at the bottom, nose points right). */
export function Fibbot({ mood = 'laugh', size = 160, smoke = false }: { mood?: FibbotMood; size?: number; smoke?: boolean }) {
  const armA: Record<FibbotMood, [number, number]> = { laugh: [-30, 30], angry: [25, -25], sneaky: [10, -60], dizzy: [-55, 55], shock: [-150, 150] };
  const [la, ra] = armA[mood];
  const noseScale: Record<FibbotMood, number> = { laugh: 1, angry: 0.72, sneaky: 1, dizzy: 0.5, shock: 0.4 };
  const grows = mood === 'laugh' || mood === 'sneaky';
  const body = mood === 'laugh' ? 'ui-jump' : mood === 'angry' ? 'ui-shake' : mood === 'dizzy' ? 'ui-wiggle' : 'ui-bob';
  const bodyVars = { ['--dur' as string]: mood === 'laugh' ? '0.9s' : mood === 'angry' ? '0.45s' : mood === 'dizzy' ? '1.6s' : '2.6s', ['--amp' as string]: '5px', ['--rot' as string]: '4deg' };
  const noseStyle = grows
    ? { ['--dur' as string]: mood === 'laugh' ? '2.2s' : '3.2s', transformOrigin: `${CX}px ${NOSE_Y}px`, transformBox: 'view-box' as const }
    : { transform: `scale(${noseScale[mood]}, 1) rotate(${mood === 'angry' ? 4 : 0}deg)`, transformOrigin: `${CX}px ${NOSE_Y}px`, transformBox: 'view-box' as const };
  return (
    <svg className="ui-svg-art" width={size} height={size} viewBox="0 0 300 300" aria-hidden>
      <g className={body} style={bodyVars}>
        <Sticker w={6}>
          {/* feet */}
          <rect x={92} y={262} width={46} height={24} rx={12} fill={P.edge} />
          <rect x={142} y={262} width={46} height={24} rx={12} fill={P.edge} />
          {/* arms */}
          <g transform={`rotate(${-la} 86 208)`}>
            <rect x={76} y={202} width={18} height={44} rx={9} fill={P.shade} /><circle cx={85} cy={250} r={13} fill={P.hi} />
          </g>
          <g transform={`rotate(${-ra} 194 208)`}>
            <rect x={186} y={202} width={18} height={44} rx={9} fill={P.shade} /><circle cx={195} cy={250} r={13} fill={P.hi} />
          </g>
          {/* body */}
          <Shaded shape={rrect(88, 186, 104, 82, 30)} fill={P.base} shade={P.shade} off={[5, 5]}>
            <ellipse cx={108} cy={200} rx={14} ry={6} fill={P.hi} transform="rotate(-20 108 200)" />
          </Shaded>
          {/* horn antennas */}
          {[-1, 1].map(d => (
            <g key={d} className="ui-wiggle" style={{ ['--rot' as string]: `${5 * d}deg`, ['--dur' as string]: '2s', transformOrigin: `${CX + d * 46}px 60px`, transformBox: 'view-box' }}>
              <path d={`M${CX + d * 46} 62 Q${CX + d * 62} 30 ${CX + d * 84} 26`} stroke={P.edge} strokeWidth={9} fill="none" className="ln" style={{ ['--lw' as string]: '9px' }} />
              <circle cx={CX + d * 86} cy={24} r={12} fill="#FFC800" />
              <circle cx={CX + d * 82} cy={20} r={3.5} fill="#fff" className="in" />
            </g>
          ))}
          {/* head + ear discs */}
          <circle cx={46} cy={118} r={14} fill={P.edge} /><circle cx={234} cy={118} r={14} fill={P.edge} />
          <Shaded shape={rrect(48, 52, 184, 140, 48)} fill={P.base} shade={P.shade} off={[7, 7]}>
            <ellipse cx={82} cy={70} rx={24} ry={9} fill={P.hi} transform="rotate(-18 82 70)" />
          </Shaded>
        </Sticker>
        {/* copy badge */}
        <g>
          <rect x={112} y={208} width={56} height={44} rx={12} fill="#FFF6DE" />
          <text x={140} y={242} textAnchor="middle" fontSize={38} fontWeight={800} fill={P.edge} fontFamily="Baloo 2, sans-serif">©</text>
          <rect x={120} y={214} width={22} height={5} rx={2.5} fill="#FFC800" />
        </g>
        {/* face screen */}
        <rect x={70} y={70} width={140} height={100} rx={32} fill={SCR} />
        <rect x={80} y={76} width={60} height={9} rx={4.5} fill="#4B2C8A" opacity={0.7} />
        <ellipse cx={86} cy={140} rx={9} ry={6} fill="#FF86A8" opacity={0.75} /><ellipse cx={194} cy={140} rx={9} ry={6} fill="#FF86A8" opacity={0.75} />
        <FibbotEyes mood={mood} />
        <FibbotMouth mood={mood} />
        {/* the fibbing nose, drawn on top of the screen */}
        <g className={grows ? 'ui-nose' : undefined} style={noseStyle}>
          <Sticker w={5}>
            <Shaded shape={path(NOSE_D)} fill={NOSE.base} shade={NOSE.shade} off={[0, 4]}>
              <rect x={CX + 8} y={NOSE_Y - 8} width={NOSE_LEN - 40} height={4} rx={2} fill={NOSE.hi} />
            </Shaded>
            <circle cx={CX} cy={NOSE_Y} r={11} fill={NOSE.base} />
          </Sticker>
        </g>
        {/* mood extras */}
        {mood === 'laugh' && <g fill="#7CF3FF" opacity={0.95}><path d="M88 108 q-7 12 0 16 q7 -4 0 -16z" /><path d="M192 108 q-7 12 0 16 q7 -4 0 -16z" /></g>}
        {mood === 'shock' && <text x={226} y={52} fontSize={64} fontWeight={800} fill="#FF4B4B" stroke="#fff" strokeWidth={7} paintOrder="stroke" fontFamily="Baloo 2, sans-serif">!</text>}
        {mood === 'dizzy' && (
          <g className="ui-spin-slow" style={{ ['--dur' as string]: '2.4s', transformOrigin: `${CX}px 34px`, transformBox: 'view-box' }}>
            {[0, 120, 240].map(a => <path key={a} d="M0 -9 L3 -3 L9 -3 L4 1 L6 8 L0 4 L-6 8 L-4 1 L-9 -3 L-3 -3Z" fill="#FFC800" stroke="#fff" strokeWidth={3} strokeLinejoin="round" transform={`rotate(${a} ${CX} 34) translate(${CX} 12)`} />)}
          </g>
        )}
        {(mood === 'angry' || smoke) && [-1, 1].map((d, i) => (
          <g key={d} className="ui-puff" style={{ ['--d' as string]: `${i * 0.55}s` }}>
            <circle cx={CX + d * 86} cy={4} r={smoke ? 15 : 12} fill="#fff" stroke="#E2D2F5" strokeWidth={4} />
          </g>
        ))}
        {smoke && [-1, 1].map((d, i) => (
          <g key={`s${d}`} className="ui-puff" style={{ ['--d' as string]: `${0.3 + i * 0.55}s` }}>
            <circle cx={CX + d * 70} cy={10} r={12} fill="#fff" stroke="#E2D2F5" strokeWidth={4} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Simple motion wrapper so callers can make characters hop in. */
export const HopIn = motion.div;
