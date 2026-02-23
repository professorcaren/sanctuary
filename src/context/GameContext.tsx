import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, MeterType, GameEvent, LearningPrompt, ArchiveEntry } from '../types/game';

const THEORY_ARCHIVE: Record<string, ArchiveEntry> = {
  'effervescence': {
    id: 'effervescence',
    title: 'Collective Effervescence',
    concept: 'Émile Durkheim',
    theory: 'Rituals create a shared energy that makes the group feel like something greater than the sum of its parts.',
    description: 'When humans gather and perform the same actions, they experience a loss of self and a feeling of "sacred" unity.'
  },
  'socialization': {
    id: 'socialization',
    title: 'Religious Socialization',
    concept: 'Peter Berger',
    theory: 'Religion provides a "Sacred Canopy" that protects individuals from the chaos of the world by giving it meaning.',
    description: 'Doctrine is the process of teaching members how to perceive reality according to the group\'s logic.'
  },
  'sacred_profane': {
    id: 'sacred_profane',
    title: 'The Sacred & The Profane',
    concept: 'Émile Durkheim',
    theory: 'Society is divided into two realms: the Sacred (extraordinary, protected) and the Profane (ordinary, everyday).',
    description: 'A thing is not sacred because of its inherent qualities, but because the group has collectively set it apart.'
  },
  'purity_danger': {
    id: 'purity_danger',
    title: 'Purity and Danger',
    concept: 'Mary Douglas',
    theory: 'Dirt is "matter out of place." Taboo arises from things that don\'t fit into our social categories.',
    description: 'Ambiguous items (like wine or gold) create tension. How a group classifies them defines its social boundaries.'
  },
  'routinization': {
    id: 'routinization',
    title: 'Routinization of Charisma',
    concept: 'Max Weber',
    theory: 'Charismatic authority must be transformed into legal or traditional authority to survive the leader\'s death.',
    description: 'The transition from a "Cult" to a "Denomination" requires rules, bureaucracy, and predictable rituals.'
  }
};

const INITIAL_STATE: GameState = {
  meters: {
    awe: 50,
    cohesion: 50,
    legitimacy: 30,
    resources: 20,
    purity: 80,
  },
  stage: 'cult',
  resources: 100,
  unlockedFeatures: ['sorting', 'ritual'],
  congregationSize: 5,
  lastRitualTime: 0,
  activeEvent: null,
  activePrompt: null,
  seenPrompts: [],
  seenEvents: [],
  archive: [],
  isGameOver: false,
  gameOverReason: null,
  disciples: [],
  startingTraits: [],
  buildings: [],
  decisionHistory: [],
  hasSeenWelcome: false,
  isOracleActive: false,
};

type Action =
  | { type: 'UPDATE_METER'; meter: MeterType; value: number }
  | { type: 'ADD_RESOURCE'; amount: number }
  | { type: 'ADD_MEMBERS'; amount: number }
  | { type: 'ADVANCE_STAGE'; stage: GameState['stage'] }
  | { type: 'TICK'; delta: number }
  | { type: 'TRIGGER_EVENT'; event: GameEvent }
  | { type: 'RESOLVE_EVENT' }
  | { type: 'SHOW_PROMPT'; prompt: LearningPrompt }
  | { type: 'DISMISS_PROMPT' }
  | { type: 'UNLOCK_THEORY'; id: string }
  | { type: 'RESET_GAME'; traits?: string[] }
  | { type: 'TRIGGER_SCHISM' }
  | { type: 'RECRUIT_DISCIPLE'; name: string; specialty: 'resources' | 'purity' | 'awe' }
  | { type: 'TRAIN_DISCIPLE'; id: string; outcome: 'success' | 'fail'; points: number }
  | { type: 'PURCHASE_UPGRADE'; id: string; cost: number; aweBonus: number }
  | { type: 'RECORD_DECISION'; id: string }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'DISMISS_ORACLE' }
  | { type: 'TRIGGER_ORACLE' };

const EVENTS: Record<string, GameEvent[]> = {
// ... existing events
  'cult': [
    {
      id: 'scandal',
      title: 'Leadership Scandal',
      description: 'Rumors circulate about the High Priest\'s lavish spending.',
      choices: [
        { text: 'Suppress the rumors', outcome: 'The flock is quiet, but suspicious.', effects: { legitimacy: -10, cohesion: 5 } },
        { text: 'Public Confession', outcome: 'Honesty hurts, but heals.', effects: { legitimacy: 5, awe: -10 } },
      ]
    },
    {
      id: 'outsider',
      title: 'The Outsider\'s Curiosity',
      description: 'A local journalist is asking questions about your "community."',
      choices: [
        { text: 'Invite them in', outcome: 'Transparency builds trust, but ruins the mystery.', effects: { legitimacy: 15, awe: -10 } },
        { text: 'Bar the gates', outcome: 'Secrecy fuels cohesion, but looks suspicious.', effects: { cohesion: 10, legitimacy: -15 } },
      ]
    },
    {
      id: 'miracle_claim',
      title: 'The False Miracle',
      description: 'A follower claims to have been healed, but it looks like a hoax.',
      choices: [
        { text: 'Validate the Miracle', outcome: 'Awe skyrockets, but the wise are wary.', effects: { awe: 20, legitimacy: -10 } },
        { text: 'Correct the Follower', outcome: 'Integrity is maintained at the cost of magic.', effects: { purity: 10, awe: -15 } },
      ]
    }
  ],
  'sect': [
    {
      id: 'prophecy',
      title: 'Failed Prophecy',
      description: 'The promised sign did not appear in the sky. Cognitive dissonance sets in.',
      choices: [
        { text: 'Reinterpret the signs', outcome: 'It was a metaphor!', effects: { awe: -5, legitimacy: -5 } },
        { text: 'Double Down', outcome: 'It will come soon! Faith is tested!', effects: { cohesion: 15, legitimacy: -20 } },
      ]
    },
    {
      id: 'routinization_crisis',
      title: 'The Great Schism',
      description: 'The movement is growing too fast. A faction refuses to accept the new order. A split is inevitable.',
      choices: [
        { text: 'Appoint Elders (Bureaucracy)', outcome: 'Stability increases, but the faction leaves with your wealth.', effects: { legitimacy: 20, awe: -10, cohesion: 5 } },
        { text: 'Keep it Personal (Charisma)', outcome: 'The fire remains, but the rationalists desert you.', effects: { awe: 15, legitimacy: -10, resources: -20 } },
      ]
    },
    {
      id: 'factionalism',
      title: 'Internal Factionalism',
      description: 'Two members are arguing over who is the most "pure."',
      choices: [
        { text: 'Side with the Strict', outcome: 'Purity increases, but the group shrinks.', effects: { purity: 15, congregationSize: -5, cohesion: -5 } },
        { text: 'Preach Moderate Unity', outcome: 'Peace returns, but at the cost of rigor.', effects: { cohesion: 10, purity: -10 } },
      ]
    }
  ],
  'denomination': [
    {
      id: 'secular_tension',
      title: 'The World Calls',
      description: 'Members are spending more time at their secular jobs than in prayer.',
      choices: [
        { text: 'Adapt Message', outcome: 'We become relevant, but less "distinct".', effects: { legitimacy: 10, purity: -15, resources: 50 } },
        { text: 'Enforce Strictness', outcome: 'We remain pure, but lose members.', effects: { purity: 15, congregationSize: -10, cohesion: 10 } },
      ]
    },
    {
      id: 'media_spotlight',
      title: 'National Media Spotlight',
      description: 'A major network wants to film your main service.',
      choices: [
        { text: 'Go Prime Time', outcome: 'Huge growth, but the message is watered down.', effects: { resources: 100, congregationSize: 20, purity: -20 } },
        { text: 'Protect the Sacred', outcome: 'Awe is preserved for the faithful.', effects: { awe: 15, resources: -20 } },
      ]
    }
  ],
  'megachurch': [
    {
      id: 'past_scandal_exposed',
      title: 'The Skeletons in the Closet',
      description: 'A documentary reveals the "barred gates" of your early cult days. The public is outraged.',
      choices: [
        { text: 'Apologize and Repent', outcome: 'Legitimacy slowly recovers.', effects: { legitimacy: -20, resources: -100 } },
        { text: 'Claim Religious Persecution', outcome: 'The flock is unified, but the world turns away.', effects: { cohesion: 20, legitimacy: -40 } },
      ]
    }
  ]
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'UPDATE_METER':
      return {
        ...state,
        meters: {
          ...state.meters,
          [action.meter]: Math.max(0, Math.min(100, state.meters[action.meter] + action.value)),
        },
      };
    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: state.resources + action.amount,
      };
    case 'ADD_MEMBERS':
      return {
        ...state,
        congregationSize: Math.max(0, state.congregationSize + action.amount),
      };
    case 'ADVANCE_STAGE':
      return {
        ...state,
        stage: action.stage,
        congregationSize: state.congregationSize + 10,
        seenEvents: [], // Clear history on stage advance
      };
    case 'TRIGGER_EVENT':
      return { 
        ...state, 
        activeEvent: action.event,
        seenEvents: [...state.seenEvents, action.event.id] 
      };
    case 'RESOLVE_EVENT':
      return { ...state, activeEvent: null };
    case 'SHOW_PROMPT':
      if (state.seenPrompts.includes(action.prompt.id)) return state;
      return { ...state, activePrompt: action.prompt, seenPrompts: [...state.seenPrompts, action.prompt.id] };
    case 'DISMISS_PROMPT':
      return { ...state, activePrompt: null };
    case 'UNLOCK_THEORY':
      if (state.archive.find(e => e.id === action.id)) return state;
      const entry = THEORY_ARCHIVE[action.id];
      if (!entry) return state;
      return {
        ...state,
        archive: [...state.archive, entry]
      };
    case 'RESET_GAME':
      const traits = action.traits || [];
      const newMeters = { ...INITIAL_STATE.meters };
      
      if (traits.includes('charismatic')) newMeters.awe += 20;
      if (traits.includes('organized')) newMeters.legitimacy += 20;
      if (traits.includes('zealous')) newMeters.purity += 20;
      if (traits.includes('communal')) newMeters.cohesion += 20;

      return {
        ...INITIAL_STATE,
        meters: newMeters,
        startingTraits: traits,
        archive: state.archive, // Keep the archive (meta-progression)
        hasSeenWelcome: true, // Don't show welcome again after reset
        isOracleActive: false,
      };
    case 'DISMISS_WELCOME':
      return {
        ...state,
        hasSeenWelcome: true
      };
    case 'DISMISS_ORACLE':
      return {
        ...state,
        isOracleActive: false
      };
    case 'TRIGGER_ORACLE':
      return {
        ...state,
        isOracleActive: true
      };
    case 'TRIGGER_SCHISM':
      return {
        ...state,
        congregationSize: Math.floor(state.congregationSize / 2),
        resources: Math.floor(state.resources / 3),
        meters: {
          ...state.meters,
          cohesion: 30, // Schisms destroy cohesion
          awe: Math.min(100, state.meters.awe + 20), // But focus the remaining faithful
        },
        activeEvent: null,
      };
    case 'RECRUIT_DISCIPLE':
      // @ts-ignore
      if (state.congregationSize < 5) return state;
      return {
        ...state,
        congregationSize: state.congregationSize - 1,
        disciples: [
          ...state.disciples,
          {
            id: Date.now().toString(),
            // @ts-ignore
            name: action.name,
            role: 'novice',
            loyalty: 50,
            // @ts-ignore
            specialty: action.specialty,
            history: [],
          },
        ],
      };
    case 'TRAIN_DISCIPLE':
      return {
        ...state,
        disciples: state.disciples.map(d => {
          // @ts-ignore
          if (d.id !== action.id) return d;
          
          // @ts-ignore
          let newLoyalty = d.loyalty + (action.outcome === 'success' ? action.points : -5);
          let newRole = d.role;
          
          // Promotion Logic
          if (d.role === 'novice' && newLoyalty >= 80) newRole = 'acolyte';
          if (d.role === 'acolyte' && newLoyalty >= 100) newRole = 'elder';
          
          return { ...d, loyalty: Math.min(100, Math.max(0, newLoyalty)), role: newRole };
        }),
      };
    case 'PURCHASE_UPGRADE':
      return {
        ...state,
        resources: state.resources - action.cost,
        buildings: [...state.buildings, action.id],
        meters: {
          ...state.meters,
          awe: Math.min(100, state.meters.awe + action.aweBonus)
        }
      };
    case 'RECORD_DECISION':
      return {
        ...state,
        decisionHistory: [...state.decisionHistory, action.id]
      };
    case 'TICK':
      if (state.isGameOver) return state;

      const passiveIncome = Math.floor(state.congregationSize / 10);
      
      // Disciple Bonuses
      let discipleResources = 0;
      let discipleAwe = 0;
      let disciplePurity = 0;
      
      state.disciples.forEach(d => {
        if (d.role === 'acolyte' || d.role === 'elder') {
           if (d.specialty === 'resources') discipleResources += (d.role === 'elder' ? 5 : 2);
           if (d.specialty === 'awe') discipleAwe += (d.role === 'elder' ? 0.5 : 0.1);
           if (d.specialty === 'purity') disciplePurity += (d.role === 'elder' ? 0.5 : 0.1);
        }
      });

      // Secularization Challenge: Awe decays faster as Legitimacy rises
      // Base decay: 0.1. Add 0.05 for every 20 Legitimacy
      const secularDecay = 0.1 + (state.meters.legitimacy / 400);

      // Material Religion: Buildings provide passive awe stabilization
      // Each building reduces decay or adds a tiny bit of awe
      const buildingBonus = state.buildings.length * 0.05;

      const growthChance = state.meters.cohesion / 1000;
      const newMember = Math.random() < growthChance ? 1 : 0;
      
      // Loss Condition Checks
      if (state.meters.purity <= 0) {
        return { ...state, isGameOver: true, gameOverReason: 'INTERNAL INFIGHTING: Your lack of purity led to a civil war within the sanctuary. The group has dissolved into bitter factions.' };
      }
      if (state.meters.legitimacy <= 0) {
        return { ...state, isGameOver: true, gameOverReason: 'STATE CRACKDOWN: Your lack of legitimacy caught the eye of the authorities. A raid has shut down your operations.' };
      }
      if (state.meters.awe <= 0 && state.stage !== 'cult') {
        return { ...state, isGameOver: true, gameOverReason: 'THE FADE: Without awe, your followers have realized this is just another social club. They have drifted away to seek the truly sacred elsewhere.' };
      }

      let nextEvent = state.activeEvent;
      let newSeenEvents = state.seenEvents;

      if (!state.activeEvent && Math.random() < 0.005) { 
        let pool = EVENTS[state.stage] || EVENTS['cult'];
        
        // Filter out seen events
        let possibleEvents = pool.filter(e => !state.seenEvents.includes(e.id));
        
        // Conditional Event Logic: Skeletons in the closet
        if (state.stage === 'megachurch' && state.decisionHistory.includes('barred_gates')) {
           const scandal = EVENTS['megachurch'].find(e => e.id === 'past_scandal_exposed');
           if (scandal && !state.seenEvents.includes(scandal.id)) {
              nextEvent = scandal;
           }
        }

        if (!nextEvent && possibleEvents.length > 0) {
          nextEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
          newSeenEvents = [...state.seenEvents, nextEvent.id];
        } else if (!nextEvent && state.seenEvents.length > 0) {
          newSeenEvents = [];
        }
      }

      // Trigger Oracle every ~15 mins or manually on stage advance
      let nextOracle = false;
      if (!state.isOracleActive && Math.random() < 0.0001) {
        nextOracle = true;
      }

      return {
        ...state,
        isOracleActive: nextOracle || state.isOracleActive,
        resources: state.resources + passiveIncome + discipleResources,
        congregationSize: state.congregationSize + newMember,
        activeEvent: nextEvent,
        seenEvents: newSeenEvents,
        meters: {
            ...state.meters,
            awe: Math.max(0, state.meters.awe - secularDecay + discipleAwe + buildingBonus),
            purity: Math.min(100, state.meters.purity + disciplePurity)
        }
      };
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', delta: 1000 });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
