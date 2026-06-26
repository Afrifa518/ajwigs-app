# Design

## Theme
**Luxe + gold, light & dark.** Two themes share one token contract: a clean warm-white light theme and a warm near-black charcoal dark theme, both carried by a single champagne-gold accent. The admin reads as the back office of a luxury hair house — premium and calm. Users toggle via the header switch; the choice persists in `localStorage` (`ad-theme`) and defaults to the OS `prefers-color-scheme`. Tokens are CSS variables (RGB channels) defined on `.ad-theme` (light) and overridden by `.ad-dark`, consumed by Tailwind as `rgb(var(--ad-x) / <alpha-value>)`. The gold accent's text/fill values shift per theme so contrast holds on both white and charcoal (`--ad-on-gold` flips white↔dark for button labels). The public storefront keeps its own existing theme; this system governs `/admin/*`.

## Color (admin)
Defined as Tailwind theme tokens in `tailwind.config.ts`. Strategy: **Restrained** — neutral warm-charcoal surfaces, one gold accent used only for primary action / current selection / the single hero metric.

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#14110C` | App background (deepest) |
| `panel` | `#1B1711` | Cards, panels |
| `raised` | `#221D16` | Inputs, raised surfaces |
| `raised2` | `#2A241B` | Hover on raised |
| `line` | `#322B20` | Hairline borders |
| `line2` | `#423A2B` | Stronger dividers |
| `ink` | `#F3ECDD` | Primary text (warm off-white) |
| `muted` | `#B7AC95` | Secondary text (≥7:1) |
| `faint` | `#968B74` | Tertiary / meta (≥4.5:1) |
| `gold` | `#C9A24B` | Accent: primary action, selection, hero metric |
| `gold-hi` | `#E0BD6E` | Accent hover / emphasis |
| `gold-dim` | `#9A7C38` | Muted gold (borders, chart axis) |
| `success` | `#6FB893` | Paid / Delivered |
| `info` | `#79A6C8` | Out for delivery |
| `indigoish` | `#8E93D0` | Shipped |
| `warning` | `#E2A33C` | Packing |
| `danger` | `#D77E6B` | Errors / Cancelled |

Semantic surfaces use the base hue at low alpha (e.g. `bg-success/12 border-success/30 text-success`).

## Typography
- **Prata** (serif, already loaded) — brand wordmark + page titles only. A restrained brand moment; never on labels, buttons, data.
- **Outfit** (sans, already loaded) — everything functional: nav, labels, body, buttons, and all numeric data (`tabular-nums` for money/counts).
- Fixed rem scale (product UI), tight ratio. No fluid/clamped UI headings.

## Components (admin design system, `app/globals.css` `@layer components`)
- `.ad-card`, `.ad-card-raised` — panels.
- `.ad-input` — inputs/selects/textarea; gold focus ring (`focus:border-gold/50 focus:ring-2 focus:ring-gold/20`).
- `.ad-btn`, `.ad-btn-primary` (gold), `.ad-btn-ghost` (gold link) — every state: default/hover/focus-visible/disabled.
- `.ad-pill` — status/flag badges, base for semantic colour pairs.
- `.ad-scroll` — restores a thin styled scrollbar inside the admin (global rule hides scrollbars elsewhere).
- States: `.ad-shimmer` skeletons for loading; teaching empty states; all wrapped for `prefers-reduced-motion`.

## Motion
150–250ms state transitions; one soft staggered `.ad-in` fade-up on first content reveal (delays inline). Exponential ease-out. Reduced-motion → instant. No orchestrated page-load choreography, no decorative motion.

## Layout
Persistent left sidebar (collapses to an overlay drawer < lg) + sticky top bar. Content max-width ~1400px. Stat rows are a single divided panel, not four free-floating cards. Tables scroll horizontally inside `.ad-scroll`; card list fallback < sm.
