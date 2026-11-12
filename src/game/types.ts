// Core game types. Shared by the big screen, the admin phone and every UI piece.

export type RoleId = 'ceo' | 'money' | 'lock' | 'speaker' | 'time';
export type Grade = 5 | 6 | 7 | 8 | 9 | 10;
export const GRADES: Grade[] = [5, 6, 7, 8, 9, 10];

export interface Player {
  id: string;
  name: string;
  grade: Grade;
}

export interface Member {
  playerId: string;
  name: string;
  grade: Grade;
  roles: RoleId[];      // usually one; teams of 3 merge CEO + Money
  shade: number;        // 0..4 shade index inside the team colour family (for member avatars)
}

export interface Deltas {
  coins: number;
  customers: number;
  happiness: number;
}

export interface HistoryEntry {
  stepId: string;       // e.g. 'a1q1', 'bugsmash', 'mood-1'
  act: number;          // 0 setup, 1..5 acts, 6 show day
  icon: string;         // emoji for the story strip
  label: string;        // short text, e.g. "Asked 10 people"
  story: string;        // full reveal line, already filled with team name
  deltas: Deltas;
  trap?: boolean;       // Fibbot's trick
}

export interface Team {
  id: string;
  name: string;         // custom, typed by host
  colorIndex: number;   // index into TEAM_COLORS
  avatarSeed: number;   // drives the procedural avatar (object, face, accessory)
  members: Member[];
  productId: string | null;
  customers: number;    // 0..50
  happiness: number;    // 0..50
  coins: number;        // >= 0
  history: HistoryEntry[];
}

// ---------- Script steps ----------

export type Step =
  | { kind: 'lobby'; id: string }
  | { kind: 'setup_players'; id: string }
  | { kind: 'setup_teams'; id: string }
  | { kind: 'setup_roles'; id: string }
  | { kind: 'setup_products'; id: string }
  | { kind: 'setup_names'; id: string }
  | { kind: 'scene'; id: string; sceneId: SceneId; act: number }
  | { kind: 'question'; id: string; qId: string; act: number }
  | { kind: 'price'; id: string; act: number }
  | { kind: 'bugsmash'; id: string; act: number }
  | { kind: 'auction'; id: string; act: number }
  | { kind: 'megaorder'; id: string; act: number }
  | { kind: 'mood'; id: string; act: number }
  | { kind: 'mic'; id: string; act: number }
  | { kind: 'board'; id: string; act: number; recap?: boolean }
  | { kind: 'progress'; id: string; act: number }
  | { kind: 'break'; id: string }
  | { kind: 'pitch'; id: string }
  | { kind: 'awards'; id: string }
  | { kind: 'end'; id: string };

export type SceneId = 'welcome' | 'howto' | 'act1' | 'act2' | 'act3' | 'act4' | 'act5' | 'showday' | 'finale';

// ---------- Per-step live state (reset when a step is entered) ----------

export type QuestionPhase = 'intro' | 'open' | 'revealed' | 'spotlight' | 'done';

export interface QuestionState {
  type: 'question';
  phase: QuestionPhase;
  selectedTeamId: string | null;            // team whose Lock Master is choosing now
  locks: Record<string, number>;            // teamId -> option index
  pending: Record<string, Deltas>;          // computed on reveal
  stories: Record<string, string>;          // computed on reveal
  spotlight: number;                        // index into team order
}

export interface PriceState {
  type: 'price';
  phase: QuestionPhase;
  selectedTeamId: string | null;
  locks: Record<string, number>;            // teamId -> price in rupees (10..100)
  pending: Record<string, Deltas>;
  stories: Record<string, string>;
  verdict: Record<string, 'right' | 'close' | 'high' | 'low'>;
  outcomes: Record<string, PriceOutcome>;   // computed on reveal
  spotlight: number;
}

/** What happened when a team's price met 10 interested customers. */
export interface PriceOutcome {
  price: number;
  cost: number;             // what one unit costs the team to make
  profitPerUnit: number;    // price - cost (negative = a loss on every sale)
  interested: number;       // people who looked at the product (always 10)
  buyers: number;           // how many of them bought
  totalProfit: number;      // buyers x profitPerUnit
  best: number;             // the price that would have earned the most
  bestProfit: number;
}

export interface BugState {
  type: 'bugsmash';
  phase: 'intro' | 'turn' | 'done';
  turn: number;                             // index into team order
  turnPhase: 'ready' | 'playing' | 'result';
  results: Record<string, number>;          // teamId -> bugs smashed
}

export interface AuctionTicket {
  id: string;
  title: string;
  icon: string;
  deltas: Deltas;                           // coins = 0; price paid separately
}

export interface AuctionState {
  type: 'auction';
  phase: 'intro' | 'bidding' | 'sold' | 'done';
  tickets: AuctionTicket[];
  ticket: number;
  bid: { by: string; amount: number };      // by = teamId or 'fibbot'
  bidLog: { by: string; amount: number }[];
  villainCap: number;                       // Fibbot's secret walk-away price for this ticket (set by the fairness algorithm)
  winners: Record<string, { by: string; amount: number }>; // ticketId -> winner
}

export interface MegaState {
  type: 'megaorder';
  phase: 'intro' | 'open' | 'revealed' | 'spotlight' | 'done';
  pairs: [string, string][];
  solo?: string;                            // odd team count: the team without a partner (gets a solo order)
  selectedTeamId: string | null;
  locks: Record<string, number>;
  outcomes: Record<string, { kind: 'equal' | 'split' | 'nodeal' | 'broken'; text: string }>; // key = pair index
  pending: Record<string, Deltas>;
  spotlight: number;                        // pair index
}

export interface MoodState {
  type: 'mood';
  phase: 'intro' | 'team' | 'done';
  index: number;
  pending: Record<string, MoodResult>;
}

/** Why customers left / joined / stayed. Numbers are totals over the acts the check looks at. */
export interface MoodResult {
  customers: number;                         // change in customers (negative = left)
  kind: 'left' | 'joined' | 'same';
  gained: number;                            // customers this team won over the acts checked (positive changes only)
  happy: number;                             // happiness this team earned over the same acts
  why: string;                               // one kid-friendly sentence saying WHY (numbers included)
  acts: number[];                            // acts the check looked at: [1, 2] or [1, 2, 3, 4, 5]
}

export interface MicState {
  type: 'mic';
  phase: 'spin' | 'picked' | 'done';
  teamId: string | null;
}

export interface PitchState {
  type: 'pitch';
  index: number;                            // team order index
  phase: 'ready' | 'talking' | 'voting' | 'done';
}

export interface AwardsState {
  type: 'awards';
  reveal: number;                           // how many awards revealed (0..5), shown 5 -> 1
  results: AwardResult[];                   // ordered 5 -> 1 (index 0 = award #5)
}

export interface AwardResult {
  rank: 1 | 2 | 3 | 4 | 5;
  id: 'banana' | 'pitch' | 'customer' | 'happiness' | 'champion';
  title: string;
  icon: string;
  teamId: string;
  why: string[];                            // short reason lines
}

export interface SceneState {
  type: 'scene';
  beat: number;                             // which narration beat is showing
}

export interface EmptyState { type: 'none' }

export type StepState =
  | QuestionState | PriceState | BugState | AuctionState | MegaState
  | MoodState | MicState | PitchState | AwardsState | SceneState | EmptyState;

export interface TimerState {
  running: boolean;
  endsAt: number | null;      // screen clock ms
  remaining: number;          // ms, used when paused and for admin display
  total: number;              // ms
}

export interface Settings {
  teamCount: 3 | 4 | 5 | 6;
  sound: boolean;
  voice: boolean;             // Bolt reads lines aloud (speechSynthesis)
}

export interface GameState {
  version: 1;
  stepIndex: number;
  step: StepState;
  players: Player[];
  teams: Team[];
  settings: Settings;
  timer: TimerState;
  progressView: boolean;      // host toggle: full-screen progress overlay on the big screen (also pauses the timer)
  progressPaused: boolean;
  frozen: boolean;            // host froze the whole screen at this exact moment (everything stops; the timer too)
  frozenPaused: boolean;      // freezing paused a running timer and will resume it    // the overlay paused a running timer and will resume it
  micPicked: string[];        // teamIds already picked for Mic Time
  votes: Record<string, Record<string, number>>; // pitcherTeamId -> voterTeamId -> stars 1..5
  updatedAt: number;
}

// ---------- Actions ----------

export type Action =
  | { type: 'NEXT' }
  | { type: 'JUMP'; stepIndex: number }
  | { type: 'RESET' }
  | { type: 'SET_SETTING'; key: keyof Settings; value: Settings[keyof Settings] }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'MAKE_TEAMS'; teams: Team[] }
  | { type: 'SET_ROLES'; teamId: string; playerId: string; roles: RoleId[] }
  | { type: 'SET_PRODUCT'; teamId: string; productId: string }
  | { type: 'SET_TEAM_NAME'; teamId: string; name: string }
  | { type: 'SELECT_TEAM'; teamId: string | null }
  | { type: 'LOCK'; teamId: string; choice: number }
  | { type: 'CLEAR_LOCK'; teamId: string }
  | { type: 'BUG_START' }
  | { type: 'BUG_RESULT'; teamId: string; bugs: number }
  | { type: 'BID'; by: string; amount: number }
  | { type: 'SOLD' }
  | { type: 'SET_PROGRESS_VIEW'; on: boolean }
  | { type: 'SET_FROZEN'; on: boolean }
  | { type: 'MIC_PICK'; teamId: string }
  | { type: 'PITCH_START' }
  | { type: 'VOTE'; pitcherId: string; voterId: string; stars: number }
  | { type: 'ADJUST'; teamId: string; field: 'coins' | 'customers' | 'happiness'; delta: number }
  | { type: 'TIMER_START'; ms: number; now: number }
  | { type: 'TIMER_PAUSE'; now: number }
  | { type: 'TIMER_RESUME'; now: number }
  | { type: 'TIMER_ADD'; ms: number }
  | { type: 'TIMER_STOP' };
