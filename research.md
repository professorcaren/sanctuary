# Sanctuary: Comprehensive Technical & Design Report

## 1. Project Overview

**Sanctuary** is an idle/incremental management game that teaches the sociology of religion through interactive systems. Players guide a religious movement from a small cult through sect, denomination, and megachurch stages, experiencing the sociological tensions that shape real institutions. Built as a single-page React application, it runs entirely in the browser with an optional Google Sheets leaderboard backend.

**Stack:** React 19 + TypeScript + Vite 6.2 + Tailwind CSS 4.1 + Motion (Framer Motion) + Lucide React icons
**External Services:** Google Gemini API (Oracle guide), Google Sheets (leaderboard via Apps Script webhook)
**Deployment:** GitHub Actions → Cloud Run, base path `/sanctuary/`

---

## 2. Architecture & File Structure

```
sanctuary/
├── src/
│   ├── App.tsx                          # Root component, tab-based navigation (7 views)
│   ├── main.tsx                         # React root renderer
│   ├── index.css                        # Tailwind imports
│   ├── context/
│   │   └── GameContext.tsx              # ALL game state + reducer + tick loop (~600 lines)
│   ├── types/
│   │   └── game.ts                     # TypeScript interfaces for full game state
│   ├── components/
│   │   ├── layout/
│   │   │   └── GameLayout.tsx          # Shell: top bar (meters) + content + bottom nav
│   │   ├── game/
│   │   │   ├── HubView.tsx             # Central sanctuary with orbiting flock + buildings
│   │   │   ├── SortingGame.tsx         # Sacred/profane card classification
│   │   │   ├── RitualGame.tsx          # 3 ritual mini-games (rhythm, sequence, focus)
│   │   │   ├── SocializationGame.tsx   # Disciple recruitment + doctrine training
│   │   │   ├── BureaucracyGame.tsx     # Document approval (unlocks at denomination)
│   │   │   ├── ArchiveView.tsx         # Theory knowledge graph
│   │   │   ├── LeaderboardView.tsx     # Google Sheets-backed scoreboard
│   │   │   └── SchismEventModal.tsx    # Crisis event decision UI
│   │   └── ui/
│   │       ├── MeterBar.tsx            # Animated stat bar with spring physics
│   │       ├── StatsGlossaryModal.tsx  # Sociological definitions overlay
│   │       ├── WelcomeModal.tsx        # First-play onboarding
│   │       ├── NamingModal.tsx         # Church naming (triggers at sect stage)
│   │       ├── GameOverModal.tsx       # Death screen + prestige trait selection
│   │       ├── LearningPromptModal.tsx # Contextual sociology lessons
│   │       └── OracleGuide.tsx         # Random AI-driven gameplay hints
├── index.html                           # Entry point
├── vite.config.ts                       # Vite + React + Tailwind, path aliases
├── leaderboard.gs                       # Google Apps Script for leaderboard
└── metadata.json                        # App metadata for deployment
```

### State Management

The entire game runs on **React Context + useReducer**. `GameContext.tsx` is the heart of the application, containing:

- The full `GameState` type with meters, stage, disciples, buildings, doctrine, events, archive, and UI flags
- A reducer handling ~15 action types (TICK, UPDATE_METER, ADVANCE_STAGE, RECRUIT_DISCIPLE, TRAIN_DISCIPLE, BUY_BUILDING, TRIGGER_EVENT, DISMISS_EVENT, TRIGGER_SCHISM, RESET_GAME, etc.)
- A 1-second `setInterval` tick loop that drives passive income, decay, growth, and event triggers

There is no external state persistence (no localStorage); state lives in memory for the session.

---

## 3. Core Systems

### 3.1 Five Meters (0-100 Scale, Clamped)

| Meter | Initial | Icon | Color | Sociological Role |
|-------|---------|------|-------|-------------------|
| **Awe** | 50 | Zap | amber-400 | Spiritual energy and mystery. Attracts followers but decays as legitimacy rises. |
| **Cohesion** | 50 | Users | emerald-500 | Group solidarity. Prevents schisms, drives congregation growth rate. |
| **Legitimacy** | 30 | Scale | blue-500 | Institutional credibility. Required for stage advancement but suppresses awe. |
| **Purity** | 80 | Shield | purple-500 | Boundary maintenance. If it hits 0 → game over (internal infighting). |
| **Resources** | 100 | Coins | yellow-600 | Currency. Generated passively, spent on buildings and stage advancement. |

### 3.2 Game Loop (1-Second Tick)

Each tick performs these calculations in order:

1. **Passive income**: `floor(congregationSize / 10)` resources per tick
2. **Disciple bonuses** (only acolyte/elder rank):
   - Steward specialty: acolyte +2, elder +5 resources/tick
   - Mystic specialty: acolyte +0.1, elder +0.5 awe/tick
   - Purist specialty: acolyte +0.1, elder +0.5 purity/tick
3. **Secularization decay**: awe loses `0.1 + (legitimacy / 400)` per tick (range: 0.1-0.35/sec)
4. **Building bonus**: +0.05 awe per tick per owned building
5. **Congregation growth**: `cohesion / 1000` probability of gaining 1 member per tick
6. **Event trigger**: 0.5% chance per tick of a random stage-appropriate event
7. **Oracle trigger**: 0.01% chance per tick
8. **Loss condition check**:
   - Purity ≤ 0 → "INTERNAL INFIGHTING"
   - Legitimacy ≤ 0 → "STATE CRACKDOWN"
   - Awe ≤ 0 (non-cult only) → "THE FADE"

### 3.3 Stage Progression

| Stage | Advance Cost | Meter Requirement | Bonus on Advance | Theory Unlocked |
|-------|-------------|-------------------|-------------------|-----------------|
| **Cult** → Sect | 100 Resources | 60% Awe | +10 congregation, +10% legitimacy | Routinization of Charisma |
| **Sect** → Denomination | 500 Resources | 80% Cohesion | +10 congregation, +10% legitimacy | — |
| **Denomination** → Megachurch | 2000 Resources | 90% Legitimacy | +10 congregation, +10% legitimacy | — |
| **Megachurch** | Final stage | — | — | — |

Each stage unlocks new events, buildings, and features (bureaucracy game at denomination+).

---

## 4. Mini-Games

### 4.1 Sacred Sorting (Tab: "Sorting")

A Tinder-style card classification game teaching Durkheim's sacred/profane distinction and Mary Douglas's purity concepts.

**Mechanics:**
- 10 items per session, drag left (profane) or right (sacred)
- Items have intrinsic types: sacred, profane, or liminal
- Correct sort: +3 purity, +1 awe, combo counter increments
- Wrong sort: -10 purity, combo resets
- Cursed items (15% chance): 2.5-second countdown timer; if not sorted in time, -15 purity

**Item Pool (26+ items across categories):**

| Category | Items |
|----------|-------|
| **Sacred** | Scripture (📖), Tattered Robe (👘), Altar Candle (🕯️), Stone Idol (🗿), Human Skull (💀), Sacred Oil (🧪), Flower Bouquet (💐) |
| **Profane** | Old Boot (👢), Dead Crow (🐦‍⬛), Poison Ivy (🌿), River Rock (🪨), LED Screen (📺), Credit Card (💳), Smartphone (📱), Sports Car (🏎️), Designer Watch (⌚), Plastic Bag (🛍️) |
| **Liminal** | Wine (🍷), Wild Berries (🫐), Coffee Cup (☕), Gold Coin (💰), Electric Guitar (🎸), Megaphone (📢), Glazed Donut (🍩), Microchip (💾) |

**Dynamic Laws (40% chance per session):**

| Law | Effect |
|-----|--------|
| The Great Fast | All food → profane |
| The Luddite Law | All modern items → profane |
| The Feast | All food → sacred |
| Iconoclasm | All icons → profane |

Laws override intrinsic item types, forcing players to adapt their classification framework — directly modeling how religious authorities redefine sacred boundaries.

**Theories unlocked:** Sacred & Profane (Durkheim), Purity and Danger (Mary Douglas)

---

### 4.2 Sacred Ritual (Tab: "Ritual")

Three ritual types, each a different mini-game mechanic, teaching collective effervescence.

#### Incense Ritual (Rhythm Mode)
- **Reward:** +15 Awe
- **Mechanic:** Tap a pulsing circle at its peak. 2-second cycle, need 5 perfect taps (within 10% of beat).
- **Theory:** "Sensory overload marks the space as 'Set Apart'"

#### Chant Ritual (Sequence Mode)
- **Reward:** +10 Cohesion
- **Mechanic:** Simon Says pattern memory. 4 rounds of increasing length (1→2→3→4 items). 2x2 button grid.
- **Theory:** "Synchronized behavior creates shared emotional states"

#### Meditation Ritual (Focus Mode)
- **Reward:** +12 Purity
- **Mechanic:** Hold button to keep an indicator centered. Drifts left/right; must hold for 600 frames (~10 seconds). Fails if drift exceeds ±10% tolerance.
- **Theory:** "Asceticism and silence mark the boundary of the sacred"

#### Collective Effervescence (Awe > 80%)
When awe exceeds 80%, successful rituals trigger a special visual state:
- White flash overlay
- 20 floating amber particles ascending
- Pulsing "Collective Effervescence" label
- Background tints amber-950/10
- All rituals gain +5 bonus awe
- Models Durkheim's concept of shared sacred energy emerging from group ritual

**Theory unlocked:** Collective Effervescence (Durkheim)

---

### 4.3 Socialization / Inner Circle (Tab: "Teach")

Disciple recruitment and doctrine training system, modeling Peter Berger's Sacred Canopy theory.

**Recruitment:** Costs 5 congregation members. Random name from pool (Thomas, Sarah, John, Mary, Peter, Ruth, Paul, Esther, Luke, Martha) and random specialty.

**Disciple Properties:**
- **Specialties:** Steward (💰, resources), Purist (🛡️, purity), Mystic (✨, awe)
- **Roles by loyalty:** Novice (0-79 👤) → Acolyte (80-99 🕯️) → Elder (100 👑)
- Higher roles provide stronger passive bonuses per tick

**Training Scenarios (4 questions, randomized):**

1. **"Why do we suffer?"**
   - "To test our faith" (15pts) / "Because the world is flawed" (10pts) / "Suffering builds character" (5pts)

2. **"How should we treat non-believers?"**
   - "With radical compassion" (10pts) / "As lost sheep to be guided" (15pts) / "With cautious distance" (5pts)

3. **"What is the true purpose of our rituals?"**
   - "To manifest divine energy" (15pts) / "To unify our collective heart" (15pts) / "To honor ancient ways" (10pts)

4. **"How do we stay pure in a distracting world?"**
   - "Through constant prayer" (15pts) / "By ignoring secular noise" (10pts) / "By focusing on inner light" (15pts)

**Global Doctrine System:**
- First answer to each question establishes church-wide doctrine
- Subsequent answers are compared:
  - **Consistent** (matches doctrine): +10 loyalty — "Steadfast"
  - **Contradiction** (conflicts): -30 loyalty, -15 cohesion — "CONTRADICTION! The Sacred Canopy is torn."
  - **New** (first answer): +points from choice — "New Doctrine"

This mechanic forces players to choose between doctrinal consistency (high loyalty) and flexibility (exploring different answers), mirroring real institutional tensions.

**Theory unlocked:** Religious Socialization (Berger)

---

### 4.4 Bureaucracy (Tab: "Admin") — Unlocks at Denomination Stage

Document approval mini-game modeling Weber's routinization of charisma.

**Documents (4 in rotation):**

| Document | Cost | Approve Effect | Deny Effect |
|----------|------|---------------|-------------|
| Purchase Gold Candlesticks | 50 | +5 awe, -50 resources | -2 awe |
| Marriage Request (cousins) | 10 | +5 cohesion, -5 purity, -10 resources | +5 purity, -5 cohesion |
| Tax Exemption (501c3) | 100 | +10 legitimacy, -100 resources | -20 legitimacy, +5 awe |
| Missionary Expedition | 200 | +5 congregation, -200 resources | +2 cohesion |

**Visual design:** Wooden desk surface (#3e2723), beige paper card (#f5f5dc) with serif font, green checkmark / red X stamp buttons, stamp animation on decision.

---

### 4.5 Hub / Sanctuary View (Tab: "Sanctuary")

The central view showing the sanctuary's physical and spiritual state.

**Building Visualization — Evolving Icon:**

| Building | Cost | Awe Bonus | Min Stage | Icon |
|----------|------|-----------|-----------|------|
| (none) | — | — | — | ⛺ Tent |
| Basement | 50 | +5 | Cult | 🏠 House |
| Chapel | 300 | +10 | Sect | 🛖 Temple |
| Cathedral | 1500 | +20 | Denomination | ⛪ Cathedral |
| Tabernacle | 5000 | +40 | Megachurch | 🏟️ Stadium |

**Dynamic Glow:** Building icon has an amber shadow whose intensity scales with awe: `0 0 ${awe/2}px rgba(251,191,36,${awe/300})`

**Orbiting Flock Visualization:**
- Disciples orbit as colored dots: yellow (Steward), blue (Purist), purple (Mystic)
- Elder dots are larger (w-2 h-2) than acolyte/novice (w-1.5 h-1.5)
- Generic congregation members shown as amber dots (capped at 30 visual elements)
- Each entity orbits at a unique radius (110-150px for disciples) and duration (15-55 seconds)
- Uses Motion's `animate={{ rotate: 360 }}` with linear easing for smooth continuous rotation
- Creates a living, breathing visual of the community surrounding its sacred center

**Background gradient shifts:** Amber/brown tones with cathedral, indigo/purple with megachurch tabernacle.

**Profane State (Awe < 20, non-cult):** The entire screen desaturates with CSS `grayscale`, `sepia`, `brightness-75` filters, communicating spiritual decline visually.

---

## 5. Crisis Events & Narrative System

Events fire randomly (0.5% per tick ≈ 30% chance per minute). Only one active event at a time. Seen events are removed from the pool until all are exhausted, then the pool resets.

### Cult Stage Events

| Event | Description | Choice 1 | Choice 2 |
|-------|-------------|----------|----------|
| **Leadership Scandal** | Rumors about lavish spending | Suppress rumors: -10 legitimacy, +5 cohesion | Public Confession: +5 legitimacy, -10 awe |
| **The Outsider's Curiosity** | Journalist asking questions | Invite them in: +15 legitimacy, -10 awe | Bar the gates: +10 cohesion, -15 legitimacy *(records "barred_gates" decision)* |
| **The False Miracle** | Follower claims healing hoax | Validate Miracle: +20 awe, -10 legitimacy | Correct Follower: +10 purity, -15 awe |

### Sect Stage Events

| Event | Description | Choice 1 | Choice 2 |
|-------|-------------|----------|----------|
| **Failed Prophecy** | Promised sign didn't appear | Reinterpret signs: -5 awe, -5 legitimacy | Double Down: +15 cohesion, -20 legitimacy |
| **The Great Schism** | Faction refuses new order | Appoint Elders: +20 legitimacy, -10 awe, +5 cohesion | Keep it Personal: +15 awe, -10 legitimacy, -20 resources |
| **Internal Factionalism** | Purity dispute between members | Side with Strict: +15 purity, -5 congregation, -5 cohesion | Moderate Unity: +10 cohesion, -10 purity |

**The Great Schism** is a pivotal event. Choosing either option triggers `TRIGGER_SCHISM`:
- Congregation halved: `floor(congregationSize / 2)`
- Resources cut to a third: `floor(resources / 3)`
- Cohesion reset to 30
- Awe boosted: `min(100, awe + 20)`

### Denomination Stage Events

| Event | Description | Choice 1 | Choice 2 |
|-------|-------------|----------|----------|
| **The World Calls** | Members prioritizing secular jobs | Adapt Message: +10 legitimacy, -15 purity, +50 resources | Enforce Strictness: +15 purity, -10 congregation, +10 cohesion |
| **National Media Spotlight** | Network wants to film service | Go Prime Time: +100 resources, +20 congregation, -20 purity | Protect the Sacred: +15 awe, -20 resources |

### Megachurch Stage Events

| Event | Description | Choice 1 | Choice 2 |
|-------|-------------|----------|----------|
| **The Skeletons in the Closet** *(conditional: only if "barred_gates" decision was made)* | Documentary exposes early cult days | Apologize and Repent: -20 legitimacy, -100 resources | Claim Religious Persecution: +20 cohesion, -40 legitimacy |

This conditional event demonstrates **narrative consequence** — an early-game decision (barring the journalist) echoes forward into the megachurch stage, a design choice that reinforces how institutional history shapes present crises.

---

## 6. Theory Archive & Knowledge Graph

Five sociological theories form a connected knowledge graph, unlocked through gameplay:

### Theory Network

```
Collective Effervescence (Durkheim)
        ↓
Religious Socialization (Berger)

The Sacred & The Profane (Durkheim)
        ↓
Purity and Danger (Douglas)
        ↓
Routinization of Charisma (Weber)
```

### Theory Details

| Theory | Scholar | Core Idea | Unlock Trigger |
|--------|---------|-----------|----------------|
| **Collective Effervescence** | Durkheim | "Rituals create shared energy that makes the group feel greater than the sum of its parts." | Complete any ritual |
| **Religious Socialization** | Berger | "Religion provides a 'Sacred Canopy' protecting individuals from chaos by giving it meaning." | Train a disciple |
| **The Sacred & The Profane** | Durkheim | "Society divides into Sacred (extraordinary, protected) and Profane (ordinary, everyday)." | Complete sorting game |
| **Purity and Danger** | Douglas | "Dirt is 'matter out of place.' Taboo arises from things that don't fit social categories." | Sort liminal items |
| **Routinization of Charisma** | Weber | "Charismatic authority must be transformed into legal or traditional authority to survive." | Advance to a new stage |

**Visual design:** Nodes positioned as a connected graph. Unlocked nodes glow amber with clickable detail panels showing title, theorist, theory quote, and academic description. Locked nodes appear as greyed-out placeholders with connection lines dimmed.

---

## 7. Prestige / New Game+ System

When a game-over condition is triggered, the player can restart with bonuses:

**Theory Points:** Each unlocked archive theory = 1 point for the next run.

**Starting Traits (purchased with theory points):**

| Trait | Cost | Bonus |
|-------|------|-------|
| Charismatic Founder | 1 pt | +20 starting Awe |
| Communal Elder | 1 pt | +20 starting Cohesion |
| Organized Scribe | 2 pts | +20 starting Legitimacy |
| Zealous Inquisitor | 3 pts | +20 starting Purity |

**Reset preserves:** Archive (theories learned), starting traits
**Reset clears:** All meters (reset to initial + trait bonuses), disciples, buildings, events, doctrine, stage (back to cult), resources (reset to 100)

---

## 8. UI Layer & Visual Design

### Layout Structure
- Fixed mobile container: max-width 448px, 100dvh height
- Dark theme: slate-950 background, slate-900 containers
- Accent color: amber-500 for active/important states

### Top Bar (Clickable → Stats Glossary)
- 2x2 grid of compact meter bars (Awe, Cohesion, Legitimacy, Purity)
- Resources count + Flock count + Church name or stage label
- Each meter bar uses spring physics animation (stiffness: 100, damping: 20)
- Hover effect transitions to slate-800/50

### Bottom Navigation (6-7 tabs)
- Always visible: Sanctuary (🏰), Sorting (⚖️), Ritual (🕯️), Teach (🗣️), Archive (📚)
- Conditional: Admin (📜) — appears at denomination+ stage
- Active tab: bg-slate-800, amber-400 text, 1.05 scale transform
- Inactive: text-slate-500 with hover brightening
- Labels: 10px uppercase with wide tracking

### Modal System (Z-index Hierarchy)
| Modal | Z-Index | Trigger |
|-------|---------|---------|
| Naming Modal | 120 | Reaching sect stage |
| Welcome Modal | 110 | First play |
| Game Over Modal | 100 | Any loss condition |
| Oracle Guide | 60 | Random (0.01%/tick) |
| Learning Prompts | 50 | Contextual meter changes |
| Schism Events | 50 | Random (0.5%/tick) |

### Stats Glossary Modal
Opened by clicking the top bar. Shows all 5 stats with:
- Colored icon in styled box
- Current value (percentage or raw number)
- Italic sociological definition explaining the mechanic

### Animation & Effects
- **Meter bars:** Motion.div with spring physics for smooth fill transitions
- **Orbiting flock:** CSS `rotate: 360` with linear easing, varied durations
- **Building glow:** Dynamic box-shadow scaling with awe meter value
- **Card sorting:** Drag with rotation transform, color shifts by direction
- **Cursed items:** Oscillating -2px/+2px vibration animation
- **Collective Effervescence:** Particle system with 2-4s upward float + fade
- **Ritual success:** White flash overlay
- **Profane state:** Full-screen grayscale/sepia/brightness CSS filter (1s transition)
- **Stamp animation:** Scale + rotation on bureaucracy approval/denial
- **Backdrop blur:** `backdrop-blur-md` on all modal overlays

---

## 9. Emergent Design Tensions

The game's mechanics create authentic sociological tensions that mirror real institutional dynamics:

| Tension | Mechanic | Sociological Parallel |
|---------|----------|-----------------------|
| **Awe vs. Legitimacy** | Legitimacy increases awe decay rate (`legitimacy/400`) | Weber's routinization: institutional growth kills charismatic appeal |
| **Purity vs. Growth** | Strict boundary events cost congregation members | Sectarian exclusivism vs. denominational inclusivism |
| **Charisma vs. Bureaucracy** | Schism event forces choice between personal and institutional authority | Weber's three types of legitimate domination |
| **Doctrine Consistency vs. Flexibility** | Contradictions cost -30 loyalty and -15 cohesion | Berger's Sacred Canopy — coherent worldview maintenance |
| **Short-term Awe vs. Long-term Stability** | Building awe through miracles costs legitimacy | False miracle event directly models this |
| **Growth vs. Identity** | Media spotlight and adaptation events trade purity for resources/members | Niebuhr's church-sect cycle |

These tensions are not scripted narratives but **emergent properties of the meter system**, meaning players discover them through play rather than exposition.

---

## 10. Economic Balance & Time Scales

### Income
- Base passive: ~0.5-5 resources/sec (depending on congregation size)
- Elder steward disciple: +5 resources/sec
- Major event windfalls: +50 to +200 resources

### Costs
- Buildings: 50 → 300 → 1500 → 5000 (exponential scaling)
- Stage advances: 100 → 500 → 2000 (exponential scaling)
- Disciple recruitment: 5 congregation members

### Typical Progression Timing
- Cult phase: ~2-3 minutes to gather initial resources
- Stage transitions: ~5-15 minutes each
- Full cult→megachurch run: ~30-60 minutes
- Prestige cycle: 1-2 hours per complete run

### Decay & Growth Rates
- Awe decay: 0.1-0.35/sec (increases with legitimacy)
- Building offset: 0.05/sec per building (20 buildings = 1 awe/sec)
- Congregation growth probability: cohesion/1000 per tick
- Event frequency: ~1 event every 3.3 minutes on average

---

## 11. External Integrations

### Leaderboard (Google Sheets)
- Data stored in a Google Sheets spreadsheet, fetched as CSV
- Score submission via Google Apps Script webhook (no-cors POST)
- Tracks: sanctuary name, final stage, member count, total resources
- Ranked by resources descending, #1 highlighted in amber

### Oracle Guide (Gemini API)
- Configured via `GEMINI_API_KEY` environment variable
- Provides contextual gameplay hints based on current stage and meter deficiencies
- Triggers randomly (0.01% per tick)
- Suggests specific actions: "perform more rituals," "recruit Steward disciples," "submit legal forms"

---

## 12. How The Game Accomplishes Its Educational Goals

The game teaches sociology of religion through **experiential mechanics** rather than didactic text:

1. **Sacred/Profane boundaries are felt, not told.** Players physically sort items and encounter laws that reclassify them, experiencing how social authority — not inherent properties — determines sacredness.

2. **Collective effervescence emerges from action.** The visual particle effects and meter boosts at high awe create a felt sense of "something greater" during rituals, modeling Durkheim's theory through game feel.

3. **The Sacred Canopy tears in real time.** Doctrinal contradictions during disciple training visibly damage cohesion and loyalty, showing students how inconsistent worldviews fracture communities.

4. **Routinization is a mechanical inevitability.** The awe decay formula (`0.1 + legitimacy/400`) means that gaining legitimacy automatically kills the mystical quality — players don't read about Weber's theory, they live it.

5. **Purity boundaries have real costs.** Events force trade-offs between strict boundaries (purity) and institutional growth (congregation, resources), making Mary Douglas's theory into a resource management problem.

6. **Theory unlocks reward engagement.** Sociological concepts are gated behind gameplay (sorting unlocks Durkheim, training unlocks Berger, stage advancement unlocks Weber), ensuring players engage with mechanics before receiving theoretical framing.

7. **Narrative consequences span the full game.** The "barred gates" decision in the cult stage can trigger a crisis in the megachurch stage, teaching that institutional histories carry forward — a core insight of organizational sociology.

The result is a game where players naturally discover the tensions sociologists have spent decades theorizing, making abstract academic concepts tangible and memorable.
