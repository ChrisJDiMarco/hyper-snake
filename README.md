# Hyper Snake

A neon synthwave take on Snake, built as a Thinklet (Cabinet Next) panel. The arena is a tilted, perspective neon grid drawn with hand-written WebGL (no libraries), floating over a synthwave sun and mountains. Eat gems, chain combos, survive the speed-up, and grab power-ups (ghost, turbo, frenzy, shield, magnet, nova, freeze, payout and more). It has two camera views (arena and first person), named levels from NEON DAWN up to SNAKE GOD, achievements, lifetime stats and a top-5 runs board. The last saved build is version 45.

Built with Claude: Thinklet's builder on claude-sonnet-5-5, plus Claude Code, from 2026-10-10 to 2026-10-12.

## How to run

- **Inside Thinklet:** it's the "Hyper Snake" panel (id `wrrl5roo`, space "Fun").
- **Standalone:** open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and open it. Tested headless on 2026-10-16: the title screen and arena render without Thinklet. Without Thinklet, `window.cabinet` is missing, so scores are not saved between sessions and the panel commands are not wired up.

## What's in here

| Path | What it is |
|------|-----------|
| `index.html`, `style.css`, `js/` | The game as it runs in the panel (`gl.js` renderer, `game.js` rules, `main.js` UI/loop, `audio.js` synth sound) |
| `thinklet/spec-prompt.md` | The original spec prompt the panel was built from |
| `thinklet/panel.json` | The full panel entry from Thinklet's `Panels.json`: title, prompt, version log, panel commands, memory keys, build costs |
| `thinklet/memory.json` | Saved game state from Thinklet (high scores, runs, stats, achievements) |
| `thinklet/poster.jpg` | The panel's poster thumbnail |
| `history/versions/*.json` | The last 20 saved versions from Thinklet. Each one holds the full source of every file (`files`) plus the panel state at that point. File names are millisecond timestamps |

## Original location

`~/Library/Application Support/Cabinet Next/Panels/Panels/wrrl5roo` (versions in `.../Panels/Panels/versions/wrrl5roo`). Backed up on 2026-10-16.
