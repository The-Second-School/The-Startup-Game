// Intro (Act 3, auction): an advert billboard shows the prize ticket; bidders raise their paddles one after another;
// the gavel comes down and the ticket is SOLD.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Person } from '../artb/core';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 900, 2500, 4000, 5400, 6800];
const BOARD = { x: 960, y: 520 };
const BIDDERS = { x: 960, y: 640, w: 1400, h: 460 };
// bidder centres inside the bidders box, and the paddle number each one holds up
const BIDDER_AT = [
  { x: 150, n: '20', c: C.blue, e: C.blueEdge, seed: 3 },
  { x: 500, n: '30', c: C.pink, e: C.pinkEdge, seed: 7 },
  { x: 900, n: '40', c: C.good, e: C.goodEdge, seed: 10 },
  { x: 1250, n: '50', c: C.orange, e: C.orangeEdge, seed: 5 },
];

function Paddle({ n, c }: { n: string; c: string }) {
  return (
    <Svg vw={160} vh={300} w={130}>
      <rect x={64} y={110} width={32} height={180} rx={14} fill="#fff" stroke="#fff" strokeWidth={10} /><rect x={64} y={110} width={32} height={180} rx={14} fill={C.wood} />
      <circle cx={80} cy={80} r={68} fill="#fff" stroke="#fff" strokeWidth={10} /><circle cx={80} cy={80} r={68} fill={c} />
      <text x={80} y={104} textAnchor="middle" fontFamily="'Baloo 2', system-ui" fontWeight={800} fontSize={64} fill="#fff">{n}</text>
    </Svg>
  );
}

/** The bidders with their paddles. Paddles go up one after another (delay per bidder). */
function Bidders({ raised }: { raised: boolean }) {
  return (
    <div style={{ position: 'relative', width: BIDDERS.w, height: BIDDERS.h }}>
      {BIDDER_AT.map((b, i) => (
        <div key={b.n}>
          <div style={{ position: 'absolute', left: b.x - 100, top: BIDDERS.h - 330 }}>
            <Person seed={b.seed} mood="happy" arms="down" size={200} />
          </div>
          <motion.div style={{ position: 'absolute', left: b.x - 65, top: 0 }}
            initial={{ y: 260, opacity: 0 }} animate={{ y: raised ? 0 : 260, opacity: raised ? 1 : 0 }}
            transition={{ duration: 0.5, delay: raised ? 0.3 + i * 0.45 : 0, ease: 'easeOut' }}>
            <Paddle n={b.n} c={b.c} />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/** The advert: a board on two posts with the prize ticket on it. */
function Billboard() {
  return (
    <div style={{ position: 'relative', width: 640, height: 380 }}>
      <div style={{ position: 'absolute', left: 130, top: 330, width: 26, height: 50, background: C.woodEdge, borderRadius: 10 }} />
      <div style={{ position: 'absolute', right: 130, top: 330, width: 26, height: 50, background: C.woodEdge, borderRadius: 10 }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 640, height: 330, borderRadius: 40, background: C.blue, border: '10px solid #fff', boxShadow: 'var(--sh-sm)' }}>
        <div style={{ position: 'absolute', left: 30, top: 24, width: 200, height: 16, borderRadius: 8, background: C.blueHi }} />
        <div style={{ position: 'absolute', left: 150, top: 60, width: 340, height: 170, borderRadius: 26, background: C.sun, border: '8px solid #fff', display: 'grid', placeItems: 'center' }}>
          <div style={{ fontSize: 120, lineHeight: 1 }}>🎟️</div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 52, color: '#fff' }}>Who bids more?</div>
      </div>
    </div>
  );
}

export default function AuctionIntro() {
  const beat = useBeat(TIMES);
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 150, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {beat >= 2 && <Abs x={BOARD.x - 320} y={BOARD.y - 190}><Billboard /></Abs>}
          {beat >= 3 && <Abs x={BIDDERS.x - BIDDERS.w / 2} y={BIDDERS.y - BIDDERS.h / 2}><Bidders raised /></Abs>}
        </Backdrop>
        {beat === 1 && (
          <Subject at={BOARD} scale={1.12}>
            <motion.div initial={{ y: -360, rotate: -6 }} animate={{ y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}>
              <Billboard />
            </motion.div>
          </Subject>
        )}
        {beat === 2 && (
          <Subject at={{ x: BIDDERS.x, y: BIDDERS.y }} scale={1.08}>
            <Bidders raised />
          </Subject>
        )}
        {beat === 3 && (
          <Subject at={{ x: 1420, y: 600 }} scale={1.12}>
            <motion.div style={{ transformOrigin: '12% 90%' }} initial={{ rotate: -70 }} animate={{ rotate: [-70, 0] }} transition={{ duration: 0.5, ease: 'easeIn' }}>
              <Svg vw={300} vh={260} w={380}>
                <path d="M20 240 L180 100" stroke="#fff" strokeWidth={44} /><path d="M22 238 L178 101" stroke={C.wood} strokeWidth={24} />
                <rect x={130} y={20} width={150} height={96} rx={26} fill="#fff" stroke="#fff" strokeWidth={14} transform="rotate(40 205 68)" />
                <rect x={130} y={20} width={150} height={96} rx={26} fill={C.wood} transform="rotate(40 205 68)" />
              </Svg>
              <div style={{ width: 340, height: 80, marginLeft: -40, borderRadius: 30, background: C.wood, border: '6px solid #fff' }} />
            </motion.div>
          </Subject>
        )}
        {beat >= 4 && (
          <Subject at={{ x: 1420, y: 600 }} scale={1.12}>
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 11 }}>
              <div style={{ position: 'relative', width: 340, height: 340 }}>
                <svg width={340} height={340} viewBox="-10 -10 120 120" style={{ position: 'absolute', left: 0, top: 0 }}>
                  <path d="M50 0 L61 33 L96 33 L68 53 L79 88 L50 68 L21 88 L32 53 L4 33 L39 33Z" fill="#fff" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
                  <path d="M50 0 L61 33 L96 33 L68 53 L79 88 L50 68 L21 88 L32 53 L4 33 L39 33Z" fill={C.bad} strokeLinejoin="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 60, color: '#fff' }}>SOLD!</div>
              </div>
            </motion.div>
          </Subject>
        )}
      </Focus>
      {beat === 4 && <Splash key="sold" x={1420} y={600} n={12} r={230} />}
    </Root>
  );
}
