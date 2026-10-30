import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const read = path => readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`;
const dataUrl = moduleUrl(read('src/data/climate/destinations.ts'));
const { destinations, seasons } = await import(dataUrl);
const { matchDestinations, rangeDistance, rotateToSeason } = await import(moduleUrl(read('src/lib/destinationMatcher.ts').replace("'../data/climate/destinations'",JSON.stringify(dataUrl))));
test('every slider value returns the best available preference band, then nearest representative value',()=>{
 for(let value=-10;value<=40;value++){
  const ranked=matchDestinations(value);
  assert.equal(ranked.length,destinations.length);
  const best=ranked[0];
  for(const candidate of destinations){
   assert.ok(rangeDistance(value,best.suitableTemperatureRange)<=rangeDistance(value,candidate.suitableTemperatureRange));
   if(rangeDistance(value,best.suitableTemperatureRange)===rangeDistance(value,candidate.suitableTemperatureRange))assert.ok(Math.abs(best.representativeTemperature-value)<=Math.abs(candidate.representativeTemperature-value));
  }
 }
 assert.equal(matchDestinations(22)[0].id,'gilan');
 assert.ok(rangeDistance(-10,matchDestinations(-10)[0].suitableTemperatureRange)>0);
 assert.ok(rangeDistance(40,matchDestinations(40)[0].suitableTemperatureRange)>0);
});
test('all seasons have alternatives, valid representative values and local illustrations',()=>{
 assert.equal(new Set(destinations.map(d=>d.id)).size,destinations.length);
 for(const season of seasons)assert.ok(destinations.filter(d=>d.season===season.id).length>=2);
 for(const d of destinations){assert.equal(rangeDistance(d.representativeTemperature,d.suitableTemperatureRange),0);assert.ok(existsSync(new URL(`../public${d.image}`,import.meta.url)));}
});
test('successive rotations reach the selected quadrant and wrap in both directions',()=>{
 let angle=0;
 for(let i=1;i<=20;i++){const next=rotateToSeason(angle,i%4,1);assert.equal(next-angle,-90);angle=next;}
 for(let i=19;i>=0;i--){const next=rotateToSeason(angle,i%4,-1);assert.equal(next-angle,90);angle=next;}
 for(const index of [3,1,2,0,2,3,0,1]){const next=rotateToSeason(angle,index);assert.ok(Math.abs(next-angle)<=180);assert.equal(((next+index*90)%360+360)%360,0);angle=next;}
});
