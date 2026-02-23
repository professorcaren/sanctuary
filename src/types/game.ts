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

export interface GameState {
  meters: Record<MeterType, number>;
  stage: 'cult' | 'sect' | 'denomination' | 'megachurch';
  resources: number;
  unlockedFeatures: string[];
  congregationSize: number;
  lastRitualTime: number;
  activeEvent: GameEvent | null;
  activePrompt: LearningPrompt | null;
  seenPrompts: string[];
  seenEvents: string[];
  archive: ArchiveEntry[];
  isGameOver: boolean;
  gameOverReason: string | null;
}

export interface GameAction {
  type: string;
  payload?: any;
}
