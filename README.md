# Loupe — Jewelry Shoot Studio (Next.js)

A Next.js + React port of the Loupe jewelry ecommerce shoot generator demo.
No TypeScript — plain `.js`/JSX. Styling uses SCSS Modules with a shared
`styles/common.module.scss` for buttons, typography, badges, and layout
primitives that every component composes from.

## What this is

A fully working front-end with a **simulated** generation backend. There is
no real AI image/video model wired in — the "AI pipeline" is a canvas
compositing routine (`lib/canvasGen.js`) that re-stages your actual uploaded
photo under ten different studio treatments (box, front, side, 45°, top,
macro, model, lifestyle, social, video-frame), so the full product flow —
upload → configure → generate → review → export — works end to end.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/                  Next.js App Router entry (layout, root page, globals.scss)
components/           One folder per screen/component, each with its .js and .module.scss
context/AppContext.js Global state + all actions (upload, generate, regenerate, download, delete)
lib/
  constants.js         Asset types & option lists
  naming.js             Auto shoot name / SKU / Shoot ID generation
  canvasGen.js          Canvas-based mock asset compositing
  generation.js         Pure async queue + single-asset regenerate helpers
  storage.js             localStorage persistence (swap for a real API later)
  cx.js                   Tiny classnames-join helper
styles/
  _variables.scss        Design tokens (color, type, spacing, breakpoints)
  _mixins.scss             Responsive + shared style mixins
  common.module.scss        Shared button/typography/badge classes
```

## Notes for going further

- **Persistence**: swapped-in `lib/storage.js` uses `localStorage`. Replace
  its functions with real API calls to persist shoots server-side.
- **Real generation**: replace `lib/canvasGen.js` / `lib/generation.js` with
  calls to an actual image/video generation backend once one is wired up —
  the rest of the app (state, screens, ZIP export, dashboard) doesn't need
  to change.
- **ZIP export** uses `jszip` client-side and follows the
  `SKU_NN_Name.jpg` naming convention inside a per-asset-type folder.
# loupe
