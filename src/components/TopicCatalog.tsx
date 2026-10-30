'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { TopicIcon, type TopicIconKey } from './TopicIcon';
export type TopicCard = { id:string; title:string; href:string; intro:string; icon:TopicIconKey; count:number };
export function TopicCatalog({cards, label='Explore the subjects', searchable=false}:{cards:TopicCard[];label?:string;searchable?:boolean}) {
 const [query,setQuery]=useState('');
 const visible=cards.filter(n=>`${n.title} ${n.intro}`.toLowerCase().includes(query.toLowerCase().trim()));
 return <section className="topic-catalog" id="catalog" aria-label={label}><div className="topic-catalog-heading"><h2>{label}<span>{cards.length.toString().padStart(2,'0')}</span></h2>{searchable&&<div className="topic-search"><Search size={17}/><input type="search" aria-label="Search these categories" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a perspective…"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear category search"><X size={15}/></button>}</div>}</div><p className="sr-only" role="status">{visible.length} categories shown</p><div className="topic-card-grid">{visible.map(n=><Link href={n.href} key={n.id} className="topic-card"><span className="topic-card-icon"><TopicIcon name={n.icon} size={27}/></span><span className="topic-card-kind">{n.count?`${n.count} subjects`:'FIELD NOTE'}</span><h3>{n.title}</h3><p>{n.intro}</p><span className="topic-card-bottom">{n.count?'Look closer':'Read the introduction'}<ArrowUpRight size={18}/></span></Link>)}</div>{visible.length===0&&<div className="topic-empty"><h3>No perspectives found.</h3><p>Try a broader word, or clear your search to see every category.</p><button onClick={()=>setQuery('')}>Show all categories</button></div>}</section>;
}
