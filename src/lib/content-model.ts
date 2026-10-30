export type Source = { id:string; title:string; publisher:string; url:string; locator?:string|null; access_date?:string };
export type Observation = { year:number|null; period_label:string; value:number|null; observation_status:string; note?:string|null; source_ids:string[] };
export type Series = { id:string; name:string; unit:string; scale:number; observations:Observation[] };
export type Dataset = { id:string; title:string; calendar:string; methodology:string; geography:string; series:Series[]; limitations:string[] };
export type ChartSpec = { type:'line'|'bar'|'pie'|'doughnut'; title:string; dataset_id:string; x_field:string; series_ids:string[]; x_axis_label:string; y_axis_label:string; y_axis_min:number|null; show_legend:boolean; connect_nulls:boolean; interpretation:string };
export type Block = { id:string; type:'text'|'markdown'|'markdown-mermaid'|'chart'|'table'|'image'|'video'; heading?:string; title?:string; content:string|ChartSpec|{title:string;dataset_id:string}; source_ids:string[]; summary?:string; alt?:string; caption?:string; credit?:string; rights?:string };
export type ContentPage = { schema_version:'1.0'; page_id:string; page_path:string; name:string; description:string; updated_at:string; as_of_date:string; editorial_status:'ready_for_review'|'needs_research'; seo:{title:string;description:string}; content:Block[]; sources:Source[]; datasets:Dataset[]; related_pages:{page_path:string;relationship:string}[]; research_notes:{limitations:string[];unverified_items:string[];data_gaps:string[];coverage_period:string|null} };
export function safeUrl(value:string):string|undefined {
 if(/^\/(?!\/)/.test(value)&&!/[\\\u0000-\u0020]/.test(value)&&!value.split('/').some(p=>p==='..'))return value;
 try{const u=new URL(value);if(['https:','http:'].includes(u.protocol))return value;}catch{}return undefined;
}
export function alignedData(dataset:Dataset, ids=dataset.series.map(s=>s.id)) {
 const series=ids.map(id=>dataset.series.find(s=>s.id===id)).filter((s):s is Series=>!!s);
 const periods=[...new Set(series.flatMap(s=>s.observations.map(o=>o.period_label)))];
 const years=new Map(series.flatMap(s=>s.observations.map(o=>[o.period_label,o.year] as const)));
 if(periods.every(p=>typeof years.get(p)==='number'))periods.sort((a,b)=>years.get(a)!-years.get(b)!);
 // Retain source labels; order numeric reporting years within their original calendar.
 return {periods,series:series.map(s=>({...s,values:periods.map(p=>s.observations.find(o=>o.period_label===p)?.value??null)}))};
}
export function validatePage(raw:unknown, identities:Map<string,string>):string[] {
 const errors:string[]=[]; const p=raw as ContentPage;
 if(!p||typeof p!=='object')return ['Not a page object'];
 if(p.schema_version!=='1.0'||identities.get(p.page_id)!==p.page_path)errors.push('Identity or schema mismatch');
 for(const key of ['name','description','updated_at','as_of_date'] as const)if(typeof p[key]!=='string')errors.push(`Missing ${key}`);
 if(!Number.isFinite(Date.parse(p.updated_at)))errors.push('Invalid updated_at');
 if(!['ready_for_review','needs_research'].includes(p.editorial_status))errors.push('Invalid editorial status');
 if(!p.seo||typeof p.seo.title!=='string'||typeof p.seo.description!=='string')errors.push('Invalid SEO');
 if(!Array.isArray(p.content)||!Array.isArray(p.sources)||!Array.isArray(p.datasets)||!Array.isArray(p.related_pages))return [...errors,'Missing arrays'];
 if(!p.research_notes||!['limitations','unverified_items','data_gaps'].every(k=>Array.isArray((p.research_notes as unknown as Record<string,unknown>)[k])))errors.push('Invalid research notes');
 const sourceIds=new Set(p.sources.map(s=>s.id));const datasets=new Map(p.datasets.map(d=>[d.id,d]));const blockIds=new Set();
 for(const s of p.sources)if(typeof s.id!=='string'||typeof s.title!=='string'||typeof s.url!=='string')errors.push('Invalid source');
 for(const d of p.datasets){
  if(!Array.isArray(d.series)||!Array.isArray(d.limitations)){errors.push('Invalid dataset');continue;}
  for(const s of d.series){if(!Array.isArray(s.observations)){errors.push('Invalid series');continue;}
   for(const o of s.observations)if(typeof o.period_label!=='string'||!(o.value===null||typeof o.value==='number'&&Number.isFinite(o.value))||!Array.isArray(o.source_ids)||o.source_ids.some(id=>!sourceIds.has(id)))errors.push('Invalid observation');
  }
 }
 for(const b of p.content){
  if(!b||typeof b.id!=='string'||blockIds.has(b.id)){errors.push('Invalid or duplicate block');continue;}blockIds.add(b.id);
  if(!Array.isArray(b.source_ids)||b.source_ids.some(id=>!sourceIds.has(id)))errors.push(`Unknown source in ${b.id}`);
  if(['text','markdown','markdown-mermaid','image','video'].includes(b.type)){
   if(typeof b.content!=='string')errors.push(`Invalid content in ${b.id}`);
   else if(['text','markdown','markdown-mermaid'].includes(b.type))for(const match of b.content.matchAll(/\[(s[\w-]+)\](?!\()/g))if(!sourceIds.has(match[1]))errors.push(`Unknown citation ${match[1]}`);
  }else if(b.type==='chart'||b.type==='table'){
   if(!b.content||typeof b.content!=='object'||!datasets.has(b.content.dataset_id))errors.push(`Unknown dataset in ${b.id}`);
   else if(b.type==='chart') {const c=b.content as ChartSpec;const d=datasets.get(c.dataset_id)!;if(!['line','bar','pie','doughnut'].includes(c.type)||!Array.isArray(c.series_ids)||c.series_ids.some(id=>!d.series.some(s=>s.id===id)))errors.push(`Invalid chart ${b.id}`);}
  }else errors.push(`Unknown block type ${b.type}`);
 }
 return errors;
}

/** Parse one saved batch, retaining the newest structurally valid candidate. */
export function ingestBatch(json:string, identities:Map<string,string>, pages:Map<string,ContentPage>, report:string[], file:string) {
 try {
  const raw:unknown=JSON.parse(json);if(!Array.isArray(raw))throw Error('Expected page array');
  for(const value of raw){let errors:string[];try{errors=validatePage(value,identities);}catch{errors=['Malformed page structure'];}
   if(errors.length){report.push(`${file}: ${errors.join('; ')}`);continue;}
   const p=value as ContentPage;const previous=pages.get(p.page_id);
   if(previous)report.push(`${file}: Duplicate ${p.page_id}; selecting newest updated_at (stable file order for ties)`);
   if(!previous||Date.parse(p.updated_at)>Date.parse(previous.updated_at))pages.set(p.page_id,p);
  }
 }catch(e){report.push(`${file}: ${String(e)}`);}
}
