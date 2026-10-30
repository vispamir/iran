import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Chart, Mermaid } from '../visualizations';
import { ContentMedia } from './ContentMedia';
import { alignedData, safeUrl, type ContentPage, type Dataset, type Block, type ChartSpec } from '@/lib/content-model';
import './content.css';
const anchor=(id:string)=>`content-${encodeURIComponent(id)}`;
export function ContentArticle({page}:{page:ContentPage}) {
 const sources=new Map(page.sources.map(s=>[s.id,s]));
 function citations(ids:string[]){return <span className="content-citations">{ids.filter(id=>sources.has(id)).map(id=><a key={id} href={`#source-${id}`} aria-label={`Source ${id}`}>[{id}] </a>)}</span>;}
 function markdown(value:string){
  const text=value.replace(/\[(s[\w-]+)\](?!\()/g,(whole,id:string)=>sources.has(id)?`[${id}](#source-${id})`:whole);
  return <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
   h1:({children})=><h3>{children}</h3>,h2:({children})=><h3>{children}</h3>,
   a:({href,children})=><a href={href?.startsWith('#')?href:href?safeUrl(href):undefined}>{children}</a>,
   img:({src,alt})=>typeof src==='string'&&safeUrl(src)?<ContentMedia src={src} alt={alt??''}/>:null,
   table:({children})=><div className="content-table-scroll"><table>{children}</table></div>,
   code:({className,children})=>className==='language-mermaid'?<Mermaid source={String(children).trim()} description="Diagram embedded in this section"/>:<code className={className}>{children}</code>,
   pre:({children})=><div className="content-code">{children}</div>,
  }}>{text}</ReactMarkdown>;
 }
 function table(d:Dataset,ids?:string[]){const data=alignedData(d,ids);return <div className="content-table-scroll"><table><caption>{d.title} · {d.calendar}</caption><thead><tr><th scope="col">Reporting period</th>{data.series.map(s=><th key={s.id} scope="col">{s.name} ({s.unit}{s.scale!==1?`; ×${s.scale}`:''})</th>)}</tr></thead><tbody>{data.periods.map((period,i)=><tr key={period}><th scope="row">{period}</th>{data.series.map(s=>{const o=s.observations.find(o=>o.period_label===period);return <td key={s.id}>{s.values[i]===null?'Not available':s.values[i]?.toLocaleString('en-US')} {o&&<><small>{o.observation_status}{o.note?` — ${o.note}`:''}</small>{citations(o.source_ids)}</>}</td>;})}</tr>)}</tbody></table></div>;}
 function render(b:Block){
  if(b.type==='text'||b.type==='markdown'||b.type==='markdown-mermaid')return <>{b.title&&<h3>{b.title}</h3>}{markdown(b.content as string)}{b.summary&&<p>{b.summary}</p>}</>;
  if(b.type==='image'||b.type==='video'){const url=safeUrl(b.content as string);return <figure>{url?<ContentMedia src={url} alt={b.alt??b.caption??b.type} video={b.type==='video'}/>:<p>Media unavailable</p>}<figcaption>{b.caption}<small>{[b.credit,b.rights].filter(Boolean).join(' · ')}</small></figcaption></figure>;}
  const spec=b.content as ChartSpec;const dataset=page.datasets.find(d=>d.id===spec.dataset_id)!;
  if(b.type==='table')return table(dataset);
  const data=alignedData(dataset,spec.series_ids);const radial=['pie','doughnut'].includes(spec.type);
  return <><Chart title={spec.title} description={spec.interpretation} config={{type:spec.type,data:{labels:data.periods,datasets:data.series.map(s=>({label:s.name,data:s.values,spanGaps:spec.connect_nulls===true}))},options:{plugins:{legend:{display:spec.show_legend}},...(!radial?{scales:{x:{title:{display:true,text:spec.x_axis_label}},y:{beginAtZero:spec.type==='bar',...(spec.type!=='bar'&&spec.y_axis_min!==null?{min:spec.y_axis_min}:{}),title:{display:true,text:spec.y_axis_label}}}}:{})}}}/><p className="content-data-context">{dataset.geography} · {dataset.calendar}</p><details><summary>Data, units and methodology</summary><p>{dataset.methodology}</p>{table(dataset,spec.series_ids)}{dataset.limitations.map((l,i)=><p key={i}>{l}</p>)}</details></>;
 }
 const sections:{id:string;heading?:string;blocks:Block[]}[]=[];
 for(const b of page.content){if(b.heading||!sections.length)sections.push({id:b.id,heading:b.heading,blocks:[]});sections.at(-1)!.blocks.push(b);}
 return <div className="content-layout"><aside className="content-toc"><nav aria-label="On this page"><strong>On this page</strong>{sections.filter(s=>s.heading).map(s=><a href={`#${anchor(s.id)}`} key={s.id}>{s.heading}</a>)}<a href="#content-sources">Sources & research notes</a></nav></aside><article className="content-article" aria-label={`${page.name} article`}>
 <div className={`content-status ${page.editorial_status}`}><strong>{page.editorial_status==='needs_research'?'Research in progress':'Awaiting editorial review'}</strong><p>{page.editorial_status==='needs_research'?'This article has evidence gaps. Read the research notes before relying on its conclusions.':'This researched draft has not yet received final editorial approval.'}</p><small>Research cutoff: <time>{page.as_of_date}</time> · Updated: <time>{page.updated_at.slice(0,10)}</time></small></div>
 {sections.map(s=><section id={anchor(s.id)} key={s.id}>{s.heading&&<h2>{s.heading}</h2>}{s.blocks.map(b=><div className="content-block" key={b.id}>{render(b)}{citations(b.source_ids)}</div>)}</section>)}
 <section id="content-sources" className="content-sources"><h2>Sources & research notes</h2><ol>{page.sources.map(s=><li id={`source-${s.id}`} key={s.id}><strong>[{s.id}] </strong><a href={safeUrl(s.url)}>{s.title}</a><small>{s.publisher}{s.locator?` · ${s.locator}`:''}{s.access_date?` · Accessed ${s.access_date}`:''}</small></li>)}</ol>{Object.entries(page.research_notes).map(([key,value])=>value&&(Array.isArray(value)?value.length>0:true)?<div key={key}><h3>{key.replaceAll('_',' ')}</h3>{Array.isArray(value)?<ul>{value.map((v,i)=><li key={i}>{v}</li>)}</ul>:<p>{value}</p>}</div>:null)}</section>
 {page.related_pages.length>0&&<section><h2>Continue the story</h2><ul>{page.related_pages.filter(r=>/^\/explore\//.test(r.page_path)).map(r=><li key={r.page_path}><Link href={r.page_path}>{r.relationship}</Link></li>)}</ul></section>}
 </article></div>;
}
