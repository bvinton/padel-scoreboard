# Padel Scoreboard

Mobile-first, high-contrast live scoreboard for Padel, built with:

- Next.js (App Router)
- TypeScript (strict)
- TailwindCSS
- Zustand
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Architecture

- All match logic lives in `store/useMatchStore.ts`.
- The main UI is in `app/page.tsx` and only reads state & dispatches actions.
- Layout is mobile-first and locked to a single viewport height (`h-screen`) with giant tap targets for team scoring, a clear server indicator, undo control, and a toggle for the Punto de Oro (Golden Point) rule.

