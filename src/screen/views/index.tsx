import { currentStep } from '../../game/engine';
import { SCRIPT } from '../../game/content';
import type { GameState } from '../../game/types';
import { LobbyView } from './LobbyView';
import { PlayersView } from './PlayersView';
import { TeamsView } from './TeamsView';
import { RolesView } from './RolesView';
import { ProductsView } from './ProductsView';
import { NamesView } from './NamesView';
import { SceneView } from './SceneView';
import { QuestionView } from './QuestionView';
import { PriceView } from './PriceView';
import { MegaView } from './MegaView';
import { BugSmashView } from './BugSmashView';
import { AuctionView } from './AuctionView';
import { MoodView } from './MoodView';
import { MicView } from './MicView';
import { BoardView } from './BoardView';
import { BreakView } from './BreakView';
import { PitchView } from './PitchView';
import { AwardsView } from './AwardsView';
import { EndView } from './EndView';

export function ViewFor({ state }: { state: GameState }) {
  const step = SCRIPT[state.stepIndex] ?? currentStep(state);
  if (!step) return <LobbyView />;
  switch (step.kind) {
    case 'lobby': return <LobbyView />;
    case 'setup_players': return <PlayersView />;
    case 'setup_teams': return <TeamsView />;
    case 'setup_roles': return <RolesView />;
    case 'setup_products': return <ProductsView />;
    case 'setup_names': return <NamesView />;
    case 'scene': return <SceneView sceneId={step.sceneId} />;
    case 'question': return state.step.type === 'question' ? <QuestionView qId={step.qId} /> : null;
    case 'price': return state.step.type === 'price' ? <PriceView /> : null;
    case 'megaorder': return state.step.type === 'megaorder' ? <MegaView /> : null;
    case 'bugsmash': return state.step.type === 'bugsmash' ? <BugSmashView /> : null;
    case 'auction': return state.step.type === 'auction' ? <AuctionView /> : null;
    case 'mood': return state.step.type === 'mood' ? <MoodView /> : null;
    case 'mic': return state.step.type === 'mic' ? <MicView /> : null;
    case 'board': return <BoardView act={step.act} />;
    case 'break': return <BreakView />;
    case 'pitch': return state.step.type === 'pitch' ? <PitchView /> : null;
    case 'awards': return state.step.type === 'awards' ? <AwardsView /> : null;
    case 'end': return <EndView />;
  }
}
