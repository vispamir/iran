import type { Family } from '@/data/governance';

// A shared, local vector vocabulary for the UI, Mermaid nodes and SVG exports.
export const familyPaths: Record<Family, string[]> = {
  leadership: ['M2 7l5 4 5-8 5 8 5-4-3 13H5L2 7Z', 'M5 23h14'],
  executive: ['M4 22V5h16v17M9 5V2h6v3M8 9h2m4 0h2M8 13h2m4 0h2M10 22v-5h4v5'],
  legislature: ['M2 9l10-6 10 6H2ZM4 21h16M6 10v8m6-8v8m6-8v8'],
  judiciary: ['M12 3v18M7 21h10M4 7h16M5 7l-4 8h8L5 7Zm14 0-4 8h8l-4-8Z'],
  military: ['M12 2l8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6l8-4Z', 'M8 12l3 3 5-6'],
  council: ['M9 5a3 3 0 1 0 6 0 3 3 0 1 0-6 0M2 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0m14 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0', 'M5 10l3-2m8 0 3 2M10 19h4'],
  institution: ['M9 2h6v6H9ZM2 16h6v6H2Zm14 0h6v6h-6Z', 'M12 8v4H5v4m7-4h7v4'],
  public: ['M8 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 22v-3a6 6 0 0 1 12 0v3', 'M17 4a3 3 0 0 1 0 6m1 5a5 5 0 0 1 3 5v2'],
};
export const specialistPaths: Record<string, string[]> = {
  education: ['M3 3h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v17h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3V3Zm9 2v17'],
  ict: ['M4 8a12 12 0 0 1 16 0M7 12a7 7 0 0 1 10 0m-7 4a3 3 0 0 1 4 0m-2 4h.01'],
  intelligence: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm7 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0'],
  economy: ['M4 3h16v18H4V3Zm4 4h8M8 12h1m6 0h1m-8 5h1m6 0h1'],
  foreign: ['M2 12h20M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Zm0 0c5 5 5 15 0 20-5-5-5-15 0-20Z'],
  health: ['M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z'],
  labor: ['M3 7h18v14H3V7Zm5 0V3h8v4M3 12h18m-11 0v3h2v-3'],
  agriculture: ['M12 22V9M12 16C4 16 2 11 3 4c7 0 9 5 9 12Zm0-3c0-6 3-10 9-11 1 7-2 11-9 11Z'],
  justice: ['M12 3v18M5 21h14M3 7h18M5 7l-4 8h8L5 7Zm14 0-4 8h8l-4-8Z'],
  defense: ['M12 2l8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6l8-4Z', 'M8 8l8 8m0-8-8 8'],
  roads: ['M7 2 3 22M17 2l4 20M12 3v4m0 4v3m0 4v3'],
  industry: ['M3 22V9l6 4V7l6 4V2h5v20H3Zm3-5h2m3 0h2m3 0h2'],
  science: ['M8 2h8M10 2v7L3 21h18L14 9V2M7 15h10'],
  culture: ['M3 4c3 2 6 2 9 0v10c0 5-3 7-4 8-2-1-5-3-5-8V4Zm10 4c3 2 5 2 8 0v9c0 3-2 5-4 6', 'M6 10h1m2 0h1m-4 5c1 1 3 1 4 0'],
  interior: ['M3 11l9-8 9 8M5 9v13h14V9M9 22v-8h6v8'],
  heritage: ['M3 21h18M5 21V8h14v13M3 8l9-6 9 6H3Zm6 4v5m6-5v5'],
  oil: ['M12 2S4 11 4 16a8 8 0 0 0 16 0c0-5-8-14-8-14Zm-4 14a4 4 0 0 0 4 4'],
  energy: ['M13 2 3 14h8l-1 8 11-12h-8l1-8Z'],
  sports: ['M7 2h10v8a5 5 0 0 1-10 0V2Zm0 3H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-4 0h8'],
};
export function institutionPaths(id: string, family: Family) { return specialistPaths[id] ?? familyPaths[family]; }
export function InstitutionIcon({ id = '', family, size = 18 }: { id?: string; family: Family; size?: number }) {
  return <svg className="ga-institution-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{institutionPaths(id,family).map((d,i)=><path key={i} d={d}/>)}</svg>;
}
