# NĀ fashion editorial

Route: `/fashion`. This standalone magazine treatment retains the existing Iran site and links back to its editorial directory. The global header is omitted for this route, which supplies its own accessible navigation.

The page uses the three supplied local JPGs through Next Image. These are editorial visual references, not verified documentary photographs. Captions disclose that provenance, locations, dates and makers are unverified. Confirm rights and attribution before external publication. No claims about specific textile origins are made. Cargo and scarf visual studies use inline SVG illustrations, clearly captioned; there are no substitute documentary images.

Content is maintained in `src/app/fashion/page.tsx`; the five elements are structured data. Styling lives in `src/app/fashion/fashion.css`. Navigation uses a small client component with IntersectionObserver, Escape handling and expanded-state semantics. All article content remains server-rendered; scroll reveals progressively enhance browsers with CSS view timelines. Reduced motion disables animations. Local system serif/sans-serif stacks avoid external font dependencies.

Contact and social accounts were not supplied. The footer states that contact details are not configured and invents no accounts. English is a language indicator, not an unavailable translation switch.

Verification: production build and all eight existing tests passed. Browser preview could not connect to the local dev server; desktop/mobile visual QA remains unverified.
