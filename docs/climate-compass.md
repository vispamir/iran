# Climate compass

The homepage is a self-contained client experience in `src/components/climate/ClimateCompass.tsx`. Existing exploration routes remain accessible through its navigation.

## Content and assets

- `src/data/climate/destinations.ts`: eight destinations, two per season. Temperature values and matching bands are editorial planning examples, not verified historical averages. No API or credentials are required.
- `src/lib/destinationMatcher.ts`: rank first by distance from the suitable range, then by distance from the representative temperature. Extremes recommend the nearest available destination and display a qualification.
- `public/images/seasons/{spring,summer,autumn,winter}.svg`: original, local, schematic illustrations. Replace these files to change the artwork; they are not depictions of surveyed sites.
- `public/images/seasons/iran-map.svg`: transparent adaptation of the existing Natural Earth outline. Original attribution: `public/images/iran/map-source.md`. Destination markers are approximate and the map is deliberately visual, not clickable.
- General regional climate context: [Encyclopaedia Iranica: Climate](https://www.iranicaonline.org/articles/climate/). This source does not establish the app’s editorial numeric values.

## Interaction

Temperature, destination and unbounded wheel angle update atomically. Manual season selection uses the first destination for that season and updates the slider. Alternatives preserve the requested preference. Navigation rotates by quarter turns and wraps in either direction; direct selection takes the shortest path. Landscapes stay mounted and counterrotate to stay upright. The map stays fixed.

The wheel supports horizontal swipes, arrow keys, season labels and previous/next buttons. Vertical touch scrolling remains available. The native detail dialog traps focus, supports Escape, restores focus and closes through its return button or backdrop. Reduced-motion styles remove animation while preserving controls.

## Validation

Run `npm test`, `npm run typecheck`, and `npm run build`. There is no configured lint script. Climate tests cover ranking over the entire slider range, both unmatched extremes, season coverage, local assets and repeated rotation/wrap behaviour.
