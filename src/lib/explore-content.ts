import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { taxonomy, topicHref, type TopicNode } from './taxonomy';
import { ingestBatch, type ContentPage } from './content-model';

async function buildIndex() {
 const identities=new Map<string,string>();
 function visit(nodes:TopicNode[],prefix:string[]=[]){for(const n of nodes){const parts=[...prefix,n.slug];identities.set(n.id,topicHref(parts));visit(n.children,parts);}}visit(taxonomy);
 const pages=new Map<string,ContentPage>();const report:string[]=[];
 async function scan(dir:string):Promise<void>{
  let entries;try{entries=await readdir(dir,{withFileTypes:true});}catch(e){report.push(`${dir}: ${String(e)}`);return;}
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);
   if(entry.isDirectory())await scan(file);
   else if(entry.isFile()&&entry.name==='pages.json'){
    try{ingestBatch(await readFile(file,'utf8'),identities,pages,report,file);}catch(e){report.push(`${file}: ${String(e)}`);}
   }
  }
 }
 await scan(path.join(process.cwd(),'content'));
 if(report.length)console.warn('[explore content validation]',JSON.stringify(report));
 return {pages,report};
}
let index: ReturnType<typeof buildIndex> | undefined;
export function loadContent() { return index ??= buildIndex(); }
export async function getExploreContent(id:string,canonical:string){const p=(await loadContent()).pages.get(id);return p?.page_path===canonical?p:undefined;}
