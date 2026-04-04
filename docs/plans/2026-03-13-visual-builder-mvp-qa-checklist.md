# Visual Builder MVP - QA Checklist

Date: 2026-03-13  
Status: Ready for Testing

## Pre-Test Setup

- [ ] Clear localStorage (`localStorage.clear()` in console)
- [ ] Ensure running on latest build
- [ ] Test in both English and Chinese locales

---

## Phase 1: Entry Point & Mode Switching

### Left Panel - Build Mode Card

- [ ] "Build Your Own" card is visible and clickable (no longer "Coming Soon")
- [ ] Clicking card enters build mode (mode switches to `build`)
- [ ] Card shows "Building" badge when active
- [ ] Clicking again while in build mode does NOT reset the builder
- [ ] Switching to a scenario from left panel exits build mode properly

### URL Sharing

- [ ] Share URL from build mode includes `playgroundMode: 'build'`
- [ ] Loading a build mode share URL enters build mode correctly

---

## Phase 2: Free-Build Entry Point

### Initial Placeholder Node

- [ ] When entering build mode, a placeholder root node is shown
- [ ] Placeholder node has dashed border and "选择策略类型" label (or localized equivalent)
- [ ] Clicking placeholder opens strategy type selection in the right popover (same pattern as other node actions)
- [ ] Policy editor toolbar does **not** show a separate "Templates" button in build mode

### Strategy Type Selection

- [ ] Four options available: Single Signature, All Required, Any One, Threshold Multisig
- [ ] Selecting "Single Signature" creates a signature node
- [ ] Selecting "All Required" creates an AND group with add-child placeholder
- [ ] Selecting "Any One" creates an OR group with add-child placeholder
- [ ] Selecting "Threshold Multisig" creates 2-of-3 structure with 3 placeholder slots

### Threshold Default Behavior

- [ ] Threshold defaults to k=2
- [ ] 3 child placeholder slots are created by default
- [ ] User can edit each slot to select/create a role

### Role Selection Flow

- [ ] "Add Signature" shows existing roles list first
- [ ] "Create New Role" option at bottom of role list
- [ ] Creating new role generates test public key automatically

---

## Phase 3: Canvas Rendering & Node Display

### Tree Visualization

- [ ] Nodes render with correct icons (key for signature, clock for timelock)
- [ ] Group nodes (all/any/threshold) show correct labels
- [ ] Edges connect properly between nodes
- [ ] Tree auto-fits in viewport

### Node Status Display

- [ ] Signature nodes show satisfied (green) when key is toggled on
- [ ] Signature nodes show pending (gray) when key is toggled off
- [ ] Timelock nodes show satisfied when currentTimeBlocks >= value
- [ ] Timelock nodes show pending when currentTimeBlocks < value
- [ ] Undefined roles show warning style (red/dashed border)

---

## Phase 4: Node Editing (Popover)

### Signature Node Popover

- [ ] Click signature node → popover opens with role selector
- [ ] All defined roles shown in dropdown
- [ ] "Add New Role" option visible
- [ ] Selecting different role updates the node
- [ ] Creating new role adds it to keyVariables

### Timelock Node Popover

- [ ] Click timelock node → popover opens with dual input
- [ ] Blocks input field shows current value
- [ ] Time preset dropdown shows options (7 days, 30 days, etc.)
- [ ] Selecting "30 days" sets blocks to 4320
- [ ] Manually entering blocks shows time conversion (e.g., "~30 days")

### Threshold Node Popover

- [ ] Click threshold group → popover shows k/n editor
- [ ] Can adjust threshold value within valid range
- [ ] Threshold clamped to max n (number of children)

### Action Buttons

- [ ] "Delete" button removes node (with parent adjustment)
- [ ] "Add Condition" adds new child to group
- [ ] "Wrap as" options wrap node in new group

---

## Phase 5: Builder ↔ Policy Sync

### Builder → Policy (Forward Sync)

- [ ] Editing tree via popover immediately updates Policy text
- [ ] Adding/removing nodes updates Policy text
- [ ] Policy syntax is canonical (thresh for thresholds, and/or for groups)

### Policy → Builder (Reverse Sync)

- [ ] Typing supported Policy in editor updates builder tree
- [ ] Supported: `pk()`, `and()`, `or()`, `thresh()`, `older()`
- [ ] Tree restructures to match new Policy

### Text-Led Mode (Unsupported Constructs)

- [ ] Typing `after(800000)` triggers text-led mode
- [ ] Banner appears: "Canvas shows last synced snapshot"
- [ ] Canvas shows grayed-out tree (read-only)
- [ ] Editing operations on canvas are disabled
- [ ] Editing Policy back to supported syntax exits text-led mode

### Compile Error Mode

- [ ] Typing invalid syntax (e.g., `pk(`) triggers compile-error state
- [ ] Banner shows "Policy has syntax errors"
- [ ] Canvas shows last valid tree (grayed)

---

## Phase 6: Path Highlighting

### Spending Path Selection

- [ ] Click a spending path in Results panel
- [ ] Corresponding nodes in builder tree highlight
- [ ] Only nodes in selected path are highlighted
- [ ] Parent groups of highlighted leaves also highlight
- [ ] Clicking same path again deselects (removes highlighting)

### Highlighting Accuracy

- [ ] For `pk(Alice)` path, only Alice signature highlights
- [ ] For threshold paths, only participating keys highlight
- [ ] For recovery path, correct branch highlights (Service OR timelock)

---

## Phase 7: Condition Toggles & Time Slider

### Key Toggles

- [ ] Toggling a key updates node satisfied/pending status
- [ ] All signature nodes for that role update together

### Time Slider

- [ ] Moving time slider updates timelock node status
- [ ] Timelock shows satisfied when time passes threshold
- [ ] Time value displays in both blocks and human-readable format

---

## Phase 8: Persistence & State Recovery

### LocalStorage

- [ ] Editing in build mode auto-saves to localStorage
- [ ] Refreshing page restores build mode state
- [ ] Tree, policy, and keyVariables all restored

### Cross-Session

- [ ] Close browser, reopen → state restored
- [ ] Mode (build vs scenario) correctly restored

---

## Phase 9: Internationalization

### Chinese Locale

- [ ] Switch to Chinese → all builder UI in Chinese
- [ ] Starter card labels in Chinese
- [ ] Node labels in Chinese
- [ ] Popover labels in Chinese
- [ ] Banner messages in Chinese

### English Locale

- [ ] All text renders in English
- [ ] No missing translation keys (no raw keys visible)

---

## Phase 10: Edge Cases & Error Handling

### Empty States

- [ ] Empty tree shows placeholder root node (not blank canvas)
- [ ] Deleting root node shows confirmation dialog
- [ ] Confirming deletion returns to initial placeholder state

### Role Deletion Conflict

- [ ] Delete a role from left panel that's used in tree
- [ ] Tree structure preserved
- [ ] Node shows "undefined role" warning
- [ ] Can re-assign role via popover

### Threshold Edge Cases

- [ ] 1-of-1 threshold works
- [ ] n-of-n threshold works
- [ ] Cannot set threshold > n or < 1

### Deep Nesting

- [ ] Create deeply nested structure (3+ levels)
- [ ] All nodes editable
- [ ] Delete propagates correctly

---

## Sign-off

| Tester | Date | Pass/Fail | Notes |
|--------|------|-----------|-------|
|        |      |           |       |

---

## Known Limitations (Not Bugs)

- `after()` (absolute timelock) not supported in canvas editor
- Hashlock conditions not supported in canvas editor
- These trigger text-led mode by design
