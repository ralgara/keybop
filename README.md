# KeyBop

A finger dexterity trainer for keyboard and piano players. KeyBop is a rhythm game-style web app that displays falling notes on a piano roll — you play along on your keyboard, earning points for accuracy and timing precision.

## How It Works

1. **Pick an exercise** from the menu (scales, Hanon patterns, speed drills)
2. **Press Start** and watch notes fall toward the hit zone
3. **Hit the right key at the right time** — timing determines your grade:
   - **PERFECT** (within 50ms) — 300 points
   - **GOOD** (within 120ms) — 100 points
   - **MISS** — 0 points, combo resets
4. **Build combos** for bonus multipliers on consecutive hits
5. **Review your results** with an accuracy breakdown at the end

## Default Key Map

The home row maps to a C major octave:

| Key | Note |
|-----|------|
| A   | C4   |
| S   | D4   |
| D   | E4   |
| F   | F4   |
| G   | G4   |
| H   | A4   |
| J   | B4   |
| K   | C5   |

Keys can be remapped in Settings. Custom bindings persist to localStorage.

## Controls

- **Escape** — pause / resume during gameplay
- **Settings** panel on the main menu for key remapping and speed toggle
- **Slow mode** (0.5x) available for practice

## Included Exercises

- **C Major Scale** — ascending and descending, 90 BPM (beginner)
- **Hanon Exercise #1** — finger independence pattern, 100 BPM (intermediate)
- **Quick Fingers** — mixed intervals with fast runs, 120 BPM (advanced)

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run lint      # run ESLint
```

## Technical Details

- **React + TypeScript** with Vite, strict mode
- **HTML Canvas** for the piano roll and all game rendering
- **Zero external dependencies** beyond React and Vite defaults
- **Engine/UI separation** — the game engine is pure TypeScript with no React imports; it owns the `requestAnimationFrame` loop and communicates with React through state snapshot callbacks (~15fps throttled to avoid interfering with 60fps canvas)
- **React Context + useReducer** for UI state (no Redux or other state libraries)
- **`event.code`** for key mapping (physical key position, layout-agnostic)
- **Beat-based sequences** in JSON, converted to milliseconds at load time for BPM flexibility
