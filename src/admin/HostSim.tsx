// DEV ONLY. Stand-in for the big screen so the live sync can be tested before the real ScreenApp exists:
// /#/admin-hostsim?room=TEST  owns the game state with the real screen store and answers the phone.
import { useEffect } from 'react';
import { useScreen } from '../store/screenStore';

export default function HostSim() {
  const state = useScreen(s => s.state);
  const room = useScreen(s => s.room);
  useEffect(() => { useScreen.getState().connect(); }, []);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Host simulator · room {room}</h2>
      <div id="sim-step">step {state.stepIndex} · {state.players.length} players · {state.teams.length} teams</div>
    </div>
  );
}
