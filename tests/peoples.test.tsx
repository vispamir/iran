import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { communities } from '../src/data/peoples/groups';

test('atlas preserves all thirteen requested identities and resolves every local vector portrait',()=>{
 assert.deepEqual(communities.map(c=>c.native),['لر','کرد','آذری','بلوچ','مازنی','گیلکی','فارس','بختیاری','عرب','لک','ترکمن','هرمزی','خراسانی']);
 assert.equal(new Set(communities.map(c=>c.id)).size,13);
 for(const c of communities){
  assert.equal(new URL(c.source).protocol,'https:');
  const svg=readFileSync(new URL(`../public/images/peoples/${c.id}.svg`,import.meta.url),'utf8');
  assert.match(svg,/<path\s/);
  assert.doesNotMatch(svg,/<image\b|data:image|<script\b/);
  assert.ok(c.areas.length>0);
  for(const [x,y,rx,ry] of c.areas){assert.ok(x>65&&x<615&&y>60&&y<520&&rx>0&&ry>0,`Invalid map area for ${c.id}`);}
 }
});

test('regional and overlapping identities are explicitly explained',()=>{
 for(const id of ['hormozgan','khorasani'])assert.match(communities.find(c=>c.id===id)!.detail,/regional/);
 assert.match(communities.find(c=>c.id==='bakhtiari')!.detail,/wider Lur/);
 assert.match(communities.find(c=>c.id==='lak')!.detail,/self-identification/);
});
