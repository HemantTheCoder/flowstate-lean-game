## Packages
framer-motion | Essential for anime-style animations, dialogue reveals, and UI transitions
zustand | Simple global state management for complex game state (resources, kanban, flags)
lucide-react | Iconography for UI elements
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
The game uses a complex state object (GameState) that needs to be synced with the backend.
Game logic (chapters, weeks) drives the UI changes between Visual Novel view and Management view.
We will use Framer Motion for the "Visual Novel" typing effect and screen transitions.
The background should be an animated CSS gradient or SVG pattern to simulate an anime sky/city.
