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
- **Day 1 is always forgiving**: forceSafeFlow = true so tutorial doesn't penalize efficiency
- Day-specific constraints affect potential capacity:
  - Day 1: Tutorial day - always 100% efficiency (no penalty)
  - Day 2: Only zero-cost tasks count (material shortage)
  - Day 3: Only non-Structural tasks count (weather)
  - Day 4-5: Push decision creates waste that reduces value-adding work
- Waste/rework tasks excluded from value calculation

**Daily Summary Modal**:
- Shows daily + cumulative efficiency from store's dailyMetrics
- "Today's Lesson" section with Lean concept name, explanation, and real construction example per day
- Day-specific insights based on performance

**Reflection Quiz** (after Day 5, before Chapter Complete):
- 5 multiple-choice questions testing WIP Limits, Pull vs Push, Adaptation, Bottleneck, Flow Efficiency
- Score passed to Chapter Complete modal for display
- **Missed Questions Recap**: Results screen shows which questions were wrong, correct answers, and explanations

**Day 5 "Finish Chapter" Button**:
- End Day button relabeled to "Finish Chapter" on Day 5
- Distinct amber/orange gradient styling to signal chapter conclusion
- Smart Advisor references "Finish Chapter" instead of "End Day" on Day 5

**Mobile Toolbar**:
- Tighter spacing (gap-1.5, px-2, text-[9px]) on small screens
- Consistent icon-only sizing on mobile, expanding on desktop

**GlossaryPanel**:
- Slide-out panel with 12 Lean Construction terms (WIP, Pull, Push, Flow, Waste, etc.)
- Search/filter functionality, categorized into Core Concepts, Flow States, Lean Principles
- Accessible via Glossary button in game toolbar

**Constraint Banners**:
- Day 2: Amber gradient banner showing "Material Shortage" with explanation
- Day 3: Blue gradient banner showing "Monsoon Warning" with blocked task info

**Smart Advisor**:
- Day-specific contextual Lean tips with construction examples
- Enhanced messages for Days 1-5 with Lean terminology

**Chapter Complete Modal**:
- Interactive performance graph (cumulative + daily efficiency)
- Day-by-day breakdown with click-to-view insights
- "What Went Well" section with successes
- "How to Improve" section with prioritized tips (if below 100%)
- Key Learnings with real-world construction examples for each concept
- Quiz score display with contextual feedback
- Performance tiers: Master Flow Architect (90%+), Skilled Practitioner (70%+), etc.

**Efficiency Bug Fix**:
- advanceDay() now runs BEFORE showing DailySummary, ensuring accurate efficiency display
- previousDoneCount delta calculation ensures correct task counting per day

### Chapter 2: The Promise System (Last Planner System) - PRESENTATION READY
- Teaches Should/Can/Will planning workflow
- Days 6-11 with constraint management and PPC review
- Characters: Client, Old Foreman, Isha, Advisor (Dr. Lean), Mira, Rao, Inspector
- Features: Planning Room UI, Constraint Removal, PPC Calculation, Badges
- **Distinct Visual Design**: Purple/indigo theme differentiates from Chapter 1's blue theme
- **Day Objective Banner**: Shows daily goals clearly at top of Planning Room
- **Tutorial Timing**: Tutorial only shows after story dialogue ends on Day 6
- **LPS Workflow Sidebar**: Visual progress tracker for SHOULD/CAN/WILL phases

**Rich Dialogue Narratives** (Days 6-11):
- Day 6: Planning Room introduction - SHOULD/CAN/WILL workflow explained
- Day 7: Constraint discovery - Old Foreman reveals hidden blockers
- Day 8: Make Ready process - Client pressure vs. proper preparation
- Day 9: Commitment day - pressure to overcommit vs. reliable promises
- Day 10: Execution day - Sound tasks flow smoothly
- Day 11: PPC Review - Inspector evaluates promise reliability

**Daily Summary Lean Lessons** (Days 6-11):
- Each day has concept name, detailed explanation, and real construction example
- Topics: Should/Can/Will, Constraints, Make Ready, Reliable Commitments, Execution, PPC

**Phase Transition Screen**:
- 3-step educational walkthrough when transitioning from Planning to Execution
- Step 1: "Planning Phase Complete" - constraint removal summary
- Step 2: "{N} Tasks Committed" - explains locked Weekly Work Plan promises
- Step 3: "Execution Begins" - Kanban board instructions
- Progress dots and animated transitions between steps

**Reflection Quiz** (Chapter 2):
- 5 multiple-choice questions: Should/Can/Will, Constraints, PPC, Overcommitment, Make Ready
- Chapter-aware: different questions for Chapter 1 vs Chapter 2
- Missed-question recap with correct answers and explanations
- Chapter-specific Key Takeaways section

**Chapter 2 Complete Modal**:
- PPC gauge with animated fill (green/yellow/red based on score)
- Performance tiers: Master Planner (90%+), Reliable Leader (80%+), Growing/Learning Planner
- Day-by-day expandable breakdown (Days 6-11) with LPS concepts and real-world examples
- Quiz score integration with contextual feedback
- Overcommitment detection warning
- Badges: Promise Keeper, Reliable Planner, Perfect Week, LPS Scholar
- Key Learnings with 4 real-world construction insights
- Budget and Morale stats display

**Day 11 Flow**:
- Day 11 dialogue -> End Day (amber "Finish Chapter" button) -> Daily Summary -> Quiz -> Chapter Complete
- PPC calculated after quiz, not during dialogue

**Glossary** (expanded):
- 4 categories: Core Concepts, Flow States, Lean Principles, Last Planner System
- 8 new LPS terms: LPS, Should/Can/Will, Constraint, Make Ready, Sound Activity, PPC, Weekly Work Plan, Reliable Promise
- Total: 20+ terms with definitions and examples

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
