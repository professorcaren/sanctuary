import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, MeterType, GameEvent, LearningPrompt, ArchiveEntry, Disciple } from '../types/game';

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
  },
  'church_sect': {
    id: 'church_sect',
    title: 'Church-Sect Typology',
    concept: 'Max Weber & Ernst Troeltsch',
    theory: 'Religious groups exist on a spectrum of tension with the surrounding society.',
    description: 'A "Sect" maintains high tension and strict boundaries, while a "Church" (or Denomination) seeks social integration and low tension.'
  }
};

const INITIAL_STATE: GameState = {
  meters: {
    awe: 50,
    cohesion: 50,
    legitimacy: 30,
    resources: 100,
    purity: 80,
  },
  stage: 'movement',
  archetype: 'charismatic',
  resources: 100,
  unlockedFeatures: ['sorting', 'ritual'],
  congregationSize: 5,
  lastRitualTime: 0,
  lastRitualId: null,
  ritualRepetitionCount: 0,
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
  churchName: '',
  lastTrainingResult: null,
  globalDoctrine: {},
  bureaucracyGrandeurScore: 0,
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
  | { type: 'RESET_GAME'; traits?: string[]; archetype?: any }
  | { type: 'TRIGGER_SCHISM' }
  | { type: 'RECRUIT_DISCIPLE'; name: string; specialty: 'resources' | 'purity' | 'awe' }
  | { type: 'COMPLETE_RITUAL'; ritualId: string; meter: MeterType; bonus: number }
  | { type: 'TRAIN_DISCIPLE'; id: string; questionId: string; answerId: string; points: number }
  | { type: 'PURCHASE_UPGRADE'; id: string; cost: number; aweBonus: number }
  | { type: 'RECORD_DECISION'; id: string }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'DISMISS_ORACLE' }
  | { type: 'TRIGGER_ORACLE' }
  | { type: 'UPDATE_GRANDEUR'; value: number }
  | { type: 'SET_CHURCH_NAME'; name: string };

const EVENTS: Record<string, GameEvent[]> = {
  'movement': [
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
  ],
  'cult': [
    {
      id: 'total_institution',
      title: 'The Total Institution',
      description: 'Your control over every aspect of members\' lives is being challenged by families.',
      choices: [
        { text: 'Enforce Separation', outcome: 'The group is all they have left.', effects: { cohesion: 25, legitimacy: -20, awe: 10 } },
        { text: 'Allow Supervised Visits', outcome: 'Tension drops, but boundaries weaken.', effects: { legitimacy: 10, cohesion: -15, purity: -10 } },
      ]
    },
    {
      id: 'prophetic_radicalization',
      title: 'Prophetic Radicalization',
      description: 'Your recent visions call for a complete rejection of the secular world.',
      choices: [
        { text: 'Preach the Apocalypse', outcome: 'Awe is absolute. The world is nothing.', effects: { awe: 30, legitimacy: -30, cohesion: 10 } },
        { text: 'Moderate the Message', outcome: 'We stay safe, but the fire dims.', effects: { legitimacy: 10, awe: -20 } },
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
      const archetype = action.archetype || 'charismatic';
      const newMeters = { ...INITIAL_STATE.meters };
      
      let initialResources = 100;
      let initialUnlocked = ['sorting', 'ritual'];
      let initialArchive: ArchiveEntry[] = [];

      // Archetype Baseline Modifiers
      if (archetype === 'mystic') {
        newMeters.awe += 30;
        newMeters.legitimacy -= 20;
      } else if (archetype === 'administrator') {
        initialResources = 500;
        initialUnlocked = ['sorting', 'ritual', 'bureaucracy'];
      } else if (archetype === 'scholar') {
        initialArchive = [THEORY_ARCHIVE['sacred_profane'], THEORY_ARCHIVE['socialization']];
      }

      // Traits
      if (traits.includes('charismatic')) newMeters.awe += 20;
      if (traits.includes('organized')) newMeters.legitimacy += 20;
      if (traits.includes('zealous')) newMeters.purity += 20;
      if (traits.includes('communal')) newMeters.cohesion += 20;

      return {
        ...INITIAL_STATE,
        meters: newMeters,
        resources: initialResources,
        unlockedFeatures: initialUnlocked,
        archetype: archetype,
        startingTraits: traits,
        archive: initialArchive.length > 0 ? initialArchive : state.archive, 
        hasSeenWelcome: true, 
        isOracleActive: false,
        churchName: '',
        globalDoctrine: {}, // Clear doctrine on full reset
      };
    case 'UPDATE_GRANDEUR':
      return {
        ...state,
        bureaucracyGrandeurScore: state.bureaucracyGrandeurScore + action.value
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
    case 'SET_CHURCH_NAME':
      return {
        ...state,
        churchName: action.name
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
    case 'COMPLETE_RITUAL':
      const isRepeat = state.lastRitualId === action.ritualId;
      const count = isRepeat ? state.ritualRepetitionCount + 1 : 1;
      const multiplier = count > 2 ? 1 / (1 + (count - 2) * 0.5) : 1;

      return {
        ...state,
        lastRitualId: action.ritualId,
        ritualRepetitionCount: count,
        meters: {
          ...state.meters,
          [action.meter]: Math.min(100, Math.max(0, state.meters[action.meter] + (action.bonus * multiplier))),
          awe: Math.min(100, Math.max(0, state.meters.awe + (5 * multiplier)))
        }
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
            doctrine: {},
          },
        ],
      };
    case 'TRAIN_DISCIPLE':
      let trainType: 'consistent' | 'contradiction' | 'new' = 'new';
      
      // @ts-ignore
      const establishedAnswer = state.globalDoctrine[action.questionId];
      
      // @ts-ignore
      if (!establishedAnswer) {
        trainType = 'new';
      // @ts-ignore
      } else if (establishedAnswer === action.answerId) {
        trainType = 'consistent';
      } else {
        trainType = 'contradiction';
      }

      const updatedDiscs = state.disciples.map(d => {
        // @ts-ignore
        if (d.id !== action.id) return d;
        
        let pointsChange = 0;
        if (trainType === 'contradiction') pointsChange = -30;
        else if (trainType === 'consistent') pointsChange = 10;
        // @ts-ignore
        else pointsChange = action.points;

        const newLoyalty = Math.min(100, Math.max(0, d.loyalty + pointsChange));
        let newRole = d.role;
        if (d.role === 'novice' && newLoyalty >= 80) newRole = 'acolyte';
        if (d.role === 'acolyte' && newLoyalty >= 100) newRole = 'elder';

        return { ...d, loyalty: newLoyalty, role: newRole };
      });

      return {
        ...state,
        disciples: updatedDiscs,
        lastTrainingResult: trainType,
        globalDoctrine: {
          ...state.globalDoctrine,
          // @ts-ignore
          [action.questionId]: action.answerId
        },
        meters: {
          ...state.meters,
          cohesion: trainType === 'contradiction' ? Math.max(0, state.meters.cohesion - 15) : state.meters.cohesion
        }
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

      // Secularization Challenge
      let secularDecay = 0.1 + (state.meters.legitimacy / 400);
      let cultLegitimacyDecay = 0;
      let cultAweBonus = 0;
      let cultCohesionBonus = 0;

      if (state.stage === 'cult') {
        cultLegitimacyDecay = 0.5; // Rapid decay
        cultAweBonus = 0.3;        // Intense focus
        cultCohesionBonus = 0.2;   // Total institution effect
      }

      const buildingBonus = state.buildings.length * 0.05;

      let growthChance = state.meters.cohesion / 1000;
      if (state.stage === 'cult') growthChance *= 0.2; // Stagnant growth

      const newMember = Math.random() < growthChance ? 1 : 0;
      
      // Loss Condition Checks
      if (state.meters.purity <= 0) {
        return { ...state, isGameOver: true, gameOverReason: 'INTERNAL INFIGHTING: Your lack of purity led to a civil war within the sanctuary. The group has dissolved into bitter factions.' };
      }
      if (state.meters.legitimacy <= 0) {
        const reason = state.stage === 'cult' ? 'STATE CRACKDOWN: Your radical deviation from social norms triggered an intense state response. The movement has been forcibly dismantled.' : 'STATE CRACKDOWN: Your lack of legitimacy caught the eye of the authorities. A raid has shut down your operations.';
        return { ...state, isGameOver: true, gameOverReason: reason };
      }
      if (state.meters.awe <= 0 && state.stage !== 'movement') {
        return { ...state, isGameOver: true, gameOverReason: 'THE FADE: Without awe, your followers have realized this is just another social club. They have drifted away to seek the truly sacred elsewhere.' };
      }

      let nextEvent = state.activeEvent;
      let newSeenEvents = state.seenEvents;

      if (!state.activeEvent && Math.random() < 0.005) { 
        let pool = EVENTS[state.stage] || EVENTS['movement'];
        let possibleEvents = pool.filter(e => !state.seenEvents.includes(e.id));
        
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

      // Trigger Oracle
      let nextOracle = false;
      if (!state.isOracleActive && Math.random() < 0.0001) {
        nextOracle = true;
      }

      // Archetype Specific: Scholar faster purity gain
      const scholarPurityBonus = state.archetype === 'scholar' ? 0.05 : 0;

      // Dynamic Event: Scandal probability based on grandeur
      let scandalProbability = 0.005;
      if (state.bureaucracyGrandeurScore > 100) {
        scandalProbability += 0.01;
      }

      if (!state.activeEvent && Math.random() < scandalProbability) { 
        let pool = EVENTS[state.stage] || EVENTS['movement'];
        
        // Prioritize Scandal if grandeur is high
        if (state.bureaucracyGrandeurScore > 50) {
           const scandal = pool.find(e => e.id === 'scandal');
           if (scandal && !state.seenEvents.includes(scandal.id)) {
              nextEvent = scandal;
           }
        }

        if (!nextEvent) {
          let possibleEvents = pool.filter(e => !state.seenEvents.includes(e.id));
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
            awe: Math.max(0, Math.min(100, state.meters.awe - secularDecay + discipleAwe + buildingBonus + cultAweBonus)),
            purity: Math.max(0, Math.min(100, state.meters.purity + disciplePurity + scholarPurityBonus)),
            legitimacy: Math.max(0, Math.min(100, state.meters.legitimacy - cultLegitimacyDecay)),
            cohesion: Math.max(0, Math.min(100, state.meters.cohesion + cultCohesionBonus))
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
