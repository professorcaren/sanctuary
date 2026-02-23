# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sanctuary is an educational idle/incremental game teaching sociology of religion concepts. Players guide a religious movement through stages (Movement → Sect/Cult → Denomination → Megachurch) by managing five metrics and completing mini-games. Built as a single-page React app with no backend persistence.

## Commands

```bash
npm run dev       # Dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # TypeScript type checking (tsc --noEmit) — no ESLint
npm run clean     # Remove dist/
```

There are no tests. Linting is TypeScript-only.

## Architecture

### State Management

All game state lives in `src/context/GameContext.tsx` (~600 lines). Uses React Context + `useReducer` with ~15 action types (SCREAMING_SNAKE_CASE). A 1-second `setInterval` tick loop handles passive income, meter decay, congregation growth, random events, and loss conditions. No localStorage persistence — state is session-only.

### Routing

Tab-based routing via local state in `App.tsx` — no React Router. Views: hub, sorting, ritual, social, bureaucracy, archive, leaderboard.

### Component Organization

- `src/components/game/` — Seven self-contained game views (HubView, SortingGame, RitualGame, SocializationGame, BureaucracyGame, ArchiveView, LeaderboardView)
- `src/components/ui/` — Modals and shared UI (MeterBar, WelcomeModal, GameOverModal, etc.)
- `src/components/layout/GameLayout.tsx` — Shell wrapping all views with meter bars, nav, and modal layers
- `src/types/game.ts` — All TypeScript interfaces

### Five-Meter System

Core gameplay revolves around five meters (0–100 except resources which are unbounded): **Awe** (amber), **Cohesion** (emerald), **Legitimacy** (blue), **Purity** (purple), **Resources** (yellow). Loss triggers when Purity ≤ 0, Legitimacy ≤ 0, or Awe ≤ 0 (non-cult).

### Styling

Tailwind CSS 4.1 via Vite plugin. Dark theme (slate-950/900 backgrounds). Mobile-first with max-width 448px (`max-w-md`). Uses CSS safe area insets for notch/home bar.

### Animation

Framer Motion (`motion` package, imported from `motion/react`). Spring physics for meters, orbit animations for flock in HubView, `AnimatePresence` for modal enter/exit.

### External Integrations

- **Google Gemini API** — Optional "Spirit Oracle" hints. Requires `VITE_GEMINI_API_KEY` in `.env`.
- **Google Sheets** — Leaderboard via Apps Script webhook (`leaderboard.gs`). Script URL hardcoded in `GameOverModal.tsx`.

## Key Conventions

- Components use `React.FC` with `useGame()` hook for context access
- Modals follow pattern: `AnimatePresence` + `motion.div` with enter/exit animations, controlled by boolean state in GameContext
- Game action types are SCREAMING_SNAKE_CASE constants
- Path alias `@` maps to project root (configured in `vite.config.ts`)
- Production base path is `/sanctuary/` (GitHub Pages deployment)

## Design Document

`research.md` (27KB) contains the full technical design spec with detailed game mechanics, progression formulas, and sociological theory mappings. Consult this for gameplay design decisions.

## Known Issues

`visual-fixes.md` tracks ~20 known bugs and TODOs including orbit animation jumps, stale closures in Focus game, drag constraint issues, and missing exit animations.
