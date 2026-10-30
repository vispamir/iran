# Diagrams and charts

Preview all eight Chart.js types, a mixed chart and Mermaid examples at `/visualizations`.

```tsx
import { Chart, Mermaid } from '@/components/visualizations';

<Mermaid title="Journey" source={'flowchart LR\n A[Discover] --> B[Explore]'} />
<Chart title="Journeys" config={{
  type: 'bar',
  data: { labels: ['Nature', 'Culture'], datasets: [{ label: 'Journeys', data: [24, 18] }] },
}} />
```

Both components load their renderer on the client, respond to the site's `data-theme`, and use its CSS tokens. They handle unmounting, loading and errors. Mermaid scrolls on small screens; charts resize to their container. Pass `className`, `title` and `description` to either component. Chart `height` defaults to 320px. Provide a data table through Chart `children` for accessible canvas fallback.

## Mermaid

`source` accepts every diagram syntax included in the installed Mermaid package without a diagram-type whitelist. `config` accepts `MermaidConfig`, including diagram-specific configuration and theme-variable overrides. Rendering is serialized because Mermaid uses global configuration. Strict security is the default; only relax `securityLevel` for trusted input. Explicit themes, frontmatter and source directives can override the site appearance.

Use a stable client-side `setup(api)` function to register external diagrams, icon packs or layout loaders through the Mermaid API. These extensions and their assets are not bundled automatically. Keep registrations idempotent, since setup may run again on theme changes. `onError(error)` reports parsing/rendering failures.

## Chart.js

`config` accepts the native typed Chart.js configuration: bar, line, pie, doughnut, radar, polarArea, scatter and bubble, plus mixed datasets. Horizontal/stacked/area charts use native options such as `indexAxis`, `scales` and `fill`. All built-in controllers, elements, plugins and scales are registered. Dataset colors and options override the theme defaults. The original configuration is not mutated.

Use `config.plugins` for local plugins and a stable client-side `setup(api)` to register custom controllers, scales, global plugins or date adapters. Time/timeseries scales require a separately installed date adapter. Third-party chart types require their package and Chart.js type-registry augmentation; passing a name alone does not install an extension.

Use `onReady(chart)` for instance access (export through `toBase64Image`, interaction, or imperative operations); it runs again after configuration/theme changes. `onError(error)` reports failures. Memoize configuration objects and callbacks in stateful client parents to avoid unnecessary recreation. Define callbacks, plugins and setup in a Client Component, since functions cannot cross a Server-to-Client boundary.

API references: [Mermaid](https://mermaid.js.org/config/setup/mermaid/interfaces/Mermaid.html), [Chart.js integration](https://www.chartjs.org/docs/latest/getting-started/integration.html), [mixed charts](https://www.chartjs.org/docs/latest/charts/mixed.html).
