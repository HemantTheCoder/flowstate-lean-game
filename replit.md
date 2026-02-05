# FLOWSTATE - Saga of the Flow Architect

A browser-based game built with React, TypeScript, Express, and Phaser that teaches Lean Construction principles through visual novel narrative.

## Overview

This is a fullstack TypeScript application featuring:
- **Frontend**: React with Vite, using Phaser for game logic
- **Backend**: Express.js server
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

## Game Chapters

### Chapter 1: The Kanban Chronicles (PRESENTATION READY - VERIFIED)
- Teaches WIP Limits, Pull Systems, and Flow Management
- Days 1-5 with progressive difficulty
- Characters: Mira (PM), Rao (Supervisor), Old Foreman, Isha (Planner)
- **Day 1**: WIP limits introduction - control the Doing column
- **Day 2**: Supply chain variability - pivot to zero-cost tasks when materials run out
- **Day 3**: Monsoon Drift - rain blocks structural work, adapt with indoor tasks
- **Day 4**: Push vs Pull decision - critical choice with Day 5 consequences
- **Day 5**: Inspector review - outcome based on Day 4 choice
- **Tutorial**: 8-step interactive guide teaching Kanban board mechanics
- **Visual Polish**: All icons use Lucide, no external dependencies, responsive modals

**Efficiency System (Cumulative)**:
- Flow efficiency = (cumulative tasks completed / cumulative possible) * 100
- Increases progressively day-by-day if player completes all available work
- 100% achievable only if all possible tasks completed each day
- Day-specific constraints affect potential capacity:
  - Day 2: Only zero-cost tasks count (material shortage)
  - Day 3: Only non-Structural tasks count (weather)
  - Day 4-5: Push decision creates waste that reduces value-adding work
- Waste/rework tasks excluded from value calculation

**Chapter Complete Modal**:
- Interactive performance graph (cumulative + daily efficiency)
- Day-by-day breakdown with click-to-view insights
- "What Went Well" section with successes
- "How to Improve" section with prioritized tips (if below 100%)
- Key Learnings summary (WIP Limits, Pull System, Adaptation)
- Performance tiers: Master Flow Architect (90%+), Skilled Practitioner (70%+), etc.

### Chapter 2: The Promise System (Last Planner System)
- Teaches Should/Can/Will planning workflow
- Days 6-11 with constraint management and PPC review
- Characters: Client, Old Foreman, Isha, Advisor (Dr. Lean)
- Features: Planning Room UI, Constraint Removal, PPC Calculation, Badges
- **Distinct Visual Design**: Purple/indigo theme differentiates from Chapter 1's blue theme
- **Day Objective Banner**: Shows daily goals clearly at top of Planning Room
- **Tutorial Timing**: Tutorial only shows after story dialogue ends on Day 6
- **LPS Workflow Sidebar**: Visual progress tracker for SHOULD/CAN/WILL phases

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage interface
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared types/schemas
└── attached_assets/     # Static assets
```

## Development

The project runs on port 5000 with the Express server handling both the API and the Vite dev server in development mode.

**Start Command**: `npm run dev` - Runs tsx to start the Express server with embedded Vite

## Key Technologies

- **Phaser 3**: Game engine for interactive gameplay
- **Drizzle ORM**: Database schema and queries
- **Wouter**: Client-side routing
- **Framer Motion**: Animations
- **react-hook-form**: Form handling with Zod validation

## Deployment

- **Build**: `npm run build` - Compiles frontend with Vite and backend with esbuild
- **Start**: `npm run start` - Runs the production build
