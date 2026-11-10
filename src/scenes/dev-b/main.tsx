// DEV ONLY harness for scenes artist B. ?intro=magnifier  |  ?act=act3&beat=2 (direct body)  |  ?act=act3 (full ActScene)
// extras: &teams=4|6  &guides=1 (shows the area covered by Bolt)
import { createRoot } from 'react-dom/client';
import '@fontsource/baloo-2/500.css';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import '../../ui/theme.css';
import type { ComponentType } from 'react';
import { ActScene, QuestionIntro } from '../index';
import { Bolt, SpeechBubble, RecipeBar } from '../../ui';
import type { SceneBodyProps } from '../types';
import { makeTeams } from '../../game/helpers';
import { PRODUCTS, SCENES, QUESTIONS } from '../../game/content';
import type { Player, SceneId } from '../../game/types';

const q = new URLSearchParams(location.search);
const n = Number(q.get('teams') ?? 6);
const players: Player[] = Array.from({ length: n * 3 }, (_, i) => ({ id: `p${i}`, name: `Kid ${i + 1}`, grade: (5 + (i % 3)) as 5 | 6 | 7 }));
const teams = makeTeams(players, n).map((t, i) => ({
  ...t, name: ['Mango Bros', 'Rocket Kids', 'Cupcake Crew', 'Bulb Squad', 'Donut Inc', 'Cloud Nine'][i],
  productId: PRODUCTS[i].id, customers: [30, 8, 18, 42, 12, 25][i], happiness: [28, 10, 20, 38, 9, 30][i], coins: [250, 120, 180, 400, 60, 220][i],
}));
const recap = teams.map(t => ({ teamId: t.id, icon: '💡', text: 'Asked 10 people' }));
const bodies = import.meta.glob<{ default: ComponentType<SceneBodyProps> }>('../acts/*.tsx', { eager: true });

/** Mirrors the real overlay: header strip + Bolt + bubble. */
function Chrome({ text, act }: { text: string; act: number }) {
  return <>
    <div className="ui-header"><div className="ui-header-bg" /><div className="ui-header-in"><RecipeBar act={act} /></div></div>
    <div style={{ position: 'absolute', left: 40, right: 40, top: 122, zIndex: 20, display: 'flex', alignItems: 'flex-start', gap: 28, pointerEvents: 'none' }}>
      <Bolt pose="talk" size={180} talking />
      <div style={{ maxWidth: 1500 }}><SpeechBubble text={text} side="left" size="lg" /></div>
    </div></>;
}

function App() {
  const intro = q.get('intro'), act = q.get('act'), beat = q.get('beat');
  let body = null;
  if (intro) {
    const entry = Object.values(QUESTIONS).find(x => x.introAnim === intro);
    body = <><QuestionIntro anim={intro} text={entry?.boltIntro ?? 'Hello!'} /><div className="ui-header"><div className="ui-header-bg" /><div className="ui-header-in"><RecipeBar act={1} /></div></div></>;
  } else if (act && beat !== null) {
    const B = bodies[`../acts/${act}.tsx`]?.default;
    const bt = SCENES[act as SceneId].beats[Number(beat)] ?? '';
    body = B ? <div style={{ position: 'absolute', inset: 0 }}><div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}><B beat={Number(beat)} beats={SCENES[act as SceneId].beats} teams={teams} recap={recap} /></div>
      <Chrome text={bt.replace(' (story so far)', '')} act={Number(q.get('actn') ?? 1)} />
      {q.get('guides') && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 260, background: 'rgba(255,0,0,.12)', borderBottom: '3px dashed red' }} />}</div> : <div>missing {act}</div>;
  } else if (act) {
    body = <ActScene sceneId={act as SceneId} teams={teams} recap={recap} />;
  }
  return <div style={{ position: 'absolute', inset: 0 }}>{body}</div>;
}
createRoot(document.getElementById('root')!).render(<App />);
