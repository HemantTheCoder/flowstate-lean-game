# FlowState: A Lean Construction Learning Game

## Overview

FlowState is a browser-based educational game that teaches Lean Construction principles through an interactive visual novel narrative. Players take on the role of a junior Lean Architect assigned to guide construction teams through increasingly complex projects, learning core Lean methodologies — Kanban, Last Planner System (LPS), 5S, and Pull/Just-In-Time (JIT) — by making real management decisions and seeing their consequences unfold in real time.

The game combines story-driven dialogue with hands-on simulation mechanics. Each chapter introduces a distinct Lean principle through a unique gameplay system, ensuring that players don't just read about Lean — they practice it.

---

## How FlowState Teaches

FlowState uses a **"learn by doing"** pedagogical approach structured around four pillars:

1. **Narrative Context:** Each chapter is set in a realistic construction scenario (residential pier, shopping mall, maintenance depot, airport terminal). Characters like Mira (Project Manager), Rao (Traditional Foreman), and Isha (Junior Planner) debate and demonstrate Lean vs. traditional thinking through dialogue, creating a memorable story context for each principle.

2. **Interactive Simulation:** Rather than presenting slides or quizzes alone, each chapter features a unique gameplay system — a Kanban board, a planning room, a depot organizer, or a logistics dashboard — that directly models the Lean tool being taught. Players manipulate these systems, making choices with real in-game consequences (funds lost, morale dropped, lives spent).

3. **Dynamic Events & Consequences:** Each day introduces scenario-specific disruptions — monsoon rain, supply delays, client pressure, truck breakdowns — that force players to apply the Lean principle under stress. Wrong decisions (overloading WIP, accepting unready tasks, ignoring hazards) produce immediate negative feedback, reinforcing the correct approach.

4. **Reflective Feedback:** At the end of each chapter, players receive a detailed performance summary with animated metrics, a letter grade (S/A/B/C/D), a radar or bar chart breakdown, key learnings, and earned badges. An exportable PDF report reinforces retention and allows players to review their decisions.

---

## Chapter Breakdown

### Chapter 1: Kanban — "The Jam at Juniper Pier" (Days 1–5)

**What It Teaches:** Work-In-Progress (WIP) limits, flow-based task management, Pull vs. Push thinking, and resource starvation recovery.

**Gameplay:** Players manage a four-column Kanban board (Backlog → Ready → Doing → Done), dragging construction tasks through the workflow while managing a WIP limit slider. Overloading the Doing column triggers visual congestion warnings and morale penalties. Players balance funds ($2,500 starting budget with $250/day overhead) and materials (300 units) while navigating daily events — a concrete delivery delay on Day 2 forces prioritizing zero-cost prep tasks; a monsoon on Day 3 blocks outdoor structural work; and on Day 4, the foreman pressures the player to "Push" tasks for an inspector visit, testing whether the player chooses reliable Pull flow over the illusion of busyness.

**Key Learning Outcomes:** Understanding that limiting active work increases throughput; adapting plans to handle variation without losing productivity; recognizing that Push creates waste while Pull creates value.

---

### Chapter 2: Last Planner System — "The Riverside Market Mall" (Days 6–11)

**What It Teaches:** Constraint analysis, reliable promising (Should → Can → Will planning), Percent Plan Complete (PPC), and reasons analysis for failed commitments.

**Gameplay:** A dedicated Planning Room replaces the simple Kanban view. Players follow the LPS workflow: first pulling tasks into a Lookahead window (Should), then identifying and removing constraints — Material, Crew, Approval, and Weather blockers displayed as red icons — by spending funds or morale (Can), and finally committing only "sound" (constraint-free) tasks to the Weekly Work Plan (Will). On Day 8, surprise complications add new constraints to previously cleared tasks. On Day 9, the client pressures the player to commit unready tasks, forcing a choice between reliability and speed. PPC — the ratio of completed promises to total promises — is the primary success metric, reinforced through a "Reasons Analysis" debrief showing why any promises were broken.

**Key Learning Outcomes:** Learning that a 100% completion rate on a small plan beats 40% on an overcommitted one; proactively identifying blockers before they hit the site; building trust through reliable commitments.

---

### Chapter 3: 5S Methodology — "The Tangled Depot" (Days 12–16)

**What It Teaches:** Sort (Seiri), Set in Order (Seiton), Shine (Seiso), Standardize (Seiketsu), and Sustain (Shitsuke) for workplace organization, safety, and visual management.

**Gameplay:** A unique Workspace Depot grid replaces the Kanban board. Players drag items — tools, materials, and waste — into designated zones: a Tool Shadow Board, Material Storage, and a Red Tag Area. The game enforces the 5S steps chronologically: Day 12 (Sort) only allows moving broken/waste items to the Red Tag Area; Day 13 (Set in Order) unlocks tool and material placement; Day 14 (Shine) introduces clickable hazards (oil spills, frayed cables) that must be cleaned. Day 15 (Standardize) tests all previous steps when a new delivery arrives unorganized. Day 16 (Sustain) is a final audit. A live 5S Grade updates in real time based on correct placements and hazard removal, visualized in a radar chart at chapter end.

**Key Learning Outcomes:** Understanding that clutter directly slows work and creates safety hazards; building systems where anyone can find any tool in under 30 seconds; recognizing that Sustain — maintaining standards when no one is watching — is the hardest and most important step.

---

### Chapter 4: Pull Systems & JIT — "Midfield Terminal" (Days 1–12)

**What It Teaches:** Pull-based material flow, Just-In-Time delivery, the Bullwhip Effect, demand smoothing, safety buffers, and takt time planning.

**Gameplay:** A three-panel logistics dashboard introduces supply chain management. The Pull Board lets players set WIP limits per trade (Carpentry, Finishing, Electrical) using sliders, with visual Kanban cards showing capacity. The JIT Scheduler allows ordering materials with specific lead times and costs, with options to expedite shipments at 1.5x cost or set safety buffer levels. A Site Map Overlay visualizes three airport zones (Baggage Claim, Security Hall, VIP Lounges) with strict storage capacities — exceeding them triggers overcapacity penalties. Day 3 simulates the Bullwhip Effect when the crew over-orders materials; Day 4 introduces a supply shock (truck breakdown) testing whether safety buffers hold.

**Key Learning Outcomes:** Matching deliveries to actual demand rather than forecasts; understanding that smaller, more frequent deliveries improve flow; balancing protection against variability with the waste of excess inventory.

---

## Unique Features

| Feature | Description |
|---|---|
| **Visual Novel Narrative** | Story-driven learning with recurring characters (Mira, Rao, Isha) who embody Lean vs. traditional thinking through animated dialogue with emotion states |
| **Four Unique Gameplay Systems** | Each chapter features its own interactive mechanic (Kanban board, Planning Room, Depot Organizer, Logistics Dashboard) rather than repeating a single format |
| **Real-Time Performance Metrics** | Animated counters track Flow Efficiency, PPC, Team Morale, WIP Compliance, and Bullwhip Index with live visual feedback |
| **Performance Grading & Badges** | Letter grades (S through D) with animated effects, plus unlockable achievement badges (Flow Master, Promise Keeper, 5S Auditor, JIT Strategist) |
| **Exportable PDF Reports** | One-click generation of detailed performance reports with day-by-day breakdowns, key decisions, and learnings for each chapter |
| **Global Leaderboard** | Competitive ranking system tracking total score, efficiency, and PPC across all players |
| **Progressive Web App** | Installable on mobile and desktop with offline support, enabling learning anywhere |
| **Dual Save System** | Automatic progress saving via local storage (guest) and cloud database (registered users) with full resume capability |
| **Knowledge Check Quizzes** | End-of-chapter reflection quizzes testing core principles, with scores factored into the final grade |

---

## Technical Stack

Built with React, TypeScript, Express.js, PostgreSQL, Phaser 3, Zustand (state management), Tailwind CSS, and Framer Motion. The application runs as a full-stack web app with PWA capabilities and procedurally generated sound effects via the Web Audio API.

---

*FlowState transforms Lean Construction education from passive reading into active decision-making, letting players experience firsthand why WIP limits prevent congestion, why reliable promises build trust, why organized workspaces save time, and why pulling materials to demand eliminates waste.*
