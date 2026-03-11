# Miniscript Lab — replit.md

## Overview

Miniscript Lab is a **scenario-first, spending-path-centered Bitcoin Miniscript educational playground**. Its core philosophy is "show the user *who can spend, when, and how* before exposing Policy, Miniscript, Script, and Address."

Key product constraints:
- **Pure frontend** — no blockchain connections, no private keys, no transaction broadcasting
- **Address generation only on testnet/regtest/signet** — never mainnet
- **All state lives in `localStorage`** — no server-side persistence
- **MVP targets P2WSH (SegWit v0)** — Taproot (P2TR) is planned for V2
- **No LLM/AI API calls** — all computation is deterministic and local
- **Bilingual (Chinese/English)** — Chinese is the primary language

The app has three main routes:
1. `/` — Scenario gallery (pre-built spending condition templates)
2. `/playground` — Full three-column IDE (Policy editor → Path map → Results tabs)
3. `/compare` — Coming soon (policy comparison mode)

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend Framework
**Next.js 14 (App Router) with React 18**, TypeScript strict mode. The app is essentially a client-side SPA despite using Next.js — nearly all components are `'use client'` because the entire experience is interactive.

- Pages: `src/app/` using App Router conventions
- Components: `src/components/` organized by feature area (`playground/`, `flow/`, `results/`, `scenarios/`, `shared/`, `layout/`, `ui/`)
- Fonts: `Plus Jakarta Sans` (body) + `IBM Plex Mono` (code) loaded via `next/font/google`

### State Management
**Zustand** (`src/lib/stores/playground-store.ts`) is the single source of truth for the playground. It holds:
- `policy` string (the raw user input)
- `keyVariables` array (name → public key mappings)
- `context` (`wsh` | `tr`) and `network` (`testnet` | `regtest` | `signet`)
- `compilationResult`, `compilationError`, `semanticTree`, `spendingPaths`
- Interactive simulation state: `availableKeys`, `availableHashes`, `currentTimeBlocks`
- UI state: `activeResultTab`, `isLeftPanelOpen`, `isRightPanelOpen`

### Compilation Pipeline
Located in `src/lib/engine/`:

1. **`compiler.ts`** — Orchestrates the full pipeline:
   - Replaces key name aliases with real compressed public keys
   - Calls `@bitcoinerlab/miniscript-policies` to compile Policy → Miniscript
   - Calls `@bitcoinerlab/miniscript` for `satisfier()` to enumerate spending paths
   - Calls `@bitcoinerlab/descriptors` + `bitcoinjs-lib` to generate descriptors and addresses
   - Returns a `CompilationResult` + array of `SpendingPath` objects

2. **`miniscript-parser.ts`** — Parses Miniscript string → `MiniscriptNode` tree (custom recursive descent parser that strips wrappers like `v:`, `a:`, etc.)

3. **`path-analyzer.ts`** — Converts raw `satisfier()` output (ASM strings) into structured `SpendingPath` objects with typed `PathCondition` arrays (signature, timelock_relative, timelock_absolute, hashlock)

4. **`time-utils.ts`** — Block count ↔ human-readable time conversions, `isOlderSatisfied()` / `isAfterSatisfied()` helpers, bilingual output

### Compilation Trigger
**`useCompiler` hook** (`src/lib/hooks/useCompiler.ts`) — debounces (500ms) policy/state changes and calls `compile()` asynchronously. Uses a generation counter to discard stale results.

### Visualization
**React Flow (`@xyflow/react`) + Dagre** for the spending path map:
- `src/lib/flow/tree-to-flow.ts` — Converts `MiniscriptNode` tree to React Flow nodes/edges using Dagre for automatic layout
- Node types: `root`, `operator` (AND/OR), `condition` (key/timelock/hashlock)
- Node status: `satisfied` (green), `pending` (orange), `missing` (gray) — driven by current simulation state
- Edge style: solid for AND relations, dashed for OR

### Code Editor
**CodeMirror 6** (`@codemirror/view`, `@codemirror/state`, `@codemirror/commands`) with a custom Policy syntax highlighting extension (`src/lib/editor/policy-language.ts`). Keywords, variables, numbers, hex strings, and errors each get distinct colors.

### Internationalization (i18n)
Custom lightweight i18n in `src/lib/i18n/`:
- `context.tsx` — React context with `t(key, params?)` function, `locale` state, `setLocale`
- `zh.ts` / `en.ts` — Flat string dictionaries
- Locale persisted to `localStorage` key `miniscript-lab-locale`
- Default locale: Chinese (`zh`)
- All UI strings (nav, playground panels, tabs, warnings, status banner, flow nodes, time displays) are bilingual
- `blocksToHumanLocale(blocks, locale)` / `afterToHumanLocale(value, locale)` — locale-aware time formatting in `time-utils.ts`

### Glossary Tooltip
`src/lib/glossary/data.ts` — `GLOSSARY` record maps keys like `pk`, `older`, `after`, `sha256`, `hash256`, `ripemd160`, `hash160` to bilingual title + explanation objects.
`ConditionNode` in `FlowNodes.tsx` directly handles hover state with `onPointerEnter`/`onPointerLeave` and renders the tooltip via React portal to `document.body`. The `nodrag nopan` classes prevent React Flow from intercepting pointer events.

### Theme
Custom dark/light theme in `src/lib/theme/context.tsx`:
- Toggles `dark` class on `<html>`
- Default: dark mode
- Persisted to `localStorage` key `miniscript-lab-theme`

### Persistence & Sharing
- **Auto-save** (`useAutoSave` hook): debounces writes to `localStorage` key `miniscript-lab-session` (800ms delay)
- **Share URL**: encodes payload as base64 JSON in `?s=` query param (`src/lib/utils/share.ts`)
- **Scenario loading**: `?scenario=<id>` query param loads from `SCENARIOS` array

### Styling
**Tailwind CSS** with a custom design system:
- Stone-based color palette for surfaces and text
- `btc-*` scale (Bitcoin orange, `#F7931A` is `btc-500`)
- Semantic colors: `semantic-key` (yellow), `semantic-timelock` (orange), `semantic-hashlock` (purple), `semantic-satisfied` (green), `semantic-locked` (stone), `semantic-warning` (red)
- CSS variables for surface/text/border tokens to support dark/light switching
- `shadcn/ui` components (New York style, stone base) for primitives

### Testing
**Vitest** with tests in `src/lib/engine/__tests__/`:
- `compiler.test.ts` — Integration tests for full compile pipeline
- `miniscript-parser.test.ts` — Unit tests for the parser
- `time-utils.test.ts` — Unit tests for time conversion functions

---

## External Dependencies

### Bitcoin Libraries
| Package | Purpose |
|---|---|
| `@bitcoinerlab/miniscript-policies` | Compiles Policy expression → Miniscript |
| `@bitcoinerlab/miniscript` | Compiles Miniscript → Script, runs `satisfier()` to enumerate spending paths |
| `@bitcoinerlab/descriptors` | Builds output descriptors (`wsh(...)`) and derives addresses |
| `@bitcoinerlab/secp256k1` | ECC implementation required by descriptors |
| `bitcoinjs-lib` | Network constants, address encoding |

### UI / Visualization
| Package | Purpose |
|---|---|
| `@xyflow/react` | React Flow — interactive node graph for path map |
| `dagre` | Automatic directed graph layout for React Flow nodes |
| `@codemirror/*` | Code editor with syntax highlighting |
| `framer-motion` | Animation primitives |
| `lucide-react` | Icon library |
| `shadcn/ui` + Radix UI | Accessible UI primitives (dialog, popover, select, tabs, tooltip, toggle) |
| `class-variance-authority`, `clsx`, `tailwind-merge` | CSS class utilities |

### Supabase
`@supabase/supabase-js` is listed as a dependency but **not yet integrated** in the current codebase. It likely represents a planned future feature (e.g., saving/sharing scenarios server-side). No Supabase client initialization code exists yet.

### Storage
- **`localStorage` only** — no database, no backend API
- Keys used: `miniscript-lab-session`, `miniscript-lab-locale`, `miniscript-lab-theme`

### No External APIs
The application makes zero external API calls at runtime. All Bitcoin operations are performed locally in the browser using the bundled WASM/JS libraries.