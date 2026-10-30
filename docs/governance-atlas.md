# Iran governance atlas

Route: `/governance/`. An entirely English LTR feature using the installed Mermaid renderer, local vector icons, system fonts and the existing site theme. The feature is linked from the primary navigation and the Explore menu. No runtime CDN, remote fonts or remote graph service is used. The route is included in the sitemap.

## Content model

- `src/data/governance.ts`: institutions, source registry, relationship types, ministry IDs and the exact 25 direct entries from the requested Persian Wikipedia category.
- `src/lib/governance.ts`: view selection, one-hop exploration, English search normalization and Mermaid generation.
- `src/components/governance/GovernanceAtlas.tsx`: accessible SVG interaction, text alternative, relation inspector, filters, export, zoom/pan and fullscreen.
- `src/components/governance/governance.css`: scoped responsive styling and local font declaration.

An edge records its own source. Administrative affiliation, appointment, nomination, election, screening, oversight, membership, secretariat hosting and historical transitions are separate relationship types. Secretariat hosting does not make the council a subsidiary of its host ministry. Multiple edges between the same institutions are intentional when they represent different stages or legal powers.

The root represents the institution of leadership, not an individual. The experts assembly is not shown as an administrative subsidiary of the leader. Its electoral selection and powers under Article 111 remain explicit. The six Guardian Council jurists are nominated by the head of the judiciary and elected by parliament; the six clerics are appointed by the leader. Clerics' screening of experts candidates is distinct from the Council's election oversight. Local council elections use their own supervision mechanism.

The public and candidate pools sit outside the state cluster in detailed views. Elected local councils and municipalities are part of the institutional structure. Seminary scholars and the teachers association are external participants in a religious approval process, not government subsidiaries.

## Coverage and provenance

Snapshot reviewed on 2026-10-30. All 25 **direct pages** in the user's Wikipedia category are represented. The category is an inventory, not proof of legal subordination to leadership. Each council links to its own article, with legal sources added for the constitutional and multistage appointment paths.

The dataset covers principal national institutions and agencies from the requested structure, all 19 ministries and selected public, religious and economic institutions. It is not a complete registry of every subsidiary company, provincial office, department, university, affiliated council or lower-tier legal entity. Aggregated units retain plural labels. The executive directory provides organizational context; it is not a substitute for individual agency charters or a live register. No completeness or legal-audit claim should be inferred from the “complete map” view: it means every record in this dataset.

Historical handling:

- Supreme Defense Council: pre-1989 structure; historical.
- Supreme Culture Council: historical institution predating the Islamic Republic.
- Supreme Informatics Council: dissolved/merged in 2016.
- Supreme Information Council: merged into the cyberspace council in 2016, distinct from the government's information council.
- Supreme War Support Council: wartime formation and relationships; current operational status not established by the sources checked.
- Defense Council formed in 2025: distinct from the pre-1989 Supreme Defense Council.

Historical and uncertain records have explicit node labels and an inclusion switch. The source list is curated and stored locally. Visiting this page does not scrape Wikipedia or perform live organizational updates. The category's subcategory contents are not recursively imported.

## Interaction

The opening view shows a reduced hierarchy; the appointment view and complete dataset retain cross-institutional cycles. The complete view includes every stored node and edge. Search operates on the entire English dataset, ignoring case, punctuation and accents. Search and relationship navigation open a one-hop neighborhood without losing the selected layer.

Each rendered SVG node is keyboard-operable with Enter or Space. The inspector exposes incoming/outgoing edges and provenance. A text-list mode provides an alternative to the graph. Empty-space dragging, native scroll and zoom buttons move around large maps. Downloads provide the current graph as `.mmd` or `.svg` and the complete dataset as JSON. The application and SVG exports use system font fallbacks. Exported SVGs include their native vector icons and LTR text rules. All source URLs retain their original destinations with non-ASCII path characters percent-encoded.

## Validation

`npm test` checks reference integrity, category coverage, appointment cycles, separation of membership and secretariat hosting, complete-view preservation, filtered endpoints, English normalization and public placement. `npm run typecheck` and `npm run build` validate the Next.js route.

Browser verification uses a temporary Playwright installation outside this repository. It exercises all nine views, history and relation filters, Persian search, keyboard node inspection, neighborhood navigation, text mode, zoom, downloads, fullscreen, dark theme and a 390px viewport. It also checks that the complete rendered map has the dataset's node count and that the page has no horizontal document overflow or browser exceptions. These checks validate rendering and interaction; they do not certify all legal relationships or live organizational status.

## Visual vocabulary

Node color comes exclusively from the stored `tier` field, independent of family, incoming appointment links and the selected view. The three branches share the national tier and all ministries share the governing tier. These are functional display tiers, not additional legal claims of administrative subordination. Selection changes stroke thickness without changing tier color.

Institutional family is conveyed by distinct minimal outline icons. Ministries also have specialist icons. `InstitutionIcon.tsx` provides the same local path geometry to React UI elements and the rendered Mermaid SVG; icons are preserved in SVG downloads. No external icon service or font is required.

All institution names, notes, relation labels, source titles, page text, status messages, accessible names, numeric formatting and exports are English. The metadata and page region declare English and LTR. The unit suite checks the complete content and every generated map for Arabic-script characters and validates peer-tier color consistency.
