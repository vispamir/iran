# The People of Iran

Route: `/peoples/`. Linked from the shared header, the mobile Explore menu, and the sitemap.

An English editorial atlas of the thirteen communities requested in the brief. The framing is **Many roots. One Iran.** Ethnic, linguistic and regional identities overlap; this selection is not a census or an exhaustive list.

## Editorial data and map

`src/data/peoples/groups.ts` holds names, language descriptions, approximate home regions, reading links and map areas. The map outline reuses the existing local climate-map geometry. Shaded ellipses are schematic editorial orientation, clipped to the outline. They are not surveyed boundaries, demographic distributions or exclusive territory. Migration and urban communities are explicitly acknowledged. Khorasani and Hormozgani are regional umbrellas; Bakhtiari overlaps with wider Lur identity; Laki relationships are presented without imposing one contested classification.

Background reading is linked beside each profile: Encyclopaedia Iranica, University of Arizona Iranian Languages, and the Library of Congress country study hosted at Country Studies. These describe historical and linguistic geography; the atlas makes no numerical population claims. Clothing illustrations are contemporary artistic interpretations, not verified reconstructions.

## Artwork

Built-in `image_gen` generated fourteen independent images: one gathering and thirteen woman/man pairs, with uncovered hair, distinct poses, individually varied natural appearances and contemporary regional textile references. Exact prompts are saved in `docs/peoples-image-prompts.json`.

`public/images/peoples/` contains RGBA PNG originals and transparent SVG vectorizations. SVGs contain real vector paths, not embedded raster images. The individual pairs use SVG on the page; the hero uses the PNG through Next Image for responsive optimization. Its SVG is also supplied. No runtime external image/font/CDN dependencies are introduced.

To reproduce vectorization in an isolated Python environment with `vtracer==0.6.12` installed:

```sh
python scripts/peoples/vectorize.py public/images/peoples/*.png
```

The script preserves PNG masters. It follows the original generated alpha rather than painting a background.

## Interaction and accessibility

Scrolling selects the profile crossing the reading line and updates the map, caption and selected navigation. Map markers and community links navigate to anchored profiles; previous/next controls wrap through all thirteen. The desktop map stays alongside the text; on mobile a compact map stays above it. Links are keyboard accessible and retain anchor destinations. Reduced-motion preferences disable smooth programmatic scrolling and scroll-entry animation. Dark and light themes use the existing site theme control.

## Validation

Use `npm run typecheck`, `npm run build` and `npm test`. Browser QA should cover map selection, previous/next wraparound, manual scroll synchronization, direct hash entry, portrait loading, light/dark contrast, desktop/tablet/mobile composition, horizontal overflow and reduced motion. A standalone production preview requires `.next/static` and `public` next to `.next/standalone/server.js`; do not use `next start` for this configuration.

### Verified in this implementation

- Production build generated 1,756 pages including `/peoples/`; TypeScript passed.
- All 26 Node tests passed, including complete thirteen-identity coverage and real SVG asset validation.
- Sixteen HTTP checks passed: the page, the sitemap (containing the new route), and fourteen SVG assets.
- All fourteen PNG masters have transparent alpha; all fourteen SVGs contain vector paths and no embedded raster.
- Browser review covered 320px mobile, 820px tablet and 1470px desktop; no horizontal page overflow was observed. Map marker selection, manual scroll selection, profile links, previous/next controls, last-to-first wraparound and light/dark layouts were checked. The final Khorasani portrait was confirmed loaded in the browser.
- Screenshot: `artifacts/peoples/atlas-desktop.png`. Reduced-motion behavior is implemented; OS preference switching was not exercised in browser QA.
