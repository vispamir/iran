import { destinations, type Destination } from '../data/climate/destinations';
export function rangeDistance(value: number, [min,max]: [number,number]) { return Math.max(min-value,0,value-max); }
export function matchDestinations(temperature: number, pool: Destination[] = destinations) {
 return [...pool].sort((a,b)=>rangeDistance(temperature,a.suitableTemperatureRange)-rangeDistance(temperature,b.suitableTemperatureRange)||Math.abs(a.representativeTemperature-temperature)-Math.abs(b.representativeTemperature-temperature));
}
export function rotateToSeason(current: number, index: number, direction?: -1 | 1) {
 const target=-index*90;
 let delta=((target-current)%360+540)%360-180;
 if(direction===1 && delta>=0) delta-=360;
 if(direction===-1 && delta<=0) delta+=360;
 return current+delta;
}
