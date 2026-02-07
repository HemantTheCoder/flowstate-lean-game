# FLOWSTATE - Saga of the Flow Architect

## Overview

FLOWSTATE is a browser-based game designed to educate players on Lean Construction principles through an interactive visual novel narrative. Built with React, TypeScript, Express, and Phaser, it provides an engaging fullstack experience. The game focuses on simulating real-world construction scenarios where players apply Lean methodologies to improve project efficiency and reliability. Its key capabilities include teaching Work-In-Progress (WIP) limits, Pull Systems, Flow Management, and the Last Planner System (LPS) through two distinct chapters. The project aims to provide an accessible and interactive learning platform for construction professionals and students, fostering a deeper understanding of Lean practices and their practical application.

## User Preferences

- I prefer a clear and concise communication style.
- I appreciate detailed explanations for complex concepts.
- I like iterative development, with frequent updates and feedback.
- Ask me before making any major architectural changes or introducing new dependencies.
- Ensure the game logic and educational content remain the top priority.
- Do not make changes to the `attached_assets` folder without explicit instruction.

## System Architecture

The project is a fullstack TypeScript application comprising a React frontend with Phaser for game logic, and an Express.js backend. Tailwind CSS with shadcn/ui components is used for styling, Zustand for state management, and TanStack Query for data fetching.

**UI/UX Decisions:**
- **Thematic Chapters:** Chapter 1 utilizes a blue theme for Kanban concepts, while Chapter 2 uses a purple/indigo theme for the Last Planner System, providing clear visual differentiation.
- **Responsive Design:** Mobile toolbars and components are optimized for smaller screens, with consistent icon sizing.
- **Interactive Modals:** Use interactive, responsive modals for daily summaries, chapter completion, and reflection quizzes.
- **Contextual Help:** LeanTooltipText highlights and defines Lean terms in dialogue, enhancing learning.
- **Visual Kanban:** Task cards are color-coded by type (Structural, Systems, Interior, Management) with badges and borders.

**Technical Implementations:**
- **Game Engine:** Phaser 3 is used for interactive gameplay elements, particularly for the Kanban board and planning room interactions.
- **State Management:** Zustand manages global and game-specific states, including player progress, efficiency metrics, and audio settings.
- **Routing:** Wouter is used for client-side routing within the React application.
- **Animations:** Framer Motion is employed for smooth UI transitions and animations.
- **Form Handling:** react-hook-form with Zod validation is used for robust form management.
- **Audio System:** A dual-layer audio architecture uses the Web Audio API for synthesized sound effects (22+ SFX) and Howler.js for background music streamed from a CDN. Audio logic adapts BGM based on game state (e.g., "tense" music for high WIP).

**Feature Specifications:**
- **Chapter 1: The Kanban Chronicles:** Teaches WIP Limits, Pull Systems, and Flow Management through a 5-day simulation. Includes a tutorial, efficiency tracking, daily summaries with Lean lessons, and a reflection quiz. Features constraint banners and a Smart Advisor for contextual tips.
- **Chapter 2: The Promise System (Last Planner System):** Teaches Should/Can/Will planning via a 6-day simulation. Features a Planning Room UI, constraint removal mechanics, PPC calculation, and a "Fragile/Risky Task System" to simulate overcommitment consequences. Includes an event system to introduce dynamic challenges.
- **Performance Dashboard:** A `/dashboard` route provides a comprehensive overview of player performance, including efficiency, PPC, morale, and waste removed, with trend charts and a day-by-day breakdown.
- **Leaderboard:** A database-backed `/leaderboard` tracks and displays player scores, filtered by chapter, with weighted scoring based on efficiency, PPC, and quiz results.
- **PDF Export:** Chapter completion modals offer an "Export Report" button to generate a detailed PDF report of player performance, key decisions, and learnings using jsPDF.

**System Design Choices:**
- **Modularity:** The project structure separates client, server, and shared logic, promoting maintainability.
- **Data Persistence:** Game state and player progress are managed to allow for consistent gameplay experience across sessions.
- **Education Integration:** Lean Construction principles are woven into dialogue, gameplay mechanics, and post-day summaries, reinforced by quizzes and explanations.

## External Dependencies

- **Phaser 3:** Game engine for interactive gameplay.
- **Drizzle ORM:** Database Object-Relational Mapper.
- **Wouter:** Client-side routing library.
- **Framer Motion:** Animation library.
- **react-hook-form:** Library for form handling.
- **Zod:** Schema declaration and validation library (used with react-hook-form).
- **Zustand:** State management library.
- **TanStack Query:** Data fetching library.
- **Tailwind CSS:** Utility-first CSS framework.
- **shadcn/ui:** UI component library built with Tailwind CSS.
- **Howler.js:** JavaScript audio library for background music (streaming from Pixabay CDN).
- **jsPDF:** Library for generating PDF documents.
- **PostgreSQL:** Relational database for leaderboard and player data storage.
- **Lucide:** Icon library (used for all UI icons).