// Dev-only harness: /src/scenes/dev/scenes.html?scene=welcome[&teams=4][&beat=N]
// Without `beat` it plays the real <ActScene>. With `beat` it shows that beat of the scene art frozen in time (plus a mock bubble).
import '@fontsource/baloo-2/500.css';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import '../../ui/theme.css';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import type { SceneBodyProps } from '../types';
import { ActScene } from '../index';
import { makeTeams } from '../../game/helpers';
import { PRODUCTS, SCENES } from '../../game/content';
import type { Player, SceneId } from '../../game/types';

const q = new URLSearchParams(location.search);
const sceneId = (q.get('scene') ?? 'welcome') as SceneId;
const nTeams = Number(q.get('teams') ?? 4);
const names = ['Aarav', 'Diya', 'Kabir', 'Isha', 'Vihaan', 'Anaya', 'Arjun', 'Saanvi', 'Reyansh', 'Myra', 'Aditya', 'Kiara', 'Krish', 'Pari', 'Om', 'Riya', 'Yash', 'Tara', 'Neel', 'Zoya'];
const players: Player[] = names.map((n, i) => ({ id: `p${i}`, name: n, grade: ([5, 6, 7] as const)[i % 3] }));
const teamNames = ['Rocket Rasgulla', 'Chai Champs', 'Bolt Brigade', 'Mango Minds', 'Pixel Pandas', 'Turbo Tigers'];
const teams = makeTeams(players, nTeams).map((t, i) => ({ ...t, name: teamNames[i], colorIndex: i, avatarSeed: 1000 + i * 7919, productId: PRODUCTS[(i * 3) % PRODUCTS.length].id }));
const recap = teams.map((t, i) => ({ teamId: t.id, icon: ['🗣️', '📦', '🧦', '📢', '🏠', '🤝'][i], text: ['Asked 10 people', 'Idea box at school', 'Hid the notebook', 'Told everyone first', 'Guessed at home', 'Joined rAIvan'][i] }));

const beatParam = q.get('beat');
async function main() {
  const root = createRoot(document.getElementById('root')!);
  if (beatParam === null) {
    root.render(<ActScene sceneId={sceneId} teams={teams} recap={recap} onDone={() => { document.title = 'done'; }} />);
    return;
  }
  const mods = import.meta.glob<{ default: ComponentType<SceneBodyProps> }>('../acts/*.tsx');
  const Body = (await mods[`../acts/${sceneId}.tsx`]()).default;
  const beats = SCENES[sceneId].beats;
  root.render(
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#FFF4C7' }}>
      <Body beat={Number(beatParam)} beats={beats} teams={teams} recap={recap} />
      <div style={{ position: 'absolute', left: 260, top: 40, maxWidth: 1500, background: '#fff', borderRadius: 40, padding: '20px 36px', fontSize: 48, fontWeight: 700, opacity: 0.9 }}>{beats[Number(beatParam)]}</div>
    </div>,
  );
}
main();
