# 可视化构建 MVP Implementation Plan

> **Historical note (2026-04):** The Policy editor toolbar 「模板」 / `BuilderStarterCards` / `applyBuildStarter` were **removed**. Build mode now uses **only** the canvas root placeholder plus the right-side `BuilderPopover` for strategy type selection. Sections below that still mention toolbar templates are **obsolete** for new work.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `自己动手` -> `build` mode MVP as a constrained visual strategy editor that syncs with the Policy editor, overlays live satisfaction status on the same canvas, and preserves future compatibility for `after()` and hashlocks.

**Architecture:** Add a new builder domain layer (`StrategyNode` including `placeholder` type, serializer, semantic-tree importer, node ops) and make `build` mode use that tree as the source of truth while continuing to compile through the existing `policy -> compile -> miniscript -> paths` pipeline. The center column switches from read-only `PathMap` to a new editable builder canvas in `build` mode, while the right panel stays focused on path cards and technical output.

**Free-Build Entry Point:** Entering `build` mode from the `自己动手` card creates a fresh workspace with a **placeholder root node** (not starter templates). Users click the placeholder to choose a strategy type (single signature, AND group, OR group, or threshold multisig), then progressively add child conditions. Group nodes always display an "Add Condition" placeholder that remains permanently visible. This design provides maximum flexibility while maintaining a guided building experience.

Text edits remain allowed once inside `build` mode; supported structures round-trip back into the builder, unsupported-but-valid structures degrade to a text-led read-only builder state, and syntax errors keep the last synced builder tree.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript strict, Zustand, CodeMirror 6, React Flow (`@xyflow/react`), Dagre, framer-motion, Vitest, plus new UI test dependencies (`jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`).

## Prerequisites

- Read [2026-03-13-visual-builder-mvp-design.md](/Users/mi/Documents/GitHub/miniscript_playground/docs/plans/2026-03-13-visual-builder-mvp-design.md) before implementing.
- Execute in a dedicated worktree via `superpowers:using-git-worktrees`.
- Follow `superpowers:test-driven-development` for each task.
- Before claiming completion, run `superpowers:verification-before-completion`.
- Before landing the work, use `superpowers:requesting-code-review`.

## Non-Negotiable MVP Constraints

- No free-form edge drawing.
- No arbitrary node dragging to express meaning.
- No second full path map in `build` mode.
- No `after()` editor UI in MVP.
- No hashlock editor UI in MVP.
- No mobile builder UX beyond the existing desktop-only fallback.
- Clicking `自己动手` from another mode must not import or preserve the current scene policy.
- No regression to current `scenario` mode.
- **No starter template selection screen** - users start with a placeholder root node and choose strategy type directly.

## Phase 0: Test Harness And Safety Rails

### Phase 0 Acceptance

- Vitest can run React component tests in jsdom.
- A basic builder component test renders successfully.
- The repo still supports `npx vitest run`, `npm run lint`, and `npm run build`.

### Task 1: Add UI test infrastructure for builder components

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/components/builder/BuilderStarterCards.tsx`
- Create: `src/components/builder/__tests__/BuilderStarterCards.test.tsx`

**Step 1: Write the failing test**

Create `src/components/builder/__tests__/BuilderStarterCards.test.tsx` with a test that expects a not-yet-created `BuilderStarterCards` component to render three starter options:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BuilderStarterCards } from '@/components/builder/BuilderStarterCards';

describe('BuilderStarterCards', () => {
  it('renders the three MVP starter skeletons', () => {
    render(<BuilderStarterCards onSelect={() => {}} />);
    expect(screen.getByText(/单人控制/i)).toBeInTheDocument();
    expect(screen.getByText(/多人共管/i)).toBeInTheDocument();
    expect(screen.getByText(/带恢复路径/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/components/builder/__tests__/BuilderStarterCards.test.tsx
```

Expected:

- FAIL because `@testing-library/react` is missing and/or `BuilderStarterCards` does not exist.

**Step 3: Write minimal implementation**

- Add dev dependencies:

```bash
npm install -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- Update `vitest.config.ts` to include:

```ts
test: {
  testTimeout: 30000,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
}
```

- Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- Create a temporary minimal `src/components/builder/BuilderStarterCards.tsx` that renders the three starter labels and accepts `onSelect`.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/components/builder/__tests__/BuilderStarterCards.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts src/components/builder/BuilderStarterCards.tsx src/components/builder/__tests__/BuilderStarterCards.test.tsx
git commit -m "test: add builder UI test harness"
```

## Phase 1: Builder Domain Model And Import/Export Layer

### Phase 1 Acceptance

- The repo has a stable `StrategyNode` model that already reserves `absolute timelock` and `hashlock`.
- The MVP starter skeletons serialize into valid Policy strings.
- Supported `semanticTree` shapes import into builder trees.
- Unsupported structures return explicit reasons instead of silently failing.

### Task 2: Add the builder type system, starter templates, and policy serializer

**Files:**
- Create: `src/lib/builder/types.ts`
- Create: `src/lib/builder/templates.ts`
- Create: `src/lib/builder/serialize.ts`
- Create: `src/lib/builder/__tests__/templates.test.ts`
- Create: `src/lib/builder/__tests__/serialize.test.ts`

**Step 1: Write the failing tests**

Add tests that lock down:

- three starter skeleton IDs
- generated role defaults
- serializer output for:
  - single signature
  - `2-of-3` threshold
  - recovery structure `and(pk(User),or(pk(Service),older(4320)))`

Example:

```ts
expect(serializeStrategyTree(singleSigTemplate().tree)).toBe('pk(Alice)');
expect(serializeStrategyTree(sharedControlTemplate().tree)).toBe('thresh(2,pk(Alice),pk(Bob),pk(Charlie))'); // Policy uses thresh(), multi() is Miniscript-level
expect(serializeStrategyTree(nestedRecoveryLikeTree())).toBe('and(pk(User),or(pk(Service),older(4320)))');
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/templates.test.ts src/lib/builder/__tests__/serialize.test.ts
```

Expected:

- FAIL because builder domain files do not exist.

**Step 3: Write minimal implementation**

Create `src/lib/builder/types.ts` with at least:

```ts
export type BuilderSyncState = 'synced' | 'text-led' | 'compile-error';

export type StrategyNode =
  | { id: string; kind: 'placeholder'; placeholderType: 'root' | 'child' }
  | { id: string; kind: 'group'; op: 'all' | 'any' | 'threshold'; threshold?: number; children: StrategyNode[] }
  | { id: string; kind: 'signature'; roleId: string }
  | { id: string; kind: 'timelock'; mode: 'relative' | 'absolute'; value: number; unit: 'blocks' | 'date' | 'timestamp' }
  | { id: string; kind: 'hashlock'; hashType: 'sha256' | 'hash256' | 'ripemd160' | 'hash160'; digest: string };

// Note: 'placeholder' nodes are used for:
// - 'root': Initial entry point where user chooses strategy type
// - 'child': "Add condition" slots inside groups (always visible, not serialized)

// Common time period presets for the timelock dropdown (assuming ~10 min/block)
export const TIMELOCK_PRESETS = {
  '7 days': 1008,    // 7 * 24 * 6 = 1008 blocks
  '30 days': 4320,   // 30 * 24 * 6 = 4320 blocks
  '90 days': 12960,  // 90 * 24 * 6 = 12960 blocks
  '180 days': 25920, // 180 * 24 * 6 = 25920 blocks
  '1 year': 52560,   // 365 * 24 * 6 = 52560 blocks
} as const;

// Helper to convert blocks to human-readable time
export function blocksToHumanTime(blocks: number): string;
```

Create `templates.ts` with helpers that return:

- `tree`
- `policy`
- `keyVariables`

Use canonical defaults:

- `single-control` -> `Alice`
- `shared-control` -> `Alice`, `Bob`, `Charlie`, threshold `2-of-3`
- `recovery` -> `User`, `Service`, `older(4320)`

Create `serialize.ts` with:

```ts
export function serializeStrategyTree(node: StrategyNode): string
```

Rules:

- `group(all)` -> `and(...)` or nested canonical `and(...)`
- `group(any)` -> canonical `or(...)`
- `group(threshold)` -> `thresh(k,pk(...),...)`（Policy 层统一用 `thresh` + `pk()`；不输出 `multi(k,...)` 字面量，与 `serialize.ts` 注释一致）
- `signature` -> `pk(RoleName)`
- `timelock(relative)` -> `older(n)`
- `timelock(absolute)` and `hashlock` may serialize, but are not used in MVP UI

Note: In the builder canvas, threshold groups are expanded into k-of-n nodes with participant leaves for visual clarity.

Do not optimize for every possible policy spelling; output a canonical builder-owned Policy format.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/templates.test.ts src/lib/builder/__tests__/serialize.test.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/builder/types.ts src/lib/builder/templates.ts src/lib/builder/serialize.ts src/lib/builder/__tests__/templates.test.ts src/lib/builder/__tests__/serialize.test.ts
git commit -m "feat: add builder domain model and serializer"
```

### Task 3: Add semantic-tree -> builder import with explicit support detection

**Files:**
- Create: `src/lib/builder/from-semantic-tree.ts`
- Create: `src/lib/builder/__tests__/from-semantic-tree.test.ts`
- Modify: `src/lib/builder/types.ts`

**Step 1: Write the failing test**

Add tests for:

- `pk(Alice)` semantic tree -> `signature`
- `and(pk(A),older(4320))` -> `group(all)`
- `thresh(2,pk(A),pk(B),pk(C))` -> `group(threshold)`
- `after(800000)` -> unsupported result with reason like `absolute-timelock`
- `hash160(...)` -> unsupported result with reason like `hashlock`

Use the existing `parseMiniscript` in the test to generate semantic trees from canonical miniscript strings when convenient.

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/from-semantic-tree.test.ts
```

Expected:

- FAIL because importer does not exist.

**Step 3: Write minimal implementation**

Create:

```ts
export type BuilderImportResult =
  | { status: 'supported'; tree: StrategyNode }
  | { status: 'unsupported'; reason: 'absolute-timelock' | 'hashlock' | 'unknown-fragment' | 'constant-branch'; message: string };

export function importFromSemanticTree(node: MiniscriptNode): BuilderImportResult
```

Rules:

- `key` -> `signature`
- `older` -> `timelock(relative)`
- `after` -> unsupported
- `hash` -> unsupported
- `and` / `or` -> `group(all)` / `group(any)`
- `threshold` / `multi` -> `group(threshold)` with signature children
- `just_0` / `just_1` -> unsupported

This importer is the only reverse-sync path for MVP. Do not write a second raw Policy parser unless blocked.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/from-semantic-tree.test.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/builder/from-semantic-tree.ts src/lib/builder/__tests__/from-semantic-tree.test.ts src/lib/builder/types.ts
git commit -m "feat: add builder semantic tree importer"
```

## Phase 2: Store, Persistence, Entry, And Mode Plumbing

### Phase 2 Acceptance

- `playgroundMode` actually controls UI behavior.
- Clicking `自己动手` enters `build` mode.
- Clicking a scenario always returns to `scenario` mode.
- Build mode survives local restore and share links.
- Clicking `自己动手` from any non-build context resets into a blank builder workspace with a **placeholder root node** on the canvas (not full-screen starter templates; templates are available from the Policy editor toolbar).
- Restoring a saved `build` session or opening a `build` share link rehydrates that build session instead of forcing a reset.

### Task 4: Extend the store with builder state, source tracking, and mode-correct transitions

**Files:**
- Modify: `src/lib/engine/types.ts`
- Modify: `src/lib/stores/playground-store.ts`
- Create: `src/lib/stores/__tests__/playground-store-builder.test.ts`
- Modify: `src/lib/builder/types.ts`

**Step 1: Write the failing test**

Add store tests that expect:

- `loadScenario()` sets `playgroundMode` to `'scenario'`
- `enterBuildMode()` sets `playgroundMode` to `'build'`
- `enterBuildMode()` clears `policy`, sets `strategyTree` to the root placeholder, clears `keyVariables`, path results, and active scenario
- `applyBuildStarter()` seeds `policy`, `keyVariables`, and `strategyTree`

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/stores/__tests__/playground-store-builder.test.ts
```

Expected:

- FAIL because builder store state/actions do not exist.

**Step 3: Write minimal implementation**

Add to store state:

- `strategyTree: StrategyNode | null`
- `builderSyncState: BuilderSyncState`
- `selectedBuilderNodeId: string | null`
- `selectedPathIndex: number | null` (reuse existing field)
- `lastBuilderPolicySnapshot: string | null`

Add actions:

```ts
setStrategyTree(tree: StrategyNode | null): void;
setBuilderSyncState(state: BuilderSyncState): void;
setSelectedBuilderNodeId(id: string | null): void;
enterBuildMode(): void;
clearSelectedPath(): void;
```

Behavior:

- `loadScenario` must force `playgroundMode: 'scenario'`
- `enterBuildMode` must force `activeScenarioId: null`
- `enterBuildMode` must create an initial placeholder root node:
  ```ts
  strategyTree: { id: 'root_placeholder', kind: 'placeholder', placeholderType: 'root' }
  ```
- `enterBuildMode` must also reset:
  - `policy: ''`
  - `keyVariables: []`
  - `compilationResult: null`
  - `compilationError: null`
  - `semanticTree: null`
  - `spendingPaths: []`
  - `availableKeys: new Set()`
  - `availableHashes: new Set()`
  - `currentTimeBlocks: 0`
  - `selectedPathIndex: null`
  - `selectedBuilderNodeId: null`
  - `builderSyncState: 'synced'`
- `enterBuildMode` may preserve `network`, `context`, panel open state, and other non-strategy UI preferences
- `applyBuildStarter` must also set `builderSyncState: 'synced'`

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/stores/__tests__/playground-store-builder.test.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/engine/types.ts src/lib/stores/playground-store.ts src/lib/stores/__tests__/playground-store-builder.test.ts src/lib/builder/types.ts
git commit -m "feat: add builder store state and mode transitions"
```

### Task 5: Persist and restore build mode in storage and share payloads

**Files:**
- Modify: `src/lib/utils/storage.ts`
- Modify: `src/lib/utils/share.ts`
- Modify: `src/lib/hooks/useAutoSave.ts`
- Modify: `src/app/playground/page.tsx`
- Create: `src/lib/utils/__tests__/storage-share-builder.test.ts`

**Step 1: Write the failing test**

Add tests that expect:

- storage payload includes `playgroundMode`
- share payload includes `playgroundMode`
- decoding/restoring a build-mode share returns build mode

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/utils/__tests__/storage-share-builder.test.ts
```

Expected:

- FAIL because mode is not persisted.

**Step 3: Write minimal implementation**

Update persisted/share payloads to include:

```ts
playgroundMode: PlaygroundMode
```

Do not persist `strategyTree` in MVP; rebuild it from `policy` after restore.

Update `useAutoSave` and page restore logic so that:

- build sessions re-open in `build` mode
- scenario sessions still restore cleanly

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/utils/__tests__/storage-share-builder.test.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/utils/storage.ts src/lib/utils/share.ts src/lib/hooks/useAutoSave.ts src/app/playground/page.tsx src/lib/utils/__tests__/storage-share-builder.test.ts
git commit -m "feat: persist builder mode in storage and share"
```

### Task 6: Replace the DIY placeholder with a real build entry and mode-aware left panel behavior

**Files:**
- Modify: `src/components/playground/LeftPanel.tsx`
- Modify: `src/lib/i18n/zh.ts`
- Modify: `src/lib/i18n/en.ts`
- Create: `src/components/playground/__tests__/LeftPanelBuildEntry.test.tsx`

**Step 1: Write the failing test**

Add a component test that expects:

- the DIY card is clickable
- clicking it triggers `enterBuildMode`
- the card receives active styling when `playgroundMode === 'build'`

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/components/playground/__tests__/LeftPanelBuildEntry.test.tsx
```

Expected:

- FAIL because the DIY card is still disabled.

**Step 3: Write minimal implementation**

Change `DiyComingSoonCard` into a real `BuildModeCard`.

Behavior:

- clicking the DIY card from `scenario` mode or any other non-build context must always call the fresh-reset `enterBuildMode`
- after reset, the center panel must show the builder canvas with a root placeholder (`strategyTree` from `createRootPlaceholderTree()`), not full-screen starter cards
- do not attempt to import the current scenario policy during this transition
- if the DIY card is already active in `build` mode, clicking it should be a no-op to avoid destructive accidental resets

Update translations to remove Coming Soon wording and add any build-entry helper copy required.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/components/playground/__tests__/LeftPanelBuildEntry.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/components/playground/LeftPanel.tsx src/lib/i18n/zh.ts src/lib/i18n/en.ts src/components/playground/__tests__/LeftPanelBuildEntry.test.tsx
git commit -m "feat: activate diy build mode entry"
```

## Phase 3: Builder Canvas Shell And Editing Operations

### Phase 3 Acceptance

- `build` mode shows a builder canvas instead of `PathMap`.
- Empty build sessions show the root placeholder on the canvas; starter templates are a secondary entry (Policy editor toolbar), not the first screen.
- The canvas renders a constrained strategy tree using React Flow/Dagre.
- Node popovers can edit signatures, thresholds, and `older()` values.
- Structural operations work without free-form edge editing.

### Task 7: Add the builder canvas shell, template entry, and mode-aware center panel

**Files:**
- Create: `src/components/builder/BuilderCanvas.tsx`
- Create: `src/components/builder/BuilderNodes.tsx`
- ~~Create: `src/components/builder/BuilderEmptyState.tsx`~~ (superseded: root placeholder first screen; `BuilderStarterCards` opened from Policy editor toolbar modal)
- Create: `src/lib/builder/tree-to-flow.ts`
- Create: `src/lib/builder/__tests__/tree-to-flow.test.ts`
- Modify: `src/components/builder/BuilderStarterCards.tsx`
- Modify: `src/components/playground/CenterPanel.tsx`

**Step 1: Write the failing test**

Add tests that expect:

- builder canvas when `playgroundMode === 'build'` (root placeholder when policy is empty; not full-screen starter cards)
- builder tree-to-flow produces nodes for:
  - root group
  - signature child
  - threshold group
  - relative timelock leaf

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/tree-to-flow.test.ts src/components/builder/__tests__/BuilderStarterCards.test.tsx
```

Expected:

- FAIL because builder flow renderer does not exist.

**Step 3: Write minimal implementation**

Implementation rules:

- `BuilderCanvas` uses React Flow + Dagre, but disables dragging/connectability as a meaning-bearing action.
- The canvas uses builder-owned node types, not the existing read-only `PathMap` types.
- `CenterPanel` switches:
  - `scenario` mode -> keep existing `PathMap`
  - `build` mode -> show `BuilderCanvas`
- Starter templates: `BuilderStarterCards` in a modal from the Policy editor toolbar (`applyBuildStarter`), not a dedicated `BuilderEmptyState` full-screen step.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/tree-to-flow.test.ts src/components/builder/__tests__/BuilderStarterCards.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/components/builder/BuilderCanvas.tsx src/components/builder/BuilderNodes.tsx src/lib/builder/tree-to-flow.ts src/lib/builder/__tests__/tree-to-flow.test.ts src/components/builder/BuilderStarterCards.tsx src/components/playground/CenterPanel.tsx
git commit -m "feat: add builder canvas shell"
```

### Task 8: Add builder node operations and node-side popovers

**Files:**
- Create: `src/lib/builder/node-ops.ts`
- Create: `src/components/builder/BuilderPopover.tsx`
- Create: `src/components/builder/__tests__/BuilderPopover.test.tsx`
- Create: `src/lib/builder/__tests__/node-ops.test.ts`
- Modify: `src/components/builder/BuilderNodes.tsx`
- Modify: `src/lib/stores/playground-store.ts`

**Step 1: Write the failing test**

Add tests for node ops:

- add a signature child under `group(all)`
- wrap a signature node with `group(any)`
- convert a group to threshold and set `k`
- remove a child node
- update a relative timelock value

Add component tests for the popover:

- clicking a signature node opens role selector with "quick add role" option
- clicking a timelock node opens dual input: numeric blocks field + time period dropdown (7 days, 30 days, 90 days, 180 days, 1 year) with real-time conversion display
- clicking a threshold node allows editing `k`
- selecting a time period from dropdown updates the blocks field accordingly (e.g., "30 days" -> 4320 blocks)

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/node-ops.test.ts src/components/builder/__tests__/BuilderPopover.test.tsx
```

Expected:

- FAIL because node operations and popover do not exist.

**Step 3: Write minimal implementation**

Create pure functions in `node-ops.ts`, for example:

```ts
export function addChildNode(tree: StrategyNode, parentId: string, child: StrategyNode): StrategyNode
export function updateNode(tree: StrategyNode, nodeId: string, updater: (node: StrategyNode) => StrategyNode): StrategyNode
export function removeNode(tree: StrategyNode, nodeId: string): StrategyNode
export function wrapNodeInGroup(tree: StrategyNode, nodeId: string, op: 'all' | 'any'): StrategyNode
```

Use the popover to call store actions that apply these pure operations.

Keep editing focused:

- role picker
- quick add role
- threshold `k/n`
- relative blocks (with dual input: numeric blocks field + common time period dropdown selector showing days/weeks/months, with real-time conversion display)
- delete node / add child / wrap branch

**Role/Key Variable Management Rules:**

- When a new role is created via the node popover "quick add role" action, it is automatically added to the global `keyVariables` array with a generated test public key.
- If a user deletes a role from the left panel `keyVariables` while that role is in use within the `strategyTree`, the role name is preserved in the tree but marked as "undefined" status. The tree structure is not destroyed.
- The left panel remains the primary entry point for full role management (rename, delete, view keys). The node popover only supports lightweight creation and role selection.

No free-form edge tools.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/node-ops.test.ts src/components/builder/__tests__/BuilderPopover.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/builder/node-ops.ts src/components/builder/BuilderPopover.tsx src/components/builder/__tests__/BuilderPopover.test.tsx src/lib/builder/__tests__/node-ops.test.ts src/components/builder/BuilderNodes.tsx src/lib/stores/playground-store.ts
git commit -m "feat: add builder node editing popovers"
```

## Phase 4: Builder <-> Policy Sync, Degradation, And Live Status

### Phase 4 Acceptance

- Builder edits update the Policy editor immediately.
- Supported text edits round-trip back into the builder.
- Valid but unsupported structures enter text-led mode.
- Compile errors keep the last successful builder tree visible.
- Live conditions update node status on the builder canvas.

### Task 9: Add the builder sync hook and text-led / compile-error state machine

**Files:**
- Create: `src/lib/hooks/useBuilderSync.ts`
- Create: `src/components/builder/BuilderSyncBanner.tsx`
- Create: `src/lib/hooks/__tests__/useBuilderSync.test.tsx`
- Modify: `src/components/playground/PolicyEditor.tsx`
- Modify: `src/components/playground/CenterPanel.tsx`
- Modify: `src/app/playground/page.tsx`

**Step 1: Write the failing test**

Add hook/component tests that expect:

- builder-owned policy updates do not immediately wipe and recreate the tree
- supported semantic trees import to builder state
- `after()` or hashlock semantic trees set `builderSyncState: 'text-led'`
- compile errors set `builderSyncState: 'compile-error'` and keep the last imported tree

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/hooks/__tests__/useBuilderSync.test.tsx
```

Expected:

- FAIL because the sync hook does not exist.

**Step 3: Write minimal implementation**

Implement `useBuilderSync` with these rules:

- If `playgroundMode !== 'build'`, do nothing.
- If `policy.trim() === ''`, set `strategyTree` to the root placeholder (`createRootPlaceholderTree()`), clear `lastBuilderPolicySnapshot`, and do not attempt reverse import.
- If `policy === lastBuilderPolicySnapshot`, ignore reverse import.
- If compilation succeeds and `semanticTree` imports as supported:
  - set `strategyTree`
  - set `builderSyncState: 'synced'`
- If compilation succeeds but importer returns unsupported:
  - keep current `policy`
  - keep last `strategyTree` (do not clear it)
  - set `builderSyncState: 'text-led'`
- If compilation errors:
  - keep last `strategyTree`
  - set `builderSyncState: 'compile-error'`

Mount the hook in `playground/page.tsx` alongside `useCompiler()` and `useAutoSave()`.

**Canvas behavior in degraded states:**

- In `text-led` mode: Display the last successfully synced tree in a grayed-out/read-only state. Show a prominent banner above the canvas explaining that the current policy contains unsupported constructs (e.g., `after()` or hashlocks) and the canvas shows the last synced snapshot. This helps users see where their policy "forked" from the visual builder's capabilities.
- In `compile-error` mode: Display the last successfully synced tree in a grayed-out/read-only state. Show a banner indicating syntax errors and that the canvas shows the previous valid state.
- In both degraded states, editing operations on the canvas are disabled but the tree remains visible for reference.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/hooks/__tests__/useBuilderSync.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/hooks/useBuilderSync.ts src/components/builder/BuilderSyncBanner.tsx src/lib/hooks/__tests__/useBuilderSync.test.tsx src/components/playground/PolicyEditor.tsx src/components/playground/CenterPanel.tsx src/app/playground/page.tsx
git commit -m "feat: add builder policy sync state machine"
```

### Task 10: Overlay builder status from live conditions and keep the bottom simulator reusable

**Files:**
- Create: `src/lib/builder/status.ts`
- Create: `src/lib/builder/__tests__/status.test.ts`
- Modify: `src/components/builder/BuilderNodes.tsx`
- Modify: `src/components/builder/BuilderCanvas.tsx`
- Modify: `src/components/playground/ConditionToggles.tsx`
- Modify: `src/components/playground/TimeSlider.tsx`

**Step 1: Write the failing test**

Add tests that expect:

- signature nodes become `satisfied` when their role is toggled on
- relative timelock nodes become `pending` until the slider reaches the required blocks
- `group(all)` is `satisfied` only when all children are satisfied
- `group(any)` is `pending` if one branch is still time-locked and no branch is satisfied
- `group(threshold)` calculates `satisfied / pending / missing` correctly

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/status.test.ts
```

Expected:

- FAIL because builder status derivation does not exist.

**Step 3: Write minimal implementation**

Create:

```ts
export type BuilderNodeStatus = 'satisfied' | 'pending' | 'missing';
export function computeBuilderStatus(tree: StrategyNode, availableKeys: Set<string>, currentTimeBlocks: number): BuilderStatusMap
```

Notes:

- Ignore hash toggles in MVP because hashlock nodes are not user-creatable yet.
- Keep the existing bottom condition toggles and time slider visible in `build` mode.
- Feed builder node status into `BuilderNodes`.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/status.test.ts
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/builder/status.ts src/lib/builder/__tests__/status.test.ts src/components/builder/BuilderNodes.tsx src/components/builder/BuilderCanvas.tsx src/components/playground/ConditionToggles.tsx src/components/playground/TimeSlider.tsx
git commit -m "feat: overlay live status on builder canvas"
```

## Phase 5: Path Highlighting, UX Polish, And Full Verification

### Phase 5 Acceptance

- Clicking a path card highlights the corresponding branch on the builder canvas.
- Build mode remains readable while highlighted.
- New strings are localized in zh/en.
- Full repo verification passes.
- Manual QA confirms both `scenario` and `build` modes work.

### Task 11: Make path cards selectable and highlight matching builder branches

**Files:**
- Create: `src/lib/builder/path-highlighting.ts`
- Create: `src/lib/builder/__tests__/path-highlighting.test.ts`
- Create: `src/components/results/__tests__/PathsTabSelection.test.tsx`
- Modify: `src/components/results/PathsTab.tsx`
- Modify: `src/components/builder/BuilderCanvas.tsx`
- Modify: `src/components/builder/BuilderNodes.tsx`
- Modify: `src/lib/stores/playground-store.ts`

**Step 1: Write the failing test**

Add tests that expect:

- clicking a path card sets `selectedPathIndex`
- highlight utility returns node IDs for a matching `2FA + older(4320)` recovery branch
- clicking the same path twice clears selection

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/builder/__tests__/path-highlighting.test.ts src/components/results/__tests__/PathsTabSelection.test.tsx
```

Expected:

- FAIL because path highlighting does not exist and path cards are not clickable.

**Step 3: Write minimal implementation**

Add a pure helper:

```ts
export function collectHighlightedNodeIds(tree: StrategyNode, path: SpendingPath): Set<string>
```

Implementation rule:

- Match leaf conditions by role and timelock value.
- Propagate highlight to ancestors along the selected branch.
- For `group(any)`, only highlight branches that satisfy the selected path.
- For threshold groups, highlight only the matched participant leaves plus the threshold parent.

Update `PathsTab` so path cards behave like selectable controls and use the existing `selectedPathIndex` store slot.

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/lib/builder/__tests__/path-highlighting.test.ts src/components/results/__tests__/PathsTabSelection.test.tsx
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add src/lib/builder/path-highlighting.ts src/lib/builder/__tests__/path-highlighting.test.ts src/components/results/PathsTab.tsx src/components/builder/BuilderCanvas.tsx src/components/builder/BuilderNodes.tsx src/lib/stores/playground-store.ts src/components/results/__tests__/PathsTabSelection.test.tsx
git commit -m "feat: highlight builder branches from selected paths"
```

### Task 12: Finalize copy, accessibility, regression tests, and manual QA checklist

**Files:**
- Modify: `src/lib/i18n/zh.ts`
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/components/builder/__tests__/BuilderStarterCards.test.tsx`
- Modify: `src/components/builder/__tests__/BuilderPopover.test.tsx`
- Modify: `docs/plans/2026-03-13-visual-builder-mvp-design.md`
- Create: `docs/plans/2026-03-13-visual-builder-mvp-qa-checklist.md`

**Step 1: Write the failing tests / checks**

Add or extend component tests for:

- builder banners use localized strings
- starter template modal (Policy editor toolbar) is keyboard reachable
- node popover trigger buttons expose accessible labels

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/components/builder/__tests__/BuilderStarterCards.test.tsx src/components/builder/__tests__/BuilderPopover.test.tsx
```

Expected:

- FAIL if accessible labels / localized copy are incomplete.

**Step 3: Write minimal implementation**

- Add all missing `zh/en` strings for:
  - build entry
  - starter templates (toolbar modal)
  - text-led banner
  - compile-error banner
  - node popover labels
  - path selection helper text
- Add keyboard / aria labels where missing.
- Create `docs/plans/2026-03-13-visual-builder-mvp-qa-checklist.md` with desktop QA coverage for:
  - DIY entry
  - starter templates (secondary entry)
  - builder editing
  - Policy reverse sync
  - text-led mode with unsupported `after()`
  - compile-error retention
  - path card highlighting
  - existing scenario regression

**Step 4: Run final verification**

Run:

```bash
npx vitest run
npm run lint
npm run build
```

Expected:

- All unit/component tests PASS
- Lint passes
- Production build passes

Then execute manual QA using `docs/plans/2026-03-13-visual-builder-mvp-qa-checklist.md`.

**Step 5: Commit**

```bash
git add src/lib/i18n/zh.ts src/lib/i18n/en.ts docs/plans/2026-03-13-visual-builder-mvp-design.md docs/plans/2026-03-13-visual-builder-mvp-qa-checklist.md
git commit -m "chore: finalize visual builder mvp polish and verification"
```

## End-To-End Acceptance Standards

The feature is not done until all of the following are true:

1. `自己动手` is a working build-mode entry, not a placeholder.
2. Clicking `自己动手` from another mode clears scene-derived state and shows a placeholder root node.
3. `build` mode shows placeholder root node for strategy type selection (no starter template cards).
4. Group nodes always display a permanent "Add Condition" placeholder.
5. Builder edits update the Policy editor immediately.
6. Supported text edits round-trip back into the builder.
7. Unsupported-but-valid structures show text-led mode instead of corrupting the builder.
8. Syntax errors keep the last synced builder tree visible.
9. Builder nodes display live satisfied/pending/missing status.
10. Right-panel path selection highlights the matching builder branch.
11. Existing scenario mode remains intact.
12. The implementation leaves clean expansion seams for `after()` and hashlocks.

## Manual QA Matrix

Use the QA checklist doc plus these scenarios:

- From empty Playground -> click `自己动手` -> see placeholder root node with "选择策略类型".
- From any preloaded scenario -> click `自己动手` -> previous scenario policy is cleared and placeholder root shown.
- Click placeholder -> choose `单签名` -> create signature node -> select role "Alice" -> Policy becomes `pk(Alice)`.
- Click placeholder -> choose `门限多签` -> default 2-of-3 structure with 3 placeholder slots appears.
- Fill in threshold slots with Alice, Bob, Charlie -> Policy becomes `thresh(2,pk(Alice),pk(Bob),pk(Charlie))`.
- Click placeholder -> choose `都需要` -> add signature child -> add timelock child -> complex structure builds up.
- In threshold group, click "+" to add more conditions beyond initial 3.
- Edit timelock via popover -> use dropdown to select "30 days" -> blocks field auto-updates to 4320 -> conversion display shows "~30 days".
- Edit timelock via popover -> manually type 1008 blocks -> conversion display shows "~7 days".
- In node popover, click "quick add role" -> enter "Dave" -> new role appears in left panel keyVariables and is selectable in builder.
- In left panel, delete a role (e.g., "Alice") that is used in the builder tree -> tree structure preserved, Alice node shows "undefined role" warning style.
- While in build mode, manually type a supported Policy -> builder rehydrates.
- While in build mode, manually type `after(800000)` -> text-led banner appears, builder shows grayed-out last synced tree (read-only), editing disabled.
- While in build mode, type invalid garbage -> compile-error banner appears and last builder tree remains visible.
- Click a right-panel path card -> only matching branch highlights.
- Click a scenario card after build mode -> UI returns to `scenario` mode.
- Restore a saved `build` session or open a `build` share link -> existing builder content rehydrates instead of resetting to starters.

## Risks To Watch During Execution

- Do not accidentally keep `PathMap` mounted in build mode; one canvas only.
- Do not import the current scenario policy when the user explicitly enters `自己动手`.
- Do not make builder sync depend on a separate raw Policy parser if the semantic-tree bridge works.
- Do not reset the tree on every compile if the `policy` came from builder serialization.
- Do not let text-led mode silently downgrade into a broken editable builder.
- Do not mutate the tree in place inside Zustand; all builder node ops must be pure.
- Do not delete the tree structure when a role is deleted from left panel keyVariables; preserve the node with "undefined role" visual state.
- Do not forget to sync newly created roles (via node popover) back to the global keyVariables array.
- Do not serialize placeholder nodes to Policy - they represent incomplete/interactive state only.
- Deleting the root node must show confirmation dialog before resetting to initial placeholder state.

## Suggested Execution Order

Execute tasks strictly in order. Do not start canvas UI before the domain model and tests exist.

## Verification Commands Summary

```bash
npx vitest run
npm run lint
npm run build
```
