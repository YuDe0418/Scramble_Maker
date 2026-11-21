# CUBEX · 3D Scramble Lab

CUBEX is a browser-based tool for generating and exploring 3×3 cube scrambles. Generate a scramble, replay it move by move, inspect all six faces, or export the current view as a PNG. The C++ scrambler can also run on its own.

## Get started on Windows 11

Use Node.js 22.12 or newer and a browser with WebGL 2 support, such as Chrome or Edge. The project was tested with Node.js 24. Open PowerShell in the project directory and run these commands.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5173/` in your browser. If that port is already in use, open the URL labeled `Local` in the terminal. Press `Ctrl+C` to stop the development server.

To build and preview the production version, run these commands.

```powershell
npm.cmd run build
npm.cmd run preview
```

The build output goes into `dist/`. The preview server defaults to `http://127.0.0.1:4173/`. To host the build, serve the contents of `dist/` over HTTP.

## Using CUBEX

| Feature | How to use it |
| --- | --- |
| Generate a scramble | Choose 18, 20, 22, or 25 moves and click **Generate Scramble**. The app shows the scrambled cube immediately and saves the sequence to history. The app opens with a 20-move example. |
| Play and navigate | **Play** starts at the current position. At the end of the sequence, it starts again from the solved state. Pause, resume, restart, step forward or backward, or select a move to jump to the state just after it. **Reset Cube** returns to move 0. |
| Change playback speed | Choose 0.5×, 1×, 2×, or 4×. Drag the timeline to any completed move. The active move is highlighted while it animates, including when playback is paused mid-turn. |
| Inspect the cube | Drag to orbit the cube. Scroll or pinch to zoom. **Isometric** switches between perspective and orthographic isometric views. **2D Net** shows all 54 stickers across six faces. During a turn, the net shows the state at the last completed move. |
| Export a PNG | Click **Export Image** and choose 1080×1080, 1920×1080, or 3840×2160. You can use a transparent background and include the scramble sequence. The 3D view exports the visible cube pose and camera angle. The 2D net exports the cube state shown in the net from the most recent 3D camera angle. |
| Manage scrambles | **Copy** copies the current scramble to the clipboard, and **TXT** downloads it. History keeps the 20 most recent scrambles. Select an entry to restore it or use the trash button to clear the history. |
| Sound and keyboard shortcuts | Toggle turn sounds in **Settings**. Sound is off by default. Press `Space` to play or pause, `←` or `→` to step through moves, and `G` to generate a new scramble. |

The 3D view and PNG export require WebGL 2. Scramble generation, history, and the 2D net remain available on devices without WebGL 2 support. The app stores history and the sound setting in the browser’s `localStorage`.

## Scramble rules and cube state

The **Random-Move Scrambler** uses Web Crypto to sample each move. It supports the faces `R L U D F B`, the counterclockwise suffix `'`, and the half-turn suffix `2`. Consecutive moves must use different axes, which prevents adjacent same-face moves and redundant same-axis sequences. A future random-state algorithm could implement the `ScrambleGenerator` type in [`src/engine/scrambleGenerator.ts`](src/engine/scrambleGenerator.ts).

In the solved state, white is up, yellow is down, green is front, blue is back, red is right, and orange is left. The engine stores each cubie’s position on an integer grid and its orientation as an orthogonal basis. Clockwise turns are defined as viewed from outside the face being turned. Animation interpolates only the nine cubies in the moving layer and settles on the next exact grid state after each turn. History stores the scramble, timestamp, move count, and final sticker arrangement. When restoring an entry, the app rebuilds the sequence of cube states and checks the final arrangement against the saved one.

## Tests

```powershell
npm.cmd test
npm.cmd run test:e2e
```

Unit tests cover turn directions, move identities, inverse sequences, sticker counts for all six colors, agreement between the renderer and cube state, playback interruptions, and rebuilding states from history. Playwright starts the local app server and uses an installed copy of Chrome to check playback, the 2D net, clipboard copying, TXT downloads, history, and all three PNG sizes. The PNG tests also compare sticker pixels with the 3D view and check the transparent background. To use an installed copy of Edge, set `$env:CUBEX_E2E_CHANNEL = 'msedge'` before running the end-to-end tests.
