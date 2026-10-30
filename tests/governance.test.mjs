import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

// Exercise the actual data and graph builder without a browser or a Next.js server.
const asModule=code=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(code,{mode:'strip'})).toString('base64');
const dataUrl=asModule(await readFile(new URL('../src/data/governance.ts',import.meta.url),'utf8'));
const data=await import(dataUrl);
const builder=await import(asModule((await readFile(new URL('../src/lib/governance.ts',import.meta.url),'utf8')).replace("'@/data/governance'",JSON.stringify(dataUrl))));
const {institutions,connections,sources,councilCategoryIds,relationTypes}=data;
const has=(from,to,type)=>connections.some(e=>e.from===from&&e.to===to&&e.type===type);

test('institution and relationship references are unique, valid and sourced',()=>{
  const ids=new Set(institutions.map(n=>n.id));
  assert.equal(ids.size,institutions.length);
  for(const n of institutions){assert.match(n.id,/^[a-zA-Z][a-zA-Z0-9]*$/);assert(n.label);for(const s of n.sources)assert(sources[s],`${n.id}: ${s}`);}
  const relationships=new Set();
  for(const e of connections){assert(ids.has(e.from),e.from);assert(ids.has(e.to),e.to);assert(sources[e.source],e.source);assert(relationTypes[e.type]);assert.notEqual(e.from,e.to);const key=[e.from,e.to,e.type,e.label].join('|');assert(!relationships.has(key),key);relationships.add(key);}
});

test('all 25 supplied category entries are represented, including historical records',()=>{
  assert.equal(councilCategoryIds.length,25);
  assert.equal(new Set(councilCategoryIds).size,25);
  assert.equal(institutions.filter(n=>n.categoryEntry).length,25);
  for(const id of ['oldCultureCouncil','oldDefenseCouncil'])assert.equal(data.institutionById[id].status,'historical');
  for(const id of ['informationCouncil','informaticsCouncil'])assert.equal(data.institutionById[id].status,'merged');
  assert.equal(data.institutionById.warSupportCouncil.status,'uncertain');
  const graph=builder.selectGraph('councils',{includeHistory:true,types:Object.keys(relationTypes)});
  for(const id of councilCategoryIds)assert(graph.nodes.some(n=>n.id===id),id);
});

test('appointment loop preserves distinct nomination, election and screening authorities',()=>{
  assert(has('leader','fuqaha','appoint'));
  assert(has('judiciary','jurists','nominate'));
  assert(has('parliament','jurists','elect'));
  assert(has('fuqaha','expertCandidates','screen'));
  assert(has('people','experts','elect'));
  assert(has('experts','leader','elect'));
  assert(has('experts','leader','oversee'));
  assert(!has('leader','experts','appoint'));
  assert(!connections.some(e=>e.from==='guardian'&&['localCouncils','localCandidates'].includes(e.to)));
});

test('secretaries retain all stages and councils do not become ministry subsidiaries through membership',()=>{
  for(const [council,secretary] of [['culturalCouncil','cultureSecretary'],['cyberCouncil','cyberSecretary']]){
    assert(has(council,secretary,'nominate'));assert(has('president',secretary,'nominate'));assert(has('leader',secretary,'screen'));assert(has('president',secretary,'appoint'));
  }
  assert(has('labor','laborCouncil','member'));assert(!has('labor','laborCouncil','hierarchy'));
  assert(has('employment','administrativeCouncil','support'));
});

test('complete map is lossless; every view, relation filter and history filter has valid endpoints',()=>{
  const options={includeHistory:true,types:Object.keys(relationTypes)};
  const complete=builder.selectGraph('all',options);
  assert.equal(complete.nodes.length,institutions.length);assert.equal(complete.edges.length,connections.length);
  assert.equal(data.ministryIds.length,19);
  for(const view of builder.views)for(const history of [true,false]){
    const g=builder.selectGraph(view.id,{...options,includeHistory:history});const ids=new Set(g.nodes.map(n=>n.id));
    for(const e of g.edges)assert(ids.has(e.from)&&ids.has(e.to));
    if(!history)assert(g.nodes.every(n=>!n.status));
    assert(builder.makeMermaid(g).startsWith('flowchart TB'));
  }
  const elections=builder.selectGraph('all',{...options,types:['elect']});assert(elections.edges.every(e=>e.type==='elect'));
  const focus=builder.selectGraph('all',{...options,focus:'guardian'});
  assert(focus.nodes.some(n=>n.id==='fuqaha'));assert(focus.nodes.some(n=>n.id==='jurists'));
});

test('English search ignores case and punctuation; Mermaid keeps the public outside the state group',()=>{
  assert(builder.searchInstitutions('GUARDIAN council').some(n=>n.id==='guardian'));
  assert(builder.searchInstitutions('presi-dent').some(n=>n.id==='president'));
  const text=builder.makeMermaid(builder.selectGraph('appointments',{includeHistory:true,types:Object.keys(relationTypes)}));
  const state=text.slice(text.indexOf('subgraph state'),text.indexOf('subgraph society'));
  assert(!state.includes('people['));assert(text.includes('people['));assert(text.includes('expertCandidates['));
});

test('all content, provenance URLs and generated diagrams contain no Arabic-script characters',()=>{
  const arabic=/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u;
  assert(!arabic.test(JSON.stringify({institutions,connections,sources,views:builder.views})));
  const graph=builder.selectGraph('all',{includeHistory:true,types:Object.keys(relationTypes)});
  assert(!arabic.test(builder.makeMermaid(graph)));
  for(const source of Object.values(sources))assert.doesNotThrow(()=>new URL(source.url));
});

test('tier colors remain identical for peers and stable across views and appointment cycles',()=>{
  for(const id of ['executive','parliament','judiciary'])assert.equal(data.institutionById[id].tier,'national');
  for(const id of data.ministryIds)assert.equal(data.institutionById[id].tier,'governing');
  for(const n of institutions)assert(data.tiers[n.tier],n.id);
  for(const view of ['overview','appointments','all']){
    const graph=builder.selectGraph(view,{includeHistory:true,types:Object.keys(relationTypes)});
    const text=builder.makeMermaid(graph);
    for(const id of ['executive','parliament','judiciary'])if(graph.nodes.some(n=>n.id===id))assert(text.includes(id+'[')&&text.split('\n').some(line=>line.startsWith(id+'[')&&line.endsWith(':::national')));
    for(const [id,tier] of Object.entries(data.tiers))assert(text.includes('classDef '+id+' fill:'+tier.pale+',stroke:'+tier.color));
  }
});

test('node labels never contain HTML spacing entities used as icon padding',()=>{
  const graph=builder.selectGraph('all',{includeHistory:true,types:Object.keys(relationTypes)});
  const text=builder.makeMermaid(graph);
  assert(text.split('\n').some(line=>line.startsWith('leader[')&&line.includes('Supreme Leadership')&&line.endsWith(':::apex')));
  assert.doesNotMatch(text,/&#160;|&nbsp;/);
});
