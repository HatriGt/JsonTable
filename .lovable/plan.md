## JSON-Table Redesign Plan

Replicate the JSONGrid two-pane layout (left: JSON source, right: nested grid) but with a premium, modern aesthetic and significantly better UX for filtering, sorting, and navigation.

### 1. Layout & Visual Redesign (Workspace)

**Two-pane split** (matching reference image):
- **Left pane (JSON source)**: monospaced JSON viewer with line numbers, syntax highlighting, fold gutters, mini search. Header label "JSON" + actions: Open, Search, Format, Compact, Validate, Clear.
- **Right pane (GRID)**: nested table view. Header label "GRID" + actions: Filters panel, Search, Expand all, Collapse all.
- **Center resize handle** with floating collapse/expand chevrons (like reference).
- **Footer collapse chevrons** for both panes (matching the bottom arrows in the reference).
- Premium dark theme with refined spacing, subtle dividers, glass headers, gradient brand accents.

### 2. Left Pane — JSON Source Viewer
- Replace current Tree with a code-style JSON viewer using **CodeMirror 6** (`@uiw/react-codemirror` + `@codemirror/lang-json`) for line numbers, folding, syntax highlighting, search.
- Read-only by default with an "Edit" toggle that syncs back to workspace state on blur.
- Click a line → highlight matching grid section (best-effort path mapping kept simple).

### 3. Right Pane — Nested Grid (the core)
Rebuild `NestedGrid` with cleaner visual hierarchy modeled on the reference:
- Object: key column (muted label) + value column. Value can be primitive or a nested mini-table.
- Array: header row with `[-] name[N]` chip showing **row count**, column headers with sort + filter icons, collapsible.
- Each array header has: collapse toggle, name, item count badge, filter button, sort button, column-menu (kebab).
- Smooth expand/collapse, sticky array headers within scroll, zebra rows, hover affordances.
- Primitive type coloring (string/number/bool/null) preserved with refined tokens.
- Inline row index column.

### 4. Advanced Filter Modal (per array column)
Click filter icon on any column header → opens a **Popover/Dialog** with:
- **Search box** (free-text across distinct values).
- **Select all / Clear** toggle.
- **Checkbox list** of distinct values (virtualized when >200) with counts per value.
- **Condition tabs**: Includes / Excludes / Equals / Contains / Greater than / Less than / Between (numeric-aware).
- **Free-text condition input** for text/number conditions.
- **Sort section**: Ascending / Descending / None.
- Footer: Reset, Cancel, Apply.
- Active filters show a colored dot on the column header and appear as removable chips above the table.

Built with shadcn `Popover` + `Command` + `Checkbox` + `Tabs` — no extra heavy deps.

### 5. Landing Page Polish
- "Paste JSON" CTA in landing hero opens paste dialog; on valid parse → auto-navigates to `/app` with the doc loaded (no extra click).
- "Try sample" button loads a curated sample (the user/orders example from the reference).
- Drag-and-drop overlay on landing as well.
- Tighten hero copy, add a small live preview mock that mirrors the new GRID look.

### 6. Empty State (workspace with no doc)
Replace current `DropZone` with a premium empty state:
- Large dashed dropzone card centered, with icon, "Drop a .json file" headline, subtext.
- Three quick actions: Paste JSON, Upload file, Load sample.
- Recent files list (from `recents.ts`) shown as cards underneath.
- Subtle animated grid background.

### 7. Technical Details
- **New deps**: `@uiw/react-codemirror`, `@codemirror/lang-json`, `@codemirror/theme-one-dark`. (Filter modal uses existing shadcn primitives.)
- **New files**:
  - `src/components/source/JsonSource.tsx` — CodeMirror-based left pane.
  - `src/components/grid/FilterPopover.tsx` — advanced filter modal.
  - `src/components/grid/ArrayTable.tsx`, `ObjectTable.tsx`, `PrimitiveCell.tsx` (extracted from NestedGrid for clarity).
  - `src/components/workspace/EmptyState.tsx` — premium empty state.
  - `src/store/filters.ts` — per-path column filter & sort state (keyed by JSON Pointer + column).
  - `src/lib/json/sample.ts` — built-in sample dataset.
- **Refactor**:
  - `Workspace.tsx` — new pane headers (JSON / GRID labels), footer collapse rail, refined chrome.
  - `NestedGrid.tsx` — split into the components above, hook up `useFilters` store.
  - `JsonGrid.tsx` — drop mode toggle; always nested. Keep flat mode out for now.
  - `Landing.tsx` — paste CTA opens dialog → auto-route to `/app` after parse; add Load sample.
- **State**: filter state persisted only in memory (not localStorage) for now; structure ready for persistence later.
- **Styling**: extend `src/styles.css` with new tokens for grid surfaces, header chips, filter active dot.

### 8. Out of scope (for this pass)
- Inline cell editing in the grid.
- Saved filter views.
- Virtualized object trees (only large arrays virtualized).
- AI features.

After approval I'll implement in this order: deps → store/sample → JsonSource → grid components + filter popover → workspace chrome → empty state → landing wiring.
