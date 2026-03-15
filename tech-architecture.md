# Technical Architecture & Guidelines

## Tech Stack
- Next.js (App Router)
- TypeScript (Strict mode enabled)
- TailwindCSS for styling
- Zustand for state management
- Lucide React for UI icons

## State Management (Zustand) Rules
- All game logic must be isolated within the Zustand store (`useMatchStore`). 
- UI components should be "dumb" and only dispatch actions (e.g., `incrementTeam1()`, `undoLastPoint()`) and read state.
- The store must maintain an array of previous states to easily implement an `undo` function (pop the last state off the stack and apply it).

## UI/UX Guidelines
- **Mobile-First:** The app will be used primarily on smartphones held in portrait mode outdoors.
- **High Contrast:** Use highly legible, bold fonts (e.g., Tailwind's `text-slate-900` vs `text-white` or vibrant neon accents often used in Padel branding).
- **Fat Finger Friendly:** The buttons to increment the score must take up at least 40% of the screen height each. Prevent accidental double-taps.
- **No Scrolling:** The entire scoreboard, server indicator, and undo button must fit on a single viewport height (`h-screen`).