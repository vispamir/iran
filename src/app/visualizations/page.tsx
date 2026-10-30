import { Chart, Mermaid } from '@/components/visualizations';
import type { ChartConfiguration, ChartType } from 'chart.js';

const types: ChartType[] = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter', 'bubble'];
export default function VisualizationsPage() {
  return <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', color: 'var(--theme-ink)', fontFamily: 'Arial, sans-serif' }}>
    <h1>Diagrams & charts</h1>
    <p style={{ color: 'var(--theme-muted)' }}>Illustrative data · Switch the site theme to preview both appearances.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
      <Mermaid title="Journey flow" source={'flowchart LR\n A[Discover Iran] --> B{Explore}\n B --> C[Nature]\n B --> D[Culture]\n C --> E[Plan a journey]\n D --> E'} />
      <Mermaid title="Sequence" source={'sequenceDiagram\n actor Visitor\n Visitor->>Guide: Choose a destination\n Guide-->>Visitor: Discover a journey'} />
      {types.map(type => {
        const config: ChartConfiguration = {
          type,
          data: { labels: ['Nature', 'Culture', 'Cities', 'Heritage'], datasets: [{ label: 'Sample journeys', data: type === 'bubble' ? [{ x: 1, y: 4, r: 9 }, { x: 2, y: 7, r: 14 }, { x: 3, y: 5, r: 11 }] : type === 'scatter' ? [{ x: 1, y: 4 }, { x: 2, y: 7 }, { x: 3, y: 5 }] : [24, 18, 12, 21] }] },
        };
        return <Chart key={type} title={type} config={config} description="Illustrative data" />;
      })}
      <Chart title="Mixed chart" config={{ data: { labels: ['Spring', 'Summer', 'Autumn'], datasets: [{ type: 'bar', label: 'Journeys', data: [12, 18, 15] }, { type: 'line', label: 'Trend', data: [10, 16, 19] }] } }} />
    </div>
  </div>;
}
