# FLOWSTATE - Saga of the Flow Architect

A browser-based game built with React, TypeScript, Express, and Phaser.

## Overview

This is a fullstack TypeScript application featuring:
- **Frontend**: React with Vite, using Phaser for game logic
- **Backend**: Express.js server
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

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
