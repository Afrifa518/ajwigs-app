# Product

## Register

product

## Users
The shop owner of **El-ROI Lux Hairs Ltd** (a Ghana-based premium wig / luxury-hair retailer) and her staff. Largely non-technical. They use the admin to run the shop day to day: add and retire products, upload product photos, watch orders come in, and move each order through fulfilment (placed → packing → out for delivery → delivered). Sessions are often long and on modest hardware; clarity and low eye-strain matter more than density.

## Product Purpose
A staff CMS sitting behind the public storefront. Success = the owner can confidently run the entire shop without an engineer: list products, process orders, and read a quick pulse of the business (revenue, order volume, top products) at a glance.

## Brand Personality
Premium, warm, composed. The storefront sells luxury hair; the admin should feel like the back office of a luxury house — calm, considered, gold-accented — not a generic blue SaaS dashboard. Voice: plain, reassuring, never jargony (the owner is the audience, not engineers).

## Anti-references
- The generic "AI dashboard": slate-blue-grey surfaces, a rainbow fuchsia→violet→sky gradient on logos/charts/progress bars, four identical hero-metric cards. (This is exactly what we are replacing.)
- Full-saturation tech-startup palettes (electric blue/purple).
- Anything that makes a non-technical owner feel she's looking at a developer tool.

## Design Principles
1. **Premium but plain.** Elegance comes from restraint, typography, and one gold accent — never decoration for its own sake.
2. **The tool disappears into the task.** Standard affordances, consistent vocabulary screen to screen; the owner never has to relearn a control.
3. **Every state designed.** Loading (skeletons, not spinners), empty (teach the next action), error, hover/focus — all accounted for.
4. **Gold is a signal, not paint.** The accent marks the primary action, the current selection, and the single most important number — nothing else.
5. **Readable first.** Warm off-white ink on warm charcoal, contrast verified; no light-grey-on-grey "elegance".

## Accessibility & Inclusion
WCAG AA target: body text ≥4.5:1, large text/numbers ≥3:1, gold accents verified against charcoal. Full keyboard focus-visible states. All motion has a `prefers-reduced-motion` fallback. Status is never conveyed by colour alone (always paired with a label).
