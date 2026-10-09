# VĀRA — The Saree House

> **Made by Saksham & team** ([@sakshamfit](https://github.com/sakshamfit))
> **UI/UX design by Gireesh** ([@gireeshkumarreddy](https://github.com/gireeshkumarreddy))

VĀRA is a cinematic saree storefront concept. The homepage moves through a perspective image ribbon, an expanding editorial spread, a layered portrait reveal, a full-screen campaign with separating typography, a scattered image archive, a fabric immersion and a final product spread, closing on an oversized wordmark footer.

The brand, catalogue and prices are invented for this concept. Nothing here is a live shop.

## Credits

- **Made by:** Saksham and team ([@sakshamfit](https://github.com/sakshamfit)) — build, motion engine, catalogue and content.
- **UI/UX design:** Gireesh ([@gireeshkumarreddy](https://github.com/gireeshkumarreddy)) — interface design, layout system and interaction design.

## Run it locally

No dependencies and no build step are needed. The site is plain HTML, CSS and JavaScript in `dist/`. ES modules must be served over HTTP, so do not open `index.html` directly from the file system.

```bash
python3 -m http.server 8080 --directory dist
```

Then open http://localhost:8080.

## Checks

- `npm run check` — JavaScript syntax checks.
- `node scripts/verify-motion.mjs` — runs the motion engine against simulated desktop, tablet and mobile scroll positions and confirms every transform is finite. This is a simulated DOM check, not a visual browser test.

## Project structure

| Path | What it contains |
| --- | --- |
| `dist/index.html` | Semantic homepage, collection, product, bag, information and navigation dialogs. |
| `dist/styles.css` | Editorial layout system, tablet and mobile adaptations, focus states and reduced-motion rules. |
| `dist/catalog.js` | Eight illustrative products and the collection taxonomy. |
| `dist/app.js` | Collection, search and sort; product details; image zoom; quantity controls; wishlist and bag. |
| `dist/motion.js` | Scroll ranges, smooth interpolation, image masks, title splitting, parallax and atmosphere interpolation. |
| `dist/ribbon-geometry.js` | Projective image panels on a shared curved envelope: convex eye, concave bend, then flat ribbon. |
| `dist/assets/` | Nine original 1024 × 1536 WebP images, local fonts and font licence notices. |
| `scripts/verify-motion.mjs` | Motion-engine runtime smoke test. |
| `ASSET_PROVENANCE.md` | Exact image prompts, dimensions and provenance notes. |
| `MOTION_BLUEPRINT.md` | Frame-by-frame reference timings used to shape the motion. |

## How it behaves

- No third-party scripts, CDNs, trackers or network calls are required.
- Bag and wishlist persist in the visitor's own browser local storage.
- Native dialogs provide focus containment and Escape-to-close.
- Ambient motion has a pause control. The reduced-motion preference turns off ambient animation, parallax and entrance transitions.
- The interface states clearly that purchases are not enabled.

## Scope and disclaimers

- VĀRA is an invented brand concept. Catalogue imagery is AI-generated, prices are illustrative, and weave and material labels describe creative direction. They are not authenticity or provenance claims.
- The storefront supports exploration, product selection and bag review. It does not take payment, place orders, authenticate customers or connect real inventory.

## Taking it to production

To launch a real store, you would need to:

1. Replace the illustrative catalogue with verified product data and licensed product photography.
2. Connect inventory, checkout and payments.
3. Publish real fulfilment and returns policies.

## Verification status

JavaScript syntax, catalogue and asset consistency, local resource references, section anchors, unique IDs and motion-engine runtime checks have been run. Visual rendering, touch gestures and interactive browser behaviour have not yet been verified in a real browser.

Reference motion timings are estimates from a camera recording of a display. Scroll animation is tied to visitor progress, so the real duration depends on scroll speed.
