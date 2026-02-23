export type MeterType = 'awe' | 'cohesion' | 'legitimacy' | 'resources' | 'purity';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    text: string;
    outcome: string;
    effects: Partial<Record<MeterType | 'congregationSize' | 'resources', number>>;
  }[];
}

export interface LearningPrompt {
  id: string;
  text: string;
  title?: string;
  trigger: string;
}

export interface ArchiveEntry {
  id: string;
  title: string;
  description: string;
  theory: string;
  concept: string;
}

export interface Disciple {
  id: string;
  name: string;
  role: 'novice' | 'acolyte' | 'elder';
  loyalty: number;
  specialty: 'resources' | 'purity' | 'awe';
  history: string[]; 
  doctrine: Record<string, string>; 
}

export type StageType = 'movement' | 'cult' | 'sect' | 'denomination' | 'megachurch';
export type ArchetypeType = 'mystic' | 'scholar' | 'administrator' | 'charismatic';

export interface GameState {
  meters: Record<MeterType, number>;
  stage: StageType;
  archetype: ArchetypeType;
  resources: number;
  unlockedFeatures: string[];
  congregationSize: number;
  disciples: Disciple[];
  lastRitualTime: number;
  lastRitualId: string | null;
  ritualRepetitionCount: number;
  activeEvent: GameEvent | null;
  activePrompt: LearningPrompt | null;
  seenPrompts: string[];
  seenEvents: string[];
  archive: ArchiveEntry[];
  isGameOver: boolean;
  gameOverReason: string | null;
  startingTraits: string[];
  buildings: string[]; 
  decisionHistory: string[]; 
  hasSeenWelcome: boolean;
  isOracleActive: boolean;
  churchName: string;
  currentView: string;
  lastTrainingResult: 'consistent' | 'contradiction' | 'new' | null;
  globalDoctrine: Record<string, string>; // Church-wide consistent answers
  bureaucracyGrandeurScore: number;
}

export interface GameAction {
  type: string;
  payload?: any;
}
