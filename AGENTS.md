# Project Context & Guidelines

## Overview
This is a full-stack Asset Inventory & Maintenance Management application. It is designed to track corporate assets, their condition, maintenance schedules, and associated costs.

## Tech Stack
- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS
- **Backend**: Express API (`server.ts` compiled to `dist/server.cjs` via esbuild)
- **Database**: Cloud SQL (PostgreSQL) via Drizzle ORM
- **Authentication**: Firebase Authentication
- **Charting**: Recharts
- **AI Assistant**: Xiaomi MiMo (model `mimo-v2.5`), rendered with `react-markdown` and `remark-gfm`
- **Icons**: lucide-react

## Architecture & Data Flow
- **Client-Side**: The app uses `AssetContext` and `AuthContext` to manage global state. Components fetch data from the Express backend.
- **Server-Side**: The Express backend handles all database logic via endpoints (e.g., `/api/assets`, `/api/maintenance`).
- **AI Integration**: The Express backend exposes an `/api/ai/chat` endpoint that connects to `https://token-plan-sgp.xiaomimimo.com/v1`, passing the `MIMO_API_KEY`. The frontend uses `AiSidebar.tsx` to communicate with it.
- **Authentication**: The frontend retrieves a Firebase ID token (`auth.currentUser.getIdToken()`) and passes it in the `Authorization: Bearer <token>` header to the backend.
- **Database**: Schemas are declared in `src/db/schema.ts`. Ensure to update schemas only through Drizzle.

## Key Directories
- `src/components/`: Reusable UI components (modals, layouts, etc.).
- `src/context/`: React context providers for global state.
- `src/pages/`: Main application views (Dashboard, Inventory, Maintenance, Reports).
- `src/db/`: Drizzle ORM configuration and schema declarations.
- `src/lib/`: Core utilities and Firebase initialization.

## Rules & Development Guidelines for AI Agents
1. **Full-stack Execution**: Do not implement mock data. Always sync client features with real database endpoints mapped in `server.ts`.
2. **Database Schema**: Do not alter `schema.ts` without applying updates to the Cloud SQL database using the appropriate Drizzle DB tools.
3. **Authentication Boundary**: API requests must include the Firebase token. Backend routes should use `requireAuth` middleware to ensure endpoints are secure.
4. **Styling Constraints**: Utilize Tailwind CSS strictly. Do not introduce custom/inline CSS or generic component libraries unless specified. Use `cn()` from `src/lib/utils.ts` for dynamic class merging.
5. **Component Standards**: Only use functional components. Clean up side effects `(useEffect)` gracefully.
6. **Server Restarts**: If structural changes are made to `server.ts` or package configurations, make sure the dev server is restarted.
