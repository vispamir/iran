import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=readFileSync('src/lib/content-model.ts','utf8');
const {alignedData,validatePage,safeUrl,ingestBatch}=await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
const taxonomy=JSON.parse(readFileSync('src/data/taxonomy.json'));const identities=new Map();
function walk(nodes,prefix=[]){for(const n of nodes){const path=[...prefix,n.slug];identities.set(n.id,`/explore/${path.join('/')}/`);walk(n.children,path);}}walk(taxonomy);
const pages=[];function scan(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const file=`${dir}/${e.name}`;if(e.isDirectory())scan(file);else if(e.name==='pages.json')pages.push(...JSON.parse(readFileSync(file)));}}scan('content');
test('every saved page validates against actual taxonomy and references',()=>{assert.ok(pages.length>0);for(const p of pages)assert.deepEqual(validatePage(p,identities),[],p.page_id);});
test('identity and citation errors reject a candidate',()=>{const p=structuredClone(pages[0]);p.page_path='/explore/incorrect/';assert.ok(validatePage(p,identities).length);p.page_path=pages[0].page_path;p.content[0].source_ids=['missing'];assert.ok(validatePage(p,identities).length);});
test('alignment preserves missing periods and zero values',()=>{const result=alignedData({series:[{id:'a',observations:[{period_label:'2020',value:0},{period_label:'2021',value:null}]},{id:'b',observations:[{period_label:'2021',value:12},{period_label:'2022',value:5}]}]});assert.deepEqual(result.periods,['2020','2021','2022']);assert.deepEqual(result.series.map(s=>s.values),[[0,null,null],[null,12,5]]);});
test('unsafe media and link protocols are rejected',()=>{for(const s of ['javascript:alert(1)','data:text/html,x','//evil.test/a','/../secret','/a\\b'])assert.equal(safeUrl(s),undefined);assert.equal(safeUrl('/images/test.jpg'),'/images/test.jpg');assert.equal(safeUrl('https://example.com/a.mp4'),'https://example.com/a.mp4');});

test('batch ingestion handles corruption, missing pages, conflicts and latest valid versions',()=>{
 const selected=new Map(), report=[];const first=structuredClone(pages[0]);first.updated_at='2025-01-01T00:00:00Z';
 ingestBatch('{',identities,selected,report,'corrupt');assert.equal(selected.size,0);assert.ok(report.length);
 ingestBatch(JSON.stringify([first]),identities,selected,report,'a');const newer={...first,updated_at:'2026-01-01T00:00:00Z'};
 ingestBatch(JSON.stringify([newer]),identities,selected,report,'b');assert.equal(selected.get(first.page_id).updated_at,newer.updated_at);
 ingestBatch(JSON.stringify([{...first,updated_at:'2027-01-01T00:00:00Z',page_path:'/wrong/'}]),identities,selected,report,'bad');assert.equal(selected.get(first.page_id).updated_at,newer.updated_at);assert.equal(selected.get('missing'),undefined);assert.ok(report.some(r=>r.includes('Duplicate')));
});
