# Iran, Unfolded

Independent English-language Next.js website introducing Iran through eight perspectives.

## Development

```sh
npm install
npm run dev -- --port 3001
```

## Verify and build

```sh
npm run typecheck
npm run build
npm start -- --port 3001
```

Photography credits: `public/images/iran/credits.md`.

## Perspectives

- `/nature/`: rivers, mountains, forests, deserts and seas; static landscape map.
- `/economy/`: ports, factories, mines and materials.
- `/urban-life/`: everyday culture and urban amenities.

Page content is maintained in `src/lib/explore.ts`; the shared presentation is in
`src/components/ExplorePage.tsx` and `src/components/explore.css`.
The three pages and the homepage use local assets in `public/images/iran/`.
The nature map is a standalone SVG; its source and simplification notes are in
`public/images/iran/map-source.md`.

## Three-level Iran guide

`/explore/` is the directory for all 26 perspectives, 240 subjects and 1476 topics.
All 1742 destinations are statically generated, with nested English paths,
unique introductions, contextual icons and breadcrumb navigation.
The original `/nature/`, `/economy/` and `/urban-life/` visual guides remain available.

The shared **Explore Iran** header opens a three-column menu on desktop and
nested expandable sections on mobile. Branch selection is separate from page
navigation. Escape closes the panel and returns focus to its trigger.
The existing light/dark preference applies to all new pages and navigation.

### Maintaining content

- `docs/terms.md` preserves the Persian hierarchy and ordering.
- `src/data/taxonomy-en.txt` holds the reviewed English titles in matching order.
- `src/data/taxonomy-copy.txt` holds a subject introduction followed by its topic
  introductions, separated by `|`; each paragraph contains at least two sentences.
- `src/data/taxonomy-roots.json` holds top-level introductions, icons, menu images
  and links to the existing visual guides.

After editing editorial sources, run `npm run taxonomy:compile` (Python 3).
The script validates positional alignment and emits `taxonomy.json` for server
rendering and a smaller navigation-only JSON file for the client header.
The website never parses Markdown or invokes Python at runtime.
The original Persian title remains attached to every compiled record for auditing.

```sh
npm test
npm run typecheck
npm run build
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin before building for deployment.
It supplies canonical URL resolution, the XML sitemap and robots.txt. The local
default is `http://localhost:3001`.

A complete production HTTP audit is available after starting a built server:

```sh
python3 scripts/verify-routes.py http://localhost:3002
```

It checks all 1747 content pages, one H1 per page, unique guide metadata and
404 responses at invalid hierarchy depths. Results are saved to
`docs/route-verification.json`. UI reference captures are in `docs/previews/`.
