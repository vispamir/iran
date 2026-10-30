# Explore content renderer

Explore articles are rendered on the server from `content/**/pages.json`. Other files, including prompts and raw responses, are ignored. JSON is data, never executable instructions. Rebuild to publish content changes; the index is immutable for each server/build worker lifetime.

A candidate must match both the taxonomy ID and canonical path and pass structural/reference validation. Invalid files or pages are skipped with an `[explore content validation]` report in build/server output. Duplicate IDs select the newest valid `updated_at`; equal dates retain the first file in sorted traversal order and produce a report. Missing content retains the taxonomy view. Both editorial states are visible with an explicit review/research notice.

The existing schema remains unchanged. Text headings begin article sections, and subsequent media/data blocks stay in source order. GFM Markdown is rendered without raw HTML. Source references resolve locally. Mermaid uses strict security. Images and videos accept root-relative public assets or HTTP(S) asset URLs; videos require direct media assets, not watch-page URLs. No autoplay is enabled. Broken media shows an inline fallback. Do not add unrelated illustrative assets.

Charts resolve page-local datasets and series, retain nulls, use original reporting labels, and include an expandable data table with observation status and citations. Units, scales, calendar, methodology, and limitations remain available alongside the visualization.

Run `npm test`, `npm run typecheck`, and `npm run build`. Production uses `.next/standalone/server.js` with the public and static assets copied into the standalone directory as described by Next.js standalone deployment. No content API or client-side filesystem access is introduced.
