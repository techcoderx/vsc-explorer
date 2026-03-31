# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Magi Blocks Explorer — a React SPA block explorer for the Magi network (Hive L2 smart contract platform). Built with TypeScript, React 19, Chakra UI, React Router, and TanStack React Query. Bundled with Vite.

## Commands

```bash
pnpm i              # Install dependencies
pnpm start          # Dev server (http://localhost:5173)
pnpm run build      # Type-check (tsc) + production build → dist/
pnpm test           # Run Vitest tests
pnpm lint           # ESLint (zero warnings enforced)
pnpm run preview    # Serve production build locally
```

## Code Style

- **Prettier**: single quotes, no semicolons, print width 130, no trailing commas
- **ESLint**: strict TypeScript rules, no unused locals/parameters, React Hooks rules enforced

## Network Configuration

Set `VITE_NETWORK` env var to `mainnet` (default), `testnet`, or `devnet`. Devnet endpoints are further overridable via `VITE_DEVNET_HIVE_API`, `VITE_DEVNET_BE_API`, `VITE_DEVNET_GQL_API`. See `.env.example`.

## Architecture

### API Layer (`src/requests.ts`, `src/cvRequests.ts`)

All backend communication lives here. Three API backends:

- **BE API** (REST) — block explorer data at `/be-api/v1`
- **GraphQL** — Magi L2 data at `/api/v1/graphql`
- **HAF API** — Hive L1 operations via PostgREST (configured via `VITE_HAF_BASE_URL` or falls back to BE API base)
- **CV API** — contract verification service (hardcoded endpoint in `src/settings.ts`)

API functions are consumed via TanStack React Query hooks (also in `requests.ts`).

### Network Config (`src/settings.ts`)

`getConf()` returns the active network's API URLs, Hive chain ID, and net ID. Theme colors are also exported from here.

### Routing (`src/App.tsx`)

React Router with `createBrowserRouter`. Page components live in `src/components/pages/`, with subdirectories for address views, bridge data, charts, and tools.

### Key Directories

- `src/components/pages/` — route-level page components
- `src/components/tables/` — reusable data table components
- `src/types/` — TypeScript interfaces organized by API source (`HafApiResult`, `L1ApiResult`, `L2ApiResult`, `CvResult`, `Payloads`)
- `src/helpers.ts` — shared utility functions (time formatting, number formatting, hash abbreviation, Hive username validation)
