'use client';
import { BrandLogo } from '../BrandLogo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, Download, Expand, Focus, GitBranch, Layers3, List, Maximize2, Minus, Network, Plus, RotateCcw, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import type { MermaidConfig } from 'mermaid';
import { Mermaid } from '@/components/visualizations/Mermaid';
import { connections, councilCategoryIds, families, tiers, institutionById, institutions, relationTypes, reviewedAt, sources, type Institution, type Relation } from '@/data/governance';
import { makeMermaid, relatedEdges, relationshipLabel, searchInstitutions, selectGraph, views, type View } from '@/lib/governance';
import { InstitutionIcon, institutionPaths } from './InstitutionIcon';
import './governance.css';

const allTypes=Object.keys(relationTypes) as Relation[];
const config: MermaidConfig = {
  maxEdges: 1600, maxTextSize: 200000, look: 'classic', htmlLabels: true,
  flowchart: { htmlLabels: true, useMaxWidth: false, curve:'basis', nodeSpacing:32, rankSpacing:75, padding:10, wrappingWidth:300 },
  themeVariables:{ fontFamily:'Arial, Helvetica, sans-serif', fontSize:'20px', clusterBkg:'transparent', edgeLabelBackground:'#f5f3ed', lineColor:'#a2a799' },
};
const count=(n:number)=>n.toLocaleString('en-US');
function saveFile(content:string,type:string,name:string) {
  const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Status({node}:{node:Institution}) {
  if(!node.status)return null;
  return <span className="ga-status">{node.status==='historical'?'Historical':node.status==='merged'?'Merged / dissolved':'Current status unconfirmed'}</span>;
}
export default function GovernanceAtlas() {
  const [view,setView]=useState<View>('overview');
  const [selected,setSelected]=useState('leader');
  const [focus,setFocus]=useState<string>();
  const [query,setQuery]=useState('');
  const [types,setTypes]=useState<Relation[]>(allTypes);
  const [includeHistory,setIncludeHistory]=useState(true);
  const [filters,setFilters]=useState(false);
  const [listMode,setListMode]=useState(false);
  const [zoom,setZoom]=useState(1);
  const [direction,setDirection]=useState<'TB'|'LR'>('TB');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [ready,setReady]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  const [size,setSize]=useState({width:1400,height:1000});
  const board=useRef<HTMLDivElement>(null);
  const svgHost=useRef<HTMLDivElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const autoFit=useRef(true);
  const drag=useRef<{x:number;y:number;left:number;top:number;id:number}|null>(null);
  const graph=useMemo(()=>selectGraph(view,{focus,includeHistory,types}),[view,focus,includeHistory,types]);
  const source=useMemo(()=>makeMermaid(graph,undefined,direction),[graph,direction]);
  const node=institutionById[selected];
  const related=useMemo(()=>relatedEdges(selected),[selected]);
  const results=useMemo(()=>query.trim()?searchInstitutions(query):[],[query]);
  const currentView=views.find(v=>v.id===view)!;

  useEffect(()=>{
    setReady(false);setError('');
    const host=svgHost.current;
    if(!host)return;
    const observer=new MutationObserver(()=>{
      const svg=host.querySelector('svg'); if(!svg)return;
      const vb=svg.viewBox.baseVal;
      if(vb.width&&vb.height)setSize({width:vb.width,height:vb.height});
      host.querySelectorAll<SVGGElement>('.node').forEach(el=>{
        const id=el.id.match(/(?:^|-)flowchart-(.+)-\d+$/)?.[1];
        if(!id||!institutionById[id])return;
        el.dataset.institution=id;el.dataset.tier=institutionById[id].tier;
        if(!el.querySelector('[data-atlas-icon]')){
          const shape=el.querySelector('rect');
          if(shape){
            const icon=document.createElementNS('http://www.w3.org/2000/svg','g');
            icon.dataset.atlasIcon=institutionById[id].family;icon.setAttribute('aria-hidden','true');
            icon.setAttribute('transform',`translate(${Number(shape.getAttribute('x'))+10},-12) scale(1)`);
            icon.setAttribute('fill','none');icon.setAttribute('stroke',tiers[institutionById[id].tier].color);icon.setAttribute('stroke-width','1.6');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
            for(const d of institutionPaths(id,institutionById[id].family)){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);icon.append(path);}
            el.append(icon);
          }
        }
        el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',`Inspect ${institutionById[id].label}`);
      });
      setReady(true);
    });
    observer.observe(host,{childList:true,subtree:true});
    return ()=>observer.disconnect();
  },[source,listMode]);
  useEffect(()=>{
    const update=()=>setFullscreen(document.fullscreenElement===panel.current);
    document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);
  },[]);
  useEffect(()=>{
    svgHost.current?.querySelectorAll<SVGGElement>('[data-institution]').forEach(el=>{
      const active=el.dataset.institution===selected;el.dataset.selected=String(active);
      const record=institutionById[el.dataset.institution!],rect=el.querySelector('rect');
      if(rect&&record){rect.style.setProperty('stroke',tiers[record.tier].color,'important');rect.style.setProperty('stroke-width',active?'3px':'1.3px','important');}
    });
    if(ready&&autoFit.current&&board.current){
      autoFit.current=false;
      setZoom(Math.max(view==='overview'||view==='appointments'||focus? .7 : .35,Math.min(1,(board.current.clientWidth-60)/size.width)));
      board.current.scrollTo(0,0);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        const element=svgHost.current?.querySelector<SVGGElement>(`[data-institution="${focus??'leader'}"]`);
        const viewport=board.current;if(!element||!viewport)return;
        const rect=element.getBoundingClientRect(), area=viewport.getBoundingClientRect();
        viewport.scrollLeft+=rect.left-area.left-(viewport.clientWidth-rect.width)/2;
        viewport.scrollTop+=Math.max(0,rect.top-area.top-80);
      }));
    }
  },[selected,ready,size]);
  function changeView(id:View) {autoFit.current=true;setView(id);setFocus(undefined);setZoom(1);setQuery('');board.current?.scrollTo(0,0);}
  function inspect(id:string,center=false) {
    setSelected(id);setQuery('');
    if(center){autoFit.current=true;setFocus(id);setZoom(1);setTypes(allTypes);if(institutionById[id].status)setIncludeHistory(true);}
  }
  function onGraphActivate(target:EventTarget|null) {
    const el=(target as Element)?.closest<SVGGElement>('[data-institution]');
    if(el?.dataset.institution)inspect(el.dataset.institution);
  }
  function fit() {
    const viewport=board.current;if(!viewport)return;
    const scale=Math.min((viewport.clientWidth-50)/size.width,(viewport.clientHeight-50)/size.height);
    setZoom(Math.max(.025,Math.min(1.5,scale)));viewport.scrollTo(0,0);
  }
  function downloadSvg() {
    const svg=svgHost.current?.querySelector('svg');
    if(!svg){setNotice('The diagram is not ready yet.');return;}
    const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    clone.setAttribute('width',String(size.width));clone.setAttribute('height',String(size.height));
    clone.querySelectorAll('.node').forEach(el=>el.removeAttribute('tabindex'));
    const exportedStyle=document.createElementNS('http://www.w3.org/2000/svg','style');
    exportedStyle.textContent='text{font-family:Arial,Helvetica,sans-serif;direction:ltr;unicode-bidi:plaintext}.edgeLabel text{fill:#46513e!important}.edgeLabel rect{fill:#f5f3ed!important;opacity:1}';clone.append(exportedStyle);
    saveFile(new XMLSerializer().serializeToString(clone),'image/svg+xml;charset=utf-8','iran-governance.svg');
    setNotice('SVG downloaded.');
  }
  async function toggleFullscreen() {
    try {if(document.fullscreenElement)await document.exitFullscreen();else await panel.current?.requestFullscreen();}
    catch{setNotice('Fullscreen is not available in this browser.');}
  }
  const onRenderError=useMemo(()=> (reason:Error)=>{setError(reason.message);setReady(false);},[]);
  return <div className="ga-page" dir="ltr" lang="en">
    <header className="ga-hero">
      <div className="ga-hero-grid" aria-hidden="true"/>
      <div className="ga-hero-top"><span className="ga-kicker"><i/> IRAN GOVERNANCE ATLAS</span><span className="ga-edition">INSTITUTIONAL STRUCTURE / RESEARCH EDITION 01</span></div>
      <div className="ga-hero-main"><div><p className="ga-overline">INSTITUTIONS. CONNECTIONS. PATHS OF POWER.</p><h1>How does power<br/><em>connect?</em></h1><p className="ga-intro">Trace the hierarchy, the interlocking appointments and the electorate's limited paths of choice, from supreme leadership to executive agencies.</p></div><div className="ga-hero-mark" aria-hidden="true"><span>Leadership</span><div><i/><i/><i/></div><div><b><InstitutionIcon family="executive" size={15}/>Executive</b><b><InstitutionIcon family="legislature" size={15}/>Legislature</b><b><InstitutionIcon family="judiciary" size={15}/>Judiciary</b></div><small>POWER STRUCTURE / IRAN</small></div></div>
      <div className="ga-stats"><div><strong>{count(institutions.length)}</strong><span>institutional nodes</span></div><div><strong>{count(connections.length)}</strong><span>documented connections</span></div><div><strong>{count(councilCategoryIds.length)}</strong><span>council category entries</span></div><a href="#governance-map">Explore the map <ArrowDownRight size={21}/></a></div>
    </header>
    <section className="ga-workspace" id="governance-map" aria-label="Interactive map of governing institutions">
      <div className="ga-section-heading"><div><span className="ga-index">01 / THE CONNECTION MAP</span><h2>One structure. Many paths of power.</h2></div><p>Select an institution to read its incoming and outgoing connections.</p></div>
      <div className="ga-map-shell" ref={panel}>
        <div className="ga-map-top"><div className="ga-map-brand"><Network size={21}/><strong>Institution map</strong><span>INTERACTIVE</span></div><div className="ga-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search institutions" placeholder="Search all institutions..." aria-controls="ga-search-results" aria-expanded={!!query.trim()}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={15}/></button>}
          {!!query.trim()&&<div className="ga-search-results" id="ga-search-results"><small>{count(results.length)} results across the atlas</small>{results.slice(0,30).map(n=><button key={n.id} onClick={()=>inspect(n.id,true)}><InstitutionIcon id={n.id} family={n.family} size={16}/><span>{n.label}<Status node={n}/></span><ChevronRight size={14}/></button>)}{!results.length&&<p>No institutions match this search.</p>}{results.length>30&&<p>Refine your search to narrow these results.</p>}</div>}
        </div><button className="ga-icon-button" onClick={toggleFullscreen} aria-label={fullscreen?'Exit fullscreen':'Enter fullscreen'}><Maximize2 size={18}/></button></div>
        <nav className="ga-tabs" aria-label="Map layers">{views.map(v=><button key={v.id} aria-pressed={view===v.id&&!focus} onClick={()=>changeView(v.id)}>{v.id==='appointments'?<GitBranch size={15}/>:v.id==='all'?<Layers3 size={15}/>:v.id==='overview'?<Network size={15}/>:<InstitutionIcon family={v.id==='councils'?'council':v.id==='institutions'?'institution':v.id==='military'?'military':v.id as 'executive'|'legislature'|'judiciary'} size={15}/>}{v.label}</button>)}</nav>
        <div className="ga-tools"><div><button onClick={()=>setFilters(!filters)} aria-expanded={filters}><SlidersHorizontal size={15}/> Connections <span>{count(types.length)}</span></button><button aria-pressed={listMode} onClick={()=>setListMode(!listMode)}>{listMode?<Network size={15}/>:<List size={15}/>} {listMode?'Diagram view':'Institution list'}</button><button onClick={()=>{autoFit.current=true;setDirection(direction==='TB'?'LR':'TB');}} aria-label="Change diagram direction"><GitBranch size={15}/>{direction==='TB'?'Vertical':'Horizontal'}</button></div><div><button onClick={()=>saveFile(source,'text/plain;charset=utf-8','iran-governance.mmd')}><Download size={15}/> Mermaid</button><button onClick={downloadSvg} disabled={!ready}><Download size={15}/> SVG</button></div></div>
        {filters&&<div className="ga-filters"><span>SHOW CONNECTIONS</span>{allTypes.map(type=><label key={type}><input type="checkbox" checked={types.includes(type)} onChange={()=>setTypes(prev=>prev.includes(type)?prev.filter(t=>t!==type):[...prev,type])}/><i style={{background:relationTypes[type].color}}/>{relationTypes[type].label}</label>)}<button onClick={()=>setTypes(allTypes)}>All connections</button></div>}
        <div className="ga-map-body"><div className="ga-canvas-column"><div className="ga-canvas-heading"><div><span className="ga-live-dot"/><strong>{focus?`Around ${institutionById[focus].label}`:currentView.label}</strong><span>{count(graph.nodes.length)} nodes / {count(graph.edges.length)} connections</span></div>{focus?<button onClick={()=>{setFocus(undefined);setZoom(1);}}><RotateCcw size={13}/> Back to layer</button>:<span className="ga-view-caption">{currentView.subtitle}</span>}</div>
          {view==='all'&&!focus&&<div className="ga-dense-note">This is a large map. Use Fit for an overview, then zoom in to read individual connections.</div>}
          <div className={`ga-canvas ${listMode?'ga-list-mode':''}`} ref={board} tabIndex={0} aria-label="Diagram canvas. Drag empty space or scroll to move around." onPointerDown={e=>{
            if(listMode||e.button!==0||(e.target as Element).closest('.node,button,a'))return;
            drag.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging');
          }} onPointerMove={e=>{if(!drag.current)return;e.currentTarget.scrollLeft=drag.current.left-(e.clientX-drag.current.x);e.currentTarget.scrollTop=drag.current.top-(e.clientY-drag.current.y);}} onPointerUp={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging');}} onPointerCancel={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging');}}>
            {listMode?<div className="ga-institution-list">{graph.nodes.map(n=><button key={n.id} onClick={()=>inspect(n.id)} aria-pressed={selected===n.id}><span style={{color:tiers[n.tier].color}}><InstitutionIcon id={n.id} family={n.family} size={18}/>{families[n.family].label}</span><strong>{n.label}</strong><Status node={n}/><ChevronRight size={15}/></button>)}</div>:<div className="ga-diagram-width" style={{width:size.width*zoom}} ref={svgHost} onClick={e=>onGraphActivate(e.target)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onGraphActivate(e.target);}}}>
              {graph.nodes.length>0?<Mermaid source={source} config={config} onError={onRenderError} loading="Drawing institutional connections..."/>:<p className="ga-empty">No nodes remain in this view.</p>}
            </div>}
          </div>
          {error&&<div className="ga-error" role="alert">This view could not be drawn. The institution list and Mermaid download remain available.<details><summary>Error details</summary>{error}</details></div>}
          <div className="ga-canvas-bottom"><button className="ga-public-jump" onClick={()=>inspect('people',true)} aria-label="Show the electorate and election paths"><i className="ga-public-dot"/> The electorate and election paths <ChevronRight size={11}/></button><div className="ga-zoom"><button aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(.025,z/1.25))}><Minus size={15}/></button><output aria-label="Zoom percentage">{count(Math.round(zoom*100))}%</output><button aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(3,z*1.25))}><Plus size={15}/></button><button onClick={fit} disabled={!ready} aria-label="Fit entire diagram" title="Fit entire diagram"><Expand size={15}/><span>Fit</span></button><button aria-label="Reset zoom" onClick={()=>{setZoom(1);board.current?.scrollTo(0,0);}}><RotateCcw size={14}/></button></div></div>
        </div>
        <aside className="ga-inspector" aria-label="Selected institution details" aria-live="polite"><span className="ga-inspector-label">INSTITUTION LENS <Focus size={15}/></span><span className="ga-family" style={{color:tiers[node.tier].color}}><InstitutionIcon id={node.id} family={node.family} size={21}/>{families[node.family].label}</span><h3>{node.label}</h3><span className="ga-tier-label" style={{color:tiers[node.tier].color}}>{tiers[node.tier].label}</span><Status node={node}/>{node.note&&<p className="ga-node-note">{node.note}</p>}<button className="ga-focus-button" onClick={()=>inspect(selected,true)}><Focus size={16}/> Explore this institution's connections</button>
          {(['incoming','outgoing'] as const).map(dir=>{
            const links=related.filter(e=>dir==='incoming'?e.to===selected:e.from===selected);
            return <div className="ga-relations" key={dir}><h4>{dir==='incoming'?<ArrowDownRight size={15}/>:<ArrowUpRight size={15}/>} {dir==='incoming'?'Incoming connections':'Outgoing connections'} <span>{count(links.length)}</span></h4>{links.map((e,i)=><div className="ga-relation" key={`${e.from}-${e.to}-${e.type}-${i}`}><span className="ga-edge-type" style={{color:relationTypes[e.type].color}}>{relationTypes[e.type].label}</span><button onClick={()=>inspect(e.from===selected?e.to:e.from,true)}>{relationshipLabel(e,selected)}<ChevronRight size={12}/></button><p>{e.label}</p><a href={sources[e.source].url} target="_blank" rel="noreferrer">{e.basis??'Connection source'} <ArrowUpRight size={11}/></a></div>)}{!links.length&&<p className="ga-no-links">No connections recorded in this direction.</p>}</div>;
          })}
          <div className="ga-node-sources"><h4>Institution source</h4>{node.sources.map(id=><a key={id} href={sources[id].url} target="_blank" rel="noreferrer">{sources[id].title}<ArrowUpRight size={12}/></a>)}</div>
        </aside></div>
        <div className="ga-legend"><strong>COLOR / FUNCTIONAL TIER</strong>{Object.entries(tiers).map(([id,f])=><span key={id}><i style={{background:f.color}}/>{f.label}</span>)}<label><input type="checkbox" checked={includeHistory} onChange={e=>setIncludeHistory(e.target.checked)}/> Include historical and unconfirmed entries</label></div><div className="ga-icon-key" aria-label="Institution icon key"><strong>ICON / INSTITUTION TYPE</strong>{Object.entries(families).map(([id,f])=><span key={id}><InstitutionIcon family={id as Institution['family']} size={15}/>{f.label}</span>)}</div>
      </div>
      <p className="ga-keyboard-note">Select: click or Enter. Pan: drag empty space or scroll. Institution list: accessible text alternative.</p>
    </section>
    <section className="ga-reading"><div className="ga-cycle-card"><span className="ga-index">02 / THE APPOINTMENT LOOP</span><h2>Appointment, approval,<br/>election. Back to the top.</h2><div className="ga-cycle"><span>Leadership</span><ChevronRight/><span>Six council clerics</span><ChevronRight/><span>Experts candidates</span><ChevronRight/><span>Assembly of Experts</span><ChevronRight/><span>Leadership</span></div><p>The electorate chooses the Assembly of Experts from approved candidates. The assembly selects a successor when the Supreme Leader dies, resigns or is removed, and reviews continued eligibility for leadership.</p><button onClick={()=>{changeView('appointments');document.getElementById('governance-map')?.scrollIntoView({behavior:'smooth'});}}>Follow the appointment loop <ArrowUpRight size={17}/></button></div><div className="ga-public-card"><Users size={31}/><span className="ga-index">THE ELECTORATE, ALONGSIDE THE STATE</span><h2>Four paths of direct voting.</h2><div>{['President','Parliament','Assembly of Experts','City and village councils'].map((label,i)=><span key={label}><b>{count(i+1).padStart(2,'0')}</b>{label}<Check size={14}/></span>)}</div><p>Voters choose from eligible candidates. They do not directly elect the Supreme Leader, the head of the judiciary or military commanders. Local council eligibility review uses a mechanism separate from the Guardian Council.</p></div></section>
    <section className="ga-sources"><div><span className="ga-index">03 / SOURCES AND COVERAGE</span><h2>Documented structure. Clear boundaries.</h2><p>This edition covers principal national institutions and agencies, all 19 ministries and all 25 direct entries in the requested council category. Lower-tier companies, individual provincial offices and subcategory councils are not exhaustively listed. Aggregated units use plural labels.</p><p>Line styles identify the relationship. Chairing or holding membership does not establish administrative subordination. Secretariat links identify hosting arrangements. Historical and unconfirmed entries are explicitly marked. Shared node colors identify functional tiers; distinct icons identify institutional families.</p><small>Sources reviewed: {reviewedAt} · Institutions are shown without individual officeholder names.</small></div><div className="ga-source-links">{['constitution','expertsLaw','category','judiciary','directory','cultureRules','cyberRules'].map((id,i)=><a href={sources[id].url} key={id} target="_blank" rel="noreferrer"><span>{count(i+1).padStart(2,'0')}</span>{sources[id].title}<ArrowUpRight size={16}/></a>)}</div></section>
    <footer className="ga-footer"><a href="/" className="ir-logo" aria-label="Iran Unfolded home"><BrandLogo/></a><span>GOVERNANCE ATLAS / CONNECTIONS BEYOND THE NAMES.</span><button onClick={()=>saveFile(JSON.stringify({reviewedAt,institutions,connections,sources},null,2),'application/json;charset=utf-8','iran-governance.json')}><Download size={15}/> Download map data</button></footer>
    <div className="ga-toast" role="status">{notice&&<><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss message"><X size={13}/></button></>}</div>
  </div>;
}
