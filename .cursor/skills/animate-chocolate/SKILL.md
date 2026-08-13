---
name: animate-chocolate
description: >-
  Implements and animates the chocolate ganache drip (footer/cake icing) for
  Dadda's Confectionery. Use when adding, fixing, or animating a chocolate drip,
  ganache, icing, footer drip, cake drip, or when asked to animate chocolate on
  the bakery site. Always apply for footer icing work: drips hang top to bottom,
  keep the four-column footer links, compact decoration zone, glossy #2D241E /
  #7d562d ganache, GSAP fromTo via @/lib/gsap.
---

# Animate chocolate drip

Chocolate ganache icing for Dadda’s Confectionery. Default surface is the site footer. Same visual rules apply to a cake drip if asked.

## When to apply

- User mentions chocolate drip, ganache, icing, footer drip, cake drip, or animate chocolate.
- Editing `components/footer-drip.tsx` or the drip region of `components/footer.tsx`.
- Drips look flipped, cover links, or the decoration band is huge empty padding.

Correct direction is **top → bottom** even if `footer-drip.tsx` currently scales from the bottom or the path hangs upward. Fix the orientation; do not copy a flipped file.

## Visual rules

Encode these constraints as-is:

- Chocolate drip goes **from top to bottom** (flat icing edge at the top of the footer; irregular drips hang downward into the footer). Never flip drips so they hang upward into the page above.
- Keep the **footer menu links** (4 columns: brand, Quick Links, Our Specialties, Contact). Drips must not cover or replace links.
- Compact decoration zone (~70–110px), not a huge empty padding band.
- Glossy chocolate/caramel: `#2D241E` and `#7d562d`.
- Drips-only unless the user asks for candles.
- Real Pretoria contact stays in the footer.

Do not add candles, cake toppers, or extra illustration unless the user asks.

## Files

| Piece | Path |
| --- | --- |
| Drip SVG + GSAP | `components/footer-drip.tsx` (`FooterDrip`, `"use client"`) |
| Footer (keeps links) | `components/footer.tsx` — `import FooterDrip from "./footer-drip"` |
| GSAP | `import { gsap, useGSAP } from "@/lib/gsap"` |

Do not invent a second drip component. Do not put ganache markup inline in `footer.tsx`.

Footer columns to preserve: brand (logo + Dadda’s copy), Quick Links, Our Specialties, Contact. Contact stays the real Pretoria address (6814 Strawberry Street, Amandasig / Akasia), `+27 76 219 6675`, `info@daddasconfectionery.co.za`.

## Implementation

1. Full-width SVG ganache in `FooterDrip`, `viewBox="0 0 1440 …"`, `preserveAspectRatio="none"`.
2. Wrapper: `absolute inset-x-0 top-0`, height **70–110px** (96px is a good default). `overflow-hidden` (no overflow). `pointer-events-none`. `aria-hidden="true"`.
3. z-index so links stay clickable: drip `z-[1]`, footer content `relative z-10` (already on the inner wrapper in `footer.tsx`).
4. Path: flat icing along the **top** of the viewBox (small y); scallops and droplets increase **y** downward into the footer. Do not use a bottom-edge baseline (`y≈120` with curves toward `y≈20`) — that hangs drips upward.
5. Gradient: dark `#2D241E` through caramel `#7d562d`. Unique gradient ids via `useId()` (colons stripped) so multiple instances do not clash.
6. Optional detached droplets as ellipses **below** the scallops (larger `cy` than the icing edge), not above the page.

## GSAP

- Import `gsap` and `useGSAP` from `@/lib/gsap` only (already registers `@gsap/react` + ScrollTrigger).
- Scope every tween with a ref: `useGSAP(() => { … }, { scope: scopeRef })`.
- Use **`fromTo`, not `from`**. `from()` fights React 18+ strict mode / remounts.
- `gsap.matchMedia()`:
  - `(prefers-reduced-motion: reduce)` → `gsap.set` final visible state (`autoAlpha: 1`, `scaleY: 1`, `y: 0`).
  - `(prefers-reduced-motion: no-preference)` → `fromTo` intro + optional yoyo idle.
- Animate **transforms and opacity only** (`y`, `scaleY`, `scale`, `autoAlpha`). No `width`/`height`/`top`/`padding` tweens.
- **`transform-origin` at the top edge** for downward drips (`"50% 0%"` or `"top"`). Never `"50% 100%"` / `"bottom"` — that grows drips upward.
- Revert: `return () => mm.revert()`.
- Looping idle: `immediateRender: false` on delayed repeats so they do not clobber the intro.

### Downward drip orientation (required)

```tsx
gsap.fromTo(
  ".footer-drip-layer",
  { y: -12, autoAlpha: 0, scaleY: 0.72 },
  {
    y: 0,
    autoAlpha: 1,
    scaleY: 1,
    duration: 0.85,
    ease: "power2.out",
    transformOrigin: "50% 0%", // top edge; scaleY grows downward
  },
)
```

CSS equivalent: `transform-origin: top;` then `scaleY` from `< 1` to `1`. Intro may start slightly above (`y` negative) so icing settles onto the footer top; drips still hang **down**.

Wrong (do not ship): `transformOrigin: "50% 100%"`, `scaleY` from the bottom, or a path whose drips point toward the page above the footer.

## Do not

- Flip the SVG or origin so drips hang upward into the page above.
- Cover, hide, or replace the four footer columns.
- Inflate footer `pt-*` into a large empty band; keep the drip zone compact (~70–110px).
- Add candles unless asked.
- Use `gsap.from()`.
- Animate layout properties.
- Edit `.next/` or commit unless asked.
