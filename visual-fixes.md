# Visual Fixes Plan

## Likely Bugs / Broken Visuals

- [ ] 1. **Orbiting flock random jump** (HubView.tsx:60-61) — Seed random orbit values so generic flock dots don't re-randomize on every congregationSize change
- [ ] 2. **FocusGame stale closure** (RitualGame.tsx:358-376) — Fix rAF loop so holdTime vibration check works correctly
- [ ] 3. **Sorting drag constraints fight the user** (SortingGame.tsx:265) — Remove or widen dragConstraints so swiping feels natural
- [ ] 4. **Cursed card timer anti-pattern** (SortingGame.tsx:255) — Move onExplode call out of setState updater
- [ ] 5. **Bureaucracy buttons clipped on short screens** (BureaucracyGame.tsx:141) — Fix overflow so approve/deny buttons are always visible
- [ ] 6. **Typo: setSessionSessionScore** (SortingGame.tsx:68) — Rename to setSessionScore

## Layout / Overflow Issues

- [ ] 7. **Hardcoded pb-8 safe area** (GameLayout.tsx:69) — Use env(safe-area-inset-bottom) instead
- [ ] 8. **Hub evolution button pushed off-screen** (HubView.tsx:145) — Make hub scrollable or constrain content
- [ ] 9. **Sorting Trash/Sparkles icons clipped on narrow screens** (SortingGame.tsx:222-223) — Reduce offset or use responsive positioning
- [ ] 10. **Archive node labels overlap** (ArchiveView.tsx:76) — Shorten labels or add collision avoidance

## Visual Inconsistencies

- [ ] 11. **Sorting game identical at cult and sect** (SortingGame.tsx:72) — Not a visual fix, skip for now
- [ ] 12. **Bureaucracy bg mismatch** (BureaucracyGame.tsx:91) — Change bg-slate-900 to bg-slate-950
- [ ] 13. **StatsGlossary no exit animation** (StatsGlossaryModal.tsx:9) — Fix AnimatePresence pattern
- [ ] 14. **GameOverModal no exit animation** (GameOverModal.tsx:58) — Fix AnimatePresence pattern
- [ ] 15. **Sorting result no exit animation** (SortingGame.tsx:237) — Add exit animation to result label

## Accessibility / Touch Issues

- [ ] 16. **Rhythm game tap target not accessible** (RitualGame.tsx:243) — Add button role and keyboard support
- [ ] 17. **Sequence game buttons all identical** (RitualGame.tsx:328-341) — Add subtle visual differentiation
- [ ] 18. **No click-to-sort fallback on desktop** (SortingGame.tsx) — Add arrow buttons or click zones

## Performance Concerns

- [ ] 19. **Effervescence particles re-mount on render** (RitualGame.tsx:135-138) — Memoize particle array
- [ ] 20. **30+ infinite motion.divs for flock** (HubView.tsx:76-90) — Consider CSS animations or cap lower
