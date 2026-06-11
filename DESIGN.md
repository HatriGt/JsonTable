# Design System

## Identity

**Terminal spreadsheet** — cool slate neutrals, electric indigo accent, JetBrains Mono for data surfaces, Inter for UI chrome.

## Color strategy

| Surface | Strategy |
|---------|----------|
| Workspace | Restrained — accent on selection, focus, primary actions only |
| Landing | Committed — indigo accent on headline keyword and primary CTA; demo frame carries visual weight |

All colors use OKLCH. Backgrounds are cool neutrals (hue ~258, chroma ≤0.006), not warm cream.

## Typography

- **UI**: Inter 400–700
- **Data / emphasis**: JetBrains Mono 400–600
- **Scale**: Fixed rem steps (product register). Hero max ~3.25rem landing, ~1.75rem workspace empty state.
- **Display tracking**: ≥ -0.03em on large headings

## Motion

- Durations: 120ms fast, 220ms normal (CSS tokens)
- Ease: cubic-bezier(0.16, 1, 0.3, 1)
- Reduced motion: zero durations via media query
- No orchestrated page-load sequences in workspace

## Banned patterns (do not reintroduce)

Gradient text, ghost-card (1px border + 16px+ shadow), decorative glass blur, side-stripe row accents, identical icon-card grids, orb empty-state heroes.

## Components

- shadcn/ui primitives with project tokens
- Grid: `grid-table`, `grid-header-cell`, `grid-body-cell` utilities
- Panes: `shell-pane`, `pane-resize-handle`
- Landing demo: `shadow-landing-demo` (border-primary, single modest shadow)
