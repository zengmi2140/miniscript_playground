# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miniscript Lab is a Bitcoin Miniscript educational playground. It compiles Policy → Miniscript → Script → Descriptor → Address, visualizes spending paths, and simulates condition satisfaction.

## Commands

```bash
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint check
npm run test   # Vitest (vitest run)
```

Testing uses Vitest. Tests live alongside source files with `.test.ts` / `.test.tsx` suffixes.

## Architecture

### Core Compilation Engine (`src/lib/engine/`)
- `compiler.ts` — Policy → Miniscript → Script compilation, key variable substitution; `mapError` → `upgradeErrorWithPreflight` → `attachErrorHighlight`
- `policy-errors.ts` — Maps library error strings to `FriendlyError` (`category`, `hints`, `friendly` zh/en)
- `policy-preflight.ts` — Detects duplicate `pk(placeholder)` names and upgrades low-confidence errors to `duplicate_key` without changing `raw`
- `policy-error-highlight.ts` — Heuristic UTF-16 ranges (`highlights` / `highlight`) for editor marking (`duplicate_key` multi-range, `unknown_fragment` token, parenthesis stack)
- `miniscript-parser.ts` — Miniscript string → semantic AST
- `path-analyzer.ts` — Analyzes spending paths and their conditions
- `time-utils.ts` — Block height to human-readable time conversion

### Builder Mode (`src/lib/builder/`)
- Visual canvas for building Miniscript policies via drag-and-drop
- `from-semantic-tree.ts` — Converts AST to React Flow nodes
- `serialize.ts` / `status.ts` — Policy string serialization and path status
- `node-ops.ts` — Node operations (add, remove, connect)
- `templates.ts` — Starter policy templates

### Flow Visualization (`src/lib/flow/`)
- `tree-to-flow.ts` — Transforms semantic tree into React Flow nodes/edges

### State Management (`src/lib/stores/`)
- Zustand stores for playground state, builder state, theme, and i18n

### Components (`src/components/`)
- `builder/` — Builder canvas, nodes, edges, popovers
- `flow/` — React Flow nodes (ConditionNode, OperatorNode, RootNode) and PathEdge
- `playground/` — ThreeColumnLayout, PolicyEditor, KeyVariableManager, TimeSlider, etc.
- `results/` — Tabs: Policy, Miniscript, Script, Descriptor, Address, Paths, Warnings
- `home/` — Homepage sections (Hero, Features, HowItWorks, etc.)
- `shared/` — GlossaryTooltip, ExplainPopover, CodeBlock

### Key Dependencies
- `@bitcoinerlab/miniscript` / `miniscript-policies` / `descriptors` — Bitcoin Miniscript compilation (`DescriptorsFactory` from `@bitcoinerlab/descriptors/dist/descriptors`; `@ledgerhq/ledger-bitcoin` is webpack-aliased to `src/lib/shims/ledger-bitcoin-stub.js` — no hardware wallet in-app)
- `@xyflow/react` + `dagre` — Path graph visualization
- `@codemirror/6` — Policy editor with custom syntax highlighting; `policy-language.ts` includes optional error-range decorations (`buildErrorHighlightExtensions`) used by `PolicyEditor`
- `framer-motion` — Node transition animations
- Zustand — State management

## Design Constraints
- Pure frontend only — no backend, no blockchain connections
- Only P2WSH (SegWit v0) supported; Taproot planned for V2
- Testnet addresses only — never generates mainnet addresses
