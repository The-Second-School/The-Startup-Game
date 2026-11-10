// Dev showcase: every avatar shape at 40 / 100 / 300px, all moods, and a team-colour grid. Open /src/scenes/dev/avatars.html
import { createRoot } from 'react-dom/client';
import '../../ui/theme.css';
import { Avatar, SHAPES } from '../../ui/avatar';
import { TEAM_COLORS } from '../../game/content';

const q = new URLSearchParams(location.search);
const big = q.get('big');
const moods = ['happy', 'wow', 'sad', 'cool'] as const;

function App() {
  if (big) return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 10 }}>{SHAPES.filter((_, i) => [3, 12, 13, 14, 15, 17].includes(i)).map((s) => <Avatar key={s.name} seed={SHAPES.indexOf(s)} colorIndex={SHAPES.indexOf(s) % 6} size={300} />)}</div>;
  return (
    <div style={{ width: 1500, padding: 16 }}>
      {SHAPES.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <b style={{ width: 80 }}>{i} {s.name}</b>
          {TEAM_COLORS.map((_c, ci) => <Avatar key={ci} seed={i} colorIndex={ci} size={84} />)}
          {[0, 1, 2, 3, 4].map(sh => <Avatar key={sh} seed={i} colorIndex={1} shade={sh} size={40} />)}
          {moods.map(m => <Avatar key={m} seed={i} colorIndex={4} size={70} mood={m} />)}
        </div>
      ))}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
