import { averageVote, success, teamById } from '../../game/engine';
import { useA } from '../ctx';
import { Btn, Card, Fold, Label, Pill, TeamDot } from '../kit';

export function PitchPanel() {
  const { state, send } = useA();
  const st = state.step;
  if (st.type !== 'pitch' || st.phase !== 'voting') return null;
  const pitcher = state.teams[st.index];
  if (!pitcher) return null;
  const voters = state.teams.filter(t => t.id !== pitcher.id);
  const given = state.votes[pitcher.id] ?? {};
  return (
    <>
      {voters.map(v => {
        const s = given[v.id];
        return (
          <Card key={v.id} className="voter">
            <div className="row"><TeamDot team={v} size={30} /><b className="grow">{v.name}</b>{s === undefined ? <Pill>Not yet</Pill> : <Pill tone="good">{s} stars</Pill>}</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <Btn key={n} size="lg" tone={s === n ? 'sun' : 'soft'} onClick={() => send({ type: 'VOTE', pitcherId: pitcher.id, voterId: v.id, stars: n })} style={{ flex: 1, padding: 0 }}>{n}</Btn>
              ))}
            </div>
          </Card>
        );
      })}
      <div className="hint center">1 is a quiet clap, 5 is a standing ovation.</div>
    </>
  );
}

export function AwardsPanel() {
  const { state } = useA();
  const st = state.step;
  if (st.type !== 'awards') return null;
  return (
    <Fold title="Peek at the winners" hint="Host only, do not show the kids">
      <div className="stack">
        {st.results.map((r, i) => {
          const t = teamById(state, r.teamId);
          const shown = i < st.reveal;
          return (
            <div key={r.id} className={`award ${shown ? 'award-shown' : ''}`}>
              <div className="row">
                <div className="grow">
                  <div className="label"><span>#{r.rank} {r.title}</span></div>
                  <div className="row">{t && <TeamDot team={t} size={24} />}<b>{t?.name ?? '?'}</b></div>
                </div>
                {shown ? <Pill tone="good">Shown</Pill> : i === st.reveal ? <Pill tone="sun">Next</Pill> : null}
              </div>
            </div>
          );
        })}
        <Label>Success scores</Label>
        {[...state.teams].sort((a, b) => success(b) - success(a)).map((t, i) => (
          <div key={t.id} className="logrow"><span className="row"><b className="rank">{i + 1}</b><TeamDot team={t} size={24} />{t.name}</span><b>{success(t)}</b></div>
        ))}
        {state.teams.length > 0 && <div className="hint">Best pitch average: {[...state.teams].map(t => `${t.name} ${averageVote(state, t.id).toFixed(1)}`).join(', ')}</div>}
      </div>
    </Fold>
  );
}
