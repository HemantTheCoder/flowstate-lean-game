# Walkthrough - FLOWSTATE Chapter 1

I have implemented the core foundation and the first chapter of Flowstate.

## Features Implemented

### 1. Home Screen
-   Anime-style intro screen with "Start", "Settings", and "Multiplayer (Coming Soon)".
-   Credits to Hemant Kumar as requested.

### 2. Core Game Loop
-   **React + Phaser Integration**: The game runs on a hybrid engine.
    -   **Phaser**: Renders the isometric construction site and workers in the background. Isometrics workers move faster/slower based on your management!
    -   **React**: Handles the UI overlays (HUD, Kanban Board, Dialogues).

### 3. Chapter 1: Kanban System
-   **Kanban Board**: A fully interactive board where you can view tasks and tasks flow through columns (Backlog -> Ready -> Doing -> Done).
-   **WIP Limits**: You can set WIP limits on columns.
-   **Visual Feedback**:
    -   If you respect WIP limits -> Workers move smoothly (Green Flow Status).
    -   If you overload columns -> Workers slow down/stop (Red Congestion Status).

### 4. Narrative System
-   **Dialogue Box**: A visual novel style text box with character names and emotions.
-   **Intro Story**: "Mira" and "Architect" introduce the chaos and the need for Kanban.

### 5. Progression
-   **Day/Week Cycle**: You can "End Day" to advance time.
-   **Debrief Screen**: At the end of the week (Day 5), a Debrief screen appears showing your **Lean Performance Index (LPI)**.

## How to Verify
1.  Run the app.
2.  Click **Start Game**.
3.  Read the Intro Dialogue.
4.  Open the **Kanban** menu (Chart Icon).
5.  Observe the Background Workers.
6.  Click **End Day** until Week 1 finishes to see the Debrief.

## Next Steps
-   Implement Chapter 2 (Last Planner System).
-   Add more tasks and character interactions.
### Deployment
The game is deployed to Vercel
https://flowstate-lean-game.vercel.app/
