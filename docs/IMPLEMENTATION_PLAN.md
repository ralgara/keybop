# KeyBop MVP — Implementation Plan

## Overview

Build a finger dexterity trainer web app (rhythm game style). Users see falling notes on a piano roll canvas and press keyboard keys in time. The MVP covers: piano roll display, configurable keyboard input, scoring (accuracy + timing), practice modes (normal/slow), and visual feedback.

**Tech choices:** React + TypeScript, Vite, HTML Canvas, React Context (useReducer), no external deps beyond Vite defaults.

---

## Architecture

### Engine / UI Separation

The game engine is **pure TypeScript** (no React imports). It owns the `requestAnimationFrame` loop and emits state snapshots to React via a callback. React handles menus, HUD overlay, and settings — never touches the canvas directly.

```
React UI (menus, HUD, settings)
    ↕ state snapshots + control methods
Game Engine (rAF loop, pure TS)
    ├── TimingSystem     — clock, delta-time, speed multiplier
    ├── NoteManager      — spawn/advance/expire falling notes
    ├── InputHandler     — keyboard events → normalized InputEvents
    ├── ScoringEngine    — timing window evaluation, combo, score
    └── Renderer         — all canvas drawing
```

### Key Design Decisions

- **`event.code`** (not `event.key`) for key mapping — physical key position, layout-agnostic
- **Beat-based sequences** in JSON, converted to ms at load time — allows different BPMs
- **State snapshot throttling** — engine emits to React at ~15fps to avoid re-render interference with 60fps canvas
- **MIDI extension point** — `InputEvent` interface is input-source-agnostic; future `MidiInputHandler` slots in without engine changes

---

## Timing / Scoring

| Grade   | Window   | Points | Combo       |
|---------|----------|--------|-------------|
| PERFECT | <= 50ms  | 300    | +1          |
| GOOD    | 51-120ms | 100    | +1          |
| MISS    | > 120ms  | 0      | reset to 0  |

Score bonus: `points * (1 + combo * 0.1)`

### Combo System

- Each PERFECT or GOOD hit increments combo by 1
- Each MISS resets combo to 0
- maxCombo tracks the highest combo achieved during the session

### Timing Details

- InputHandler captures `performance.now()` at keydown
- Compared against note's `targetTime` (offset from game start time)
- Both values on same clock (`performance.now()`)
- For slow-motion, `targetTime` values scaled by `1 / speedMultiplier`

---

## File Structure

```
src/
├── main.tsx, App.tsx, App.css, index.css
├── types/
│   ├── note.ts          — Note, NoteEvent, ActiveNote
│   ├── sequence.ts      — Sequence, SequenceMetadata
│   ├── scoring.ts       — HitResult, ScoreSnapshot, TimingGrade, FeedbackEvent
│   ├── input.ts         — KeyMapping, ResolvedMapping, InputEvent
│   ├── game.ts          — GameState, GameStatus, GameConfig
│   └── index.ts         — re-exports
├── engine/
│   ├── constants.ts     — timing windows, colors, dimensions, scoring values
│   ├── TimingSystem.ts  — clock, delta-time, speed multiplier, pause/resume
│   ├── NoteManager.ts   — spawn/advance/expire notes from sequence data
│   ├── ScoringEngine.ts — evaluate input, combo tracking, feedback queue
│   ├── InputHandler.ts  — keyboard listener, configurable key→note mapping
│   ├── Renderer.ts      — all canvas drawing
│   └── GameEngine.ts    — orchestrator: rAF loop, wires subsystems, emits state
├── data/
│   ├── sequences/
│   │   ├── c-major-scale.json
│   │   ├── hanon-01.json
│   │   └── custom-example.json
│   ├── defaultKeyMap.ts — default QWERTY home-row mapping (A=C4, S=D4, ...)
│   └── sequenceLoader.ts — validate JSON, convert beats→ms
├── context/
│   ├── GameContext.tsx   — React Context + provider + useReducer
│   └── actions.ts       — action types and creators
├── hooks/
│   ├── useGameEngine.ts — bridge canvas ref to engine, expose start/pause/stop
│   └── useGameState.ts  — convenience hook for consuming GameContext
├── components/
│   ├── GameScreen.tsx       — main game view: canvas + HUD, Escape to pause
│   ├── PianoRollCanvas.tsx  — thin <canvas> wrapper, passes ref to useGameEngine
│   ├── HUD.tsx              — score/combo/grade DOM overlay on canvas
│   ├── MainMenu.tsx         — start screen: sequence selector + settings
│   ├── SequenceSelector.tsx — list available exercises
│   ├── SettingsPanel.tsx    — key map editor + speed toggle
│   ├── KeyMapEditor.tsx     — interactive click-to-assign key binding UI
│   └── ResultsScreen.tsx    — post-exercise score summary
└── utils/
    ├── clamp.ts
    ├── lerp.ts
    └── noteNames.ts         — noteToMidiNumber / midiNumberToNote
```

---

## Module Specifications

### GameEngine (`src/engine/GameEngine.ts`)

Central orchestrator. Owns the rAF loop. Delegates to subsystems each frame.

```typescript
class GameEngine {
  constructor(canvas: HTMLCanvasElement, config: GameConfig, onStateChange: callback);
  start(): void;    // begin rAF loop
  pause(): void;    // cancel rAF, freeze timing
  resume(): void;   // restart rAF from paused
  stop(): void;     // end session, compute final score
  destroy(): void;  // cleanup listeners, cancel rAF

  // tick() calls in order:
  //   1. timing.update(timestamp)
  //   2. noteManager.update(deltaTime)
  //   3. scoringEngine.evaluateExpiredNotes()
  //   4. renderer.draw()
  //   5. emit state snapshot to React via onStateChange
}
```

### Renderer (`src/engine/Renderer.ts`)

Per-frame drawing pipeline (in order):
1. Clear canvas
2. Draw background (dark theme)
3. Draw lane lines (vertical, one per note in key map)
4. Draw lane labels (key name at bottom of each lane)
5. Draw hit zone (horizontal band at 85% canvas height)
6. Draw falling notes (rounded rects with note name, color by state)
7. Draw hit/miss feedback (floating text with fade-out animation)
8. Draw combo counter (pulsing "x{combo}" near hit zone)
9. Draw progress bar (thin bar at top)

### NoteManager (`src/engine/NoteManager.ts`)

```typescript
interface ActiveNote {
  id: string;           // unique per instance
  noteId: string;       // e.g. "C4"
  laneIndex: number;
  targetTime: number;   // ms when it should cross hit zone
  y: number;            // current canvas Y position
  state: 'falling' | 'hit' | 'missed' | 'expired';
}
```

Each frame: spawn notes within lead time, update Y positions, mark expired notes.

### ScoringEngine (`src/engine/ScoringEngine.ts`)

On input: find nearest falling note in same lane, compute timeDelta, grade it, update score/combo, push FeedbackEvent to queue. Renderer drains feedback queue each frame.

### InputHandler (`src/engine/InputHandler.ts`)

Listens for keydown/keyup on window. Resolves `event.code` to noteId via configurable `KeyMapping`. Produces `InputEvent { noteId, laneIndex, timestamp, type }`. Extension point: future MidiInputHandler produces same InputEvent shape.

### Key Mapping

```typescript
interface KeyMapping {
  bindings: Record<string, string>;  // event.code → noteId, e.g. { "KeyA": "C4" }
}
```

Default mapping uses home row: A=C4, S=D4, D=E4, F=F4, G=G4, H=A4, J=B4, K=C5.
Custom mappings persisted to localStorage key `keybop-keymap`.

### Sequence Data Model

```typescript
interface Sequence {
  metadata: {
    id: string; title: string; description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    bpm: number; timeSignature: [number, number]; tags: string[];
  };
  notes: Array<{
    noteId: string;       // e.g. "C4"
    beatPosition: number; // 0-indexed, fractional OK
    duration: number;     // in beats (visual length)
  }>;
}
```

Beat→ms conversion: `targetTimeMs = (beatPosition / bpm) * 60000`

### React Context

```typescript
interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'finished';
  selectedSequence: Sequence | null;
  config: GameConfig;
  score: ScoreSnapshot;
  keyMap: KeyMapping;
  speedMultiplier: number;
  availableSequences: SequenceMetadata[];
}
```

Uses `useReducer`. Actions dispatched from UI events and engine's `onStateChange` callback.

### Component Hierarchy

```
<App>
  <GameContextProvider>
    <MainMenu />                  // when status === 'menu'
      <SequenceSelector />
      <SettingsPanel />
        <KeyMapEditor />
    <GameScreen />                // when status === 'playing' | 'paused'
      <PianoRollCanvas />
      <HUD />
    <ResultsScreen />             // when status === 'finished'
  </GameContextProvider>
</App>
```

### Constants (`src/engine/constants.ts`)

```typescript
TIMING_WINDOWS = { PERFECT: 50, GOOD: 120 }  // ms
SCORING = { PERFECT_POINTS: 300, GOOD_POINTS: 100, MISS_POINTS: 0, COMBO_MULTIPLIER: 0.1 }
CANVAS = { DEFAULT_WIDTH: 800, DEFAULT_HEIGHT: 600, HIT_ZONE_Y_RATIO: 0.85, NOTE_HEIGHT: 30, NOTE_WIDTH: 60, LANE_GAP: 10 }
COLORS = { BACKGROUND: '#1a1a2e', LANE_LINE: '#16213e', HIT_ZONE: '#e94560', NOTE_FILL: '#0f3460', NOTE_PERFECT: '#00ff88', NOTE_GOOD: '#ffcc00', NOTE_MISS: '#ff4444', TEXT: '#eaeaea' }
SPEED_MULTIPLIERS = { SLOW: 0.5, NORMAL: 1.0 }
```

---

## Implementation Phases (ordered, build each on the previous)

### Phase 1: Scaffold + Types [DONE]
1. Vite react-ts scaffold — COMPLETE
2. Create all type definitions (`src/types/`)
3. Create constants (`src/engine/constants.ts`)
4. Create utilities (`src/utils/`)

### Phase 2: Engine Core
5. `TimingSystem` — clock, delta-time, speed multiplier, pause/resume
6. `NoteManager` — spawn from sequence data, advance Y positions, expire past hit zone
7. `ScoringEngine` — evaluate input against nearest note, combo tracking, feedback queue
8. `InputHandler` — keydown/keyup listeners, configurable key→note mapping
9. Sequence loader + default key map + 3 example JSON sequences

### Phase 3: Rendering
10. `Renderer` — background, lanes, hit zone, falling notes, feedback text, combo counter, lane labels

### Phase 4: Engine Assembly
11. `GameEngine` — wire all subsystems, rAF loop, `onStateChange` callback to React

### Phase 5: React Integration
12. `GameContext` + reducer (status: menu/playing/paused/finished, score snapshot, config)
13. `useGameEngine` hook — bridge canvas ref to engine, expose start/pause/stop
14. `PianoRollCanvas` — thin `<canvas>` wrapper
15. `HUD` — score/combo/grade DOM overlay
16. `GameScreen` — composes canvas + HUD, Escape to pause

### Phase 6: Menus & Settings
17. `SequenceSelector` — list exercises, select one
18. `KeyMapEditor` — click-to-assign interactive key binding UI, persists to localStorage
19. `SettingsPanel` — key map editor + speed toggle
20. `MainMenu` — composes selector + settings + Start button
21. `ResultsScreen` — final score, accuracy breakdown, play again / back to menu
22. `App.tsx` — conditional rendering by game status

### Phase 7: Polish
23. Dark theme styling, responsive canvas sizing
24. End-to-end playtest of all exercises

---

## Verification Checklist

1. `npm run dev` — app loads, main menu renders
2. Select C Major Scale -> Start -> notes fall on canvas at correct BPM
3. Press mapped keys -> PERFECT/GOOD/MISS feedback appears, score updates in HUD
4. Combo counter increments on consecutive hits, resets on miss
5. Toggle slow-motion in settings -> notes fall at half speed
6. Remap keys in KeyMapEditor -> new keys work immediately
7. Exercise completes -> results screen shows accuracy breakdown
8. "Play Again" returns to same exercise; "Menu" returns to main menu
