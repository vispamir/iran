import test from 'node:test';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const roots=JSON.parse(read('src/data/taxonomy.json'));
const nav=JSON.parse(read('src/data/taxonomy-navigation.json'));
const flat=[];
function visit(nodes,prefix=[]){for(const n of nodes){const path=[...prefix,n.slug];flat.push({...n,path});visit(n.children,path)}}visit(roots);
test('all three levels preserve the complete Persian source order',()=>{
 const expected=read('docs/terms.md').split('\n').filter(l=>l.startsWith('## ')||l.startsWith('- ')||l.startsWith('  - ')).map(l=>l.replace(/^##\s+[\d۰-۹]+\.\s*|^  - |^- /g,''));
 assert.deepEqual(flat.map(n=>n.sourceTitle),expected);
 assert.deepEqual([1,2,3].map(d=>flat.filter(n=>n.path.length===d).length),[26,240,1476]);
});
test('paths and IDs are unique and bounded to three levels',()=>{
 assert.equal(new Set(flat.map(n=>n.id)).size,1742);
 assert.equal(new Set(flat.map(n=>n.path.join('/'))).size,1742);
 const paths=new Set(flat.map(n=>n.path.join('/')));
 for(const n of flat){assert.match(n.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(n.path.length<=3);if(n.path.length>1)assert.ok(paths.has(n.path.slice(0,-1).join('/')))}
 assert.ok(paths.has('history/ancient-civilizations/elam'));
 assert.ok(paths.has('geography/physical-geography/lut-desert'));
 assert.ok(paths.has('travel/nature-travel/lut-desert'));
 assert.ok(!paths.has('history/not-a-category'));
});
test('every topic has English text, a distinct introduction, and a real icon',()=>{
 const icons=read('src/components/TopicIcon.tsx');
 assert.equal(new Set(flat.map(n=>n.intro)).size,1742);
 for(const n of flat){assert.ok(n.title.length>1);assert.doesNotMatch(n.title+n.intro,/[\u0600-\u06ff]/);assert.ok(n.intro.split(/(?<=[.!?])\s+/).length>=2,n.title);assert.ok(icons.includes(`${n.icon}:`),`${n.title}: ${n.icon}`);assert.ok(n.intro.length>55,n.title)}
});
test('menu retains every destination without shipping long-form copy',()=>{
 const result=[];function walk(nodes,p=[]){for(const n of nodes){assert.equal(n.intro,undefined);assert.equal(n.sourceTitle,undefined);const path=[...p,n.slug];result.push(path.join('/'));walk(n.children,path)}}walk(nav);
 assert.deepEqual(result,flat.map(n=>n.path.join('/')));
 for(const n of roots)assert.ok(existsSync(new URL(`../public/images/iran/${n.image}`,import.meta.url)),n.image);
});
test('the reviewed editorial sources reproduce the compiled tree',()=>{
 execFileSync('python3',['scripts/build-taxonomy.py','--check'],{cwd:new URL('../',import.meta.url)});
 const en=read('src/data/taxonomy-en.txt');
 const copy=read('src/data/taxonomy-copy.txt');
 assert.equal(en.split('\n').filter(l=>l.startsWith('# ')).length,26);
 assert.equal(copy.split('\n').filter(l=>l.startsWith('@ ')).length,240);
 assert.equal(roots.filter(n=>n.feature==='/nature/').length,3);
 assert.ok(roots.some(n=>n.feature==='/economy/'));
 assert.ok(roots.some(n=>n.feature==='/urban-life/'));
});
