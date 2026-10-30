import { connections, institutions, institutionById, tiers, relationTypes, ministryIds, type Connection, type Relation } from '@/data/governance';

export const views = [
  { id: 'overview', label: 'Overview', subtitle: 'The main hierarchy; explore cross-institutional links in Appointment loop' },
  { id: 'appointments', label: 'Appointment loop', subtitle: 'From appointed clerics to selection of the Supreme Leader' },
  { id: 'executive', label: 'Executive', subtitle: 'The presidency, 19 ministries and affiliated agencies' },
  { id: 'legislature', label: 'Legislature', subtitle: 'Parliament, the Guardian Council and the legislative process' },
  { id: 'judiciary', label: 'Judiciary', subtitle: 'Courts, prosecution offices and judicial organizations' },
  { id: 'military', label: 'Armed forces', subtitle: 'Commands, forces and connections with government' },
  { id: 'councils', label: 'Assemblies & councils', subtitle: 'All 25 requested category entries and related councils' },
  { id: 'institutions', label: 'Other institutions', subtitle: 'Appointed institutions, public bodies and local government' },
  { id: 'all', label: 'Complete map', subtitle: 'Every institution and connection recorded in this atlas' },
] as const;
export type View = typeof views[number]['id'];
const overview = ['leader','people','executive','president','parliament','judiciary','guardian','experts','staff','army','irgc','police','expediency','securityCouncil','culturalCouncil','cyberCouncil','broadcast','localCouncils'];
const appointments = ['leader','people','president','parliament','judiciary','guardian','fuqaha','jurists','experts','expertCandidates','majlesCandidates','presCandidates'];
export function selectGraph(view: View, options: { focus?: string; includeHistory: boolean; types: Relation[] }) {
  let ids: Set<string>;
  if (options.focus) {
    ids = new Set([options.focus]);
    connections.filter(e=>e.from===options.focus||e.to===options.focus).forEach(e=>{ids.add(e.from);ids.add(e.to);});
  } else if(view==='all') ids = new Set(institutions.map(n=>n.id));
  else if(view==='overview') ids = new Set(overview);
  else if(view==='appointments') ids = new Set(appointments);
  else {
    const family = view==='councils'?'council':view==='institutions'?'institution':view;
    ids = new Set(institutions.filter(n=>n.family===family).map(n=>n.id));
    const context: Record<string,string[]> = {
      executive:['leader','people','parliament','guardian','judiciary','localCouncils','municipalities','villages'],
      legislature:['leader','people','guardian','fuqaha','jurists','judiciary','executive','cabinet','expediency','majlesCandidates'],
      judiciary:['leader','justice','president','executive','jurists','parliament'],
      military:['leader','interior','defense','executive','defenseCouncil'],
      councils:['leader','president','parliament','judiciary','firstVP','economy','labor','roads','employment','education','foreign','industry','sports','budget','energy','agriculture','environment','centralBank','irgcIntelligence','ict','army','irgc','centralKhatam','people','workers','employers'],
      institutions:['leader','people','president','parliament','judiciary','localCouncils','municipalities','villages','countyCouncils','provinceCouncils','supremeProvinces','interior','martyrs','endowments','broadcastSupervision'],
    };
    (context[view]??[]).forEach(id=>ids.add(id));
  }
  const selected = institutions.filter(n=>ids.has(n.id)&&(options.includeHistory||!n.status));
  ids = new Set(selected.map(n=>n.id));
  let links = connections.filter(e=>ids.has(e.from)&&ids.has(e.to)&&options.types.includes(e.type));
  if(view==='overview'&&!options.focus) {
    const pairs=new Set(['leader:executive','leader:parliament','leader:judiciary','executive:president','leader:guardian','leader:staff','staff:army','staff:irgc','staff:police','leader:expediency','leader:securityCouncil','leader:culturalCouncil','leader:cyberCouncil','leader:broadcast','people:president','people:parliament','people:experts','people:localCouncils']);
    links=links.filter(e=>pairs.has(e.from+':'+e.to));
  }
  return { nodes: selected, edges: links, clustered: view!=='overview'||!!options.focus };
}
const escape = (value: string) => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','&#124;');
function wrap(label:string) {
  const words=label.split(' '); const lines:string[]=[]; let line='';
  for(const word of words) { if((line+' '+word).length>26&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word; }
  if(line)lines.push(line);
  // Native label padding reserves a compact icon slot before layout, without
  // inserting visible characters or moving the connector attachment points.
  return "<span style='display:inline-block;padding-left:20px;text-align:left'>"+lines.map(escape).join('<br/>')+'</span>';
}
export function makeMermaid(graph: ReturnType<typeof selectGraph>, selected?: string, direction:'TB'|'LR'='TB') {
  const lines = [`flowchart ${direction}`];
  const societyIds=new Set(['people','presCandidates','majlesCandidates','expertCandidates','localCandidates','workers','employers',...graph.nodes.filter(n=>n.external).map(n=>n.id)]);
  // Public participation remains beside the apparatus, outside its boundary.
  for (const [group,caption] of [['state','State institutions'],['society','Society and limited electoral choice']] as const) {
    const members=graph.nodes.filter(n=>group==='society'?societyIds.has(n.id):!societyIds.has(n.id));
    if(!members.length)continue;
    if(graph.clustered)lines.push(`subgraph ${group}["${caption}"]`);
    for(const n of members)lines.push(`${n.id}["${wrap(n.label)}${n.status?'<br/>◌ '+(n.status==='merged'?'Merged / dissolved':n.status==='historical'?'Historical':'Current status unconfirmed'):''}"]:::${n.tier}`);
    if(graph.clustered)lines.push('end');
  }
  for (const e of graph.edges) lines.push(`${e.from} ${relationTypes[e.type].dash?'-.':'--'} "${escape(e.label)}" ${relationTypes[e.type].dash?'.->':'-->'} ${e.to}`);
  Object.entries(tiers).forEach(([id,f])=>lines.push(`classDef ${id} fill:${f.pale},stroke:${f.color},color:#26312e,stroke-width:1.3px,rx:9,ry:9;`));
  lines.push('classDef chosen stroke-width:4px;');
  if(selected&&graph.nodes.some(n=>n.id===selected))lines.push(`class ${selected} chosen;`);
  if(graph.clustered&&graph.nodes.some(n=>!societyIds.has(n.id)))lines.push('style state fill:transparent,stroke:#a4aa9c,stroke-dasharray:4 5,color:#7b8275');
  if(graph.clustered&&graph.nodes.some(n=>societyIds.has(n.id)))lines.push('style society fill:#f7e9eb33,stroke:#b36570,stroke-dasharray:5 5,color:#b36570');
  graph.edges.forEach((e,i)=>lines.push(`linkStyle ${i} stroke:${relationTypes[e.type].color},stroke-width:${e.type==='hierarchy'?1.1:1.7}px;`));
  return lines.join('\n');
}
export const searchInstitutions = (query:string) => {
  const normalize=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
  const term=normalize(query);
  return institutions.filter(n=>normalize(n.label+' '+n.note).includes(term));
};
export const relatedEdges = (id:string) => connections.filter(e=>e.from===id||e.to===id);
export const ministryCount = ministryIds.length;
export function relationshipLabel(edge:Connection,id:string) {return institutionById[edge.from===id?edge.to:edge.from].label;}
