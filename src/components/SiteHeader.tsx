'use client';
import { BrandLogo } from './BrandLogo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronRight, X } from 'lucide-react';
import navigation from '@/data/taxonomy-navigation.json';
import { ThemeToggle } from './ThemeToggle';
import { TopicIcon, type TopicIconKey } from './TopicIcon';
import './navigation.css';
type MenuNode = { title: string; slug: string; icon: string; image?: string; children: MenuNode[] };
const categories: MenuNode[] = navigation;
const href = (...parts: string[]) => `/explore/${parts.join('/')}/`;
export function SiteHeader() {
 const pathname = usePathname();
 const [open,setOpen] = useState(false);
 const [rootIndex,setRootIndex] = useState(0);
 const [groupIndex,setGroupIndex] = useState(0);
 const header = useRef<HTMLElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 const root = categories[rootIndex];
 const group = root.children[groupIndex];
 function close(restore=false) { setOpen(false); if(restore)trigger.current?.focus(); }
 useEffect(()=> {setOpen(false);},[pathname]);
 useEffect(()=> {
  if(!open)return;
  const dismiss=(event:PointerEvent)=>{if(!header.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);
  return ()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);};
 },[open]);
 function toggle() {
  if(!open){const current=categories.findIndex(c=>pathname.startsWith(href(c.slug)));setRootIndex(current>=0?current:0);setGroupIndex(0);}
  setOpen(!open);
 }
 return <header className="iran-site site-header-surface" ref={header} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <div className="site-header-inner"><Link href="/" className="ir-logo" aria-label="Iran Unfolded home" onClick={()=>close()}><BrandLogo/></Link>
  <nav className="site-primary-nav" aria-label="Main navigation"><button className={`mega-trigger ${open?'is-open':''}`} ref={trigger} onClick={toggle} aria-expanded={open} aria-controls="explore-mega-menu">Explore Iran <ChevronDown size={15}/></button><Link href="/nature/">Nature</Link><Link href="/economy/">Economy</Link><Link href="/urban-life/">Urban life</Link><Link href="/peoples/" aria-current={pathname.startsWith('/peoples')?'page':undefined}>Peoples</Link><Link href="/fashion/" aria-current={pathname.startsWith('/fashion')?'page':undefined}>Fashion</Link><Link href="/governance/" aria-current={pathname.startsWith('/governance')?'page':undefined}>Governance</Link><Link href="/four-season/" aria-current={pathname.startsWith('/four-season')?'page':undefined}>Four seasons</Link></nav>
  <div className="site-header-tools"><Link href="/explore/" className="site-directory-link">All perspectives <ArrowUpRight size={14}/></Link><ThemeToggle/></div></div>
  {open&&<div id="explore-mega-menu" className="mega-panel" role="region" aria-label="Explore Iran categories">
   <div className="mega-topline"><nav className="site-special-links" aria-label="Special features"><Link href="/peoples/" onClick={()=>close()}>Peoples of Iran</Link><Link href="/governance/" onClick={()=>close()}>Governance</Link><Link href="/fashion/" onClick={()=>close()}>Fashion</Link><Link href="/four-season/" onClick={()=>close()}>Four seasons</Link></nav><span>ONE COUNTRY. MANY WAYS TO DISCOVER.</span><Link href="/explore/" onClick={()=>close()}>View all 26 perspectives <ArrowUpRight size={14}/></Link><button aria-label="Close Explore Iran menu" onClick={()=>close(true)}><X size={18}/></button></div>
   <div className="mega-desktop"><div className="mega-column mega-roots"><h2>Perspectives <span>26</span></h2><div className="mega-scroll">{categories.map((n,i)=><div className={`mega-row ${i===rootIndex?'is-selected':''}`} key={n.slug}><button aria-pressed={i===rootIndex} aria-controls="mega-subcategories" onClick={()=>{setRootIndex(i);setGroupIndex(0);}}><TopicIcon name={n.icon as TopicIconKey} size={18}/><span>{n.title}</span><ChevronRight size={13}/></button><Link className="mega-direct" href={href(n.slug)} aria-label={`Open ${n.title}`} onClick={()=>close()}><ArrowUpRight size={14}/></Link></div>)}</div></div>
   <div className="mega-column" id="mega-subcategories"><div className="mega-column-heading"><span className="mega-caption">LOOK CLOSER</span><h2>{root.title}</h2><Link href={href(root.slug)} onClick={()=>close()}>Explore this perspective <ArrowUpRight size={13}/></Link></div><div className="mega-scroll">{root.children.map((n,i)=><div className={`mega-row mega-subrow ${i===groupIndex?'is-selected':''}`} key={n.slug}><Link href={href(root.slug,n.slug)} onClick={()=>close()}><TopicIcon name={n.icon as TopicIconKey} size={18}/><span>{n.title}</span></Link><button className="mega-reveal" aria-label={`Show topics in ${n.title}`} aria-pressed={i===groupIndex} aria-controls="mega-topics" onClick={()=>setGroupIndex(i)}><ChevronRight size={15}/></button></div>)}</div></div>
   <div className="mega-column mega-feature" id="mega-topics"><div className="mega-feature-image"><img src={`/images/iran/${root.image}`} alt={`A visual introduction to ${root.title}`}/><span>{root.title}</span></div><div className="mega-leaf-heading"><span className="mega-caption">DISCOVER THE DETAILS</span><Link href={href(root.slug,group.slug)} onClick={()=>close()}>{group.title}<ArrowUpRight size={14}/></Link></div><div className="mega-scroll mega-leaves">{group.children.map(n=><Link key={n.slug} href={href(root.slug,group.slug,n.slug)} onClick={()=>close()}><TopicIcon name={n.icon as TopicIconKey} size={16}/><span>{n.title}</span><ArrowUpRight size={12}/></Link>)}</div></div></div>
   <div className="mega-mobile">{categories.map(n=><details key={n.slug}><summary><TopicIcon name={n.icon as TopicIconKey} size={19}/>{n.title}<ChevronDown size={15}/></summary><div className="mega-mobile-root"><img src={`/images/iran/${n.image}`} alt={`Discover ${n.title}`} loading="lazy"/><Link href={href(n.slug)} onClick={()=>close()}>Explore {n.title}<ArrowUpRight size={14}/></Link>{n.children.map(g=><details key={g.slug}><summary><TopicIcon name={g.icon as TopicIconKey} size={17}/>{g.title}<ChevronDown size={14}/></summary><div className="mega-mobile-leaves"><Link href={href(n.slug,g.slug)} onClick={()=>close()}>Overview of {g.title}<ArrowUpRight size={13}/></Link>{g.children.map(l=><Link key={l.slug} href={href(n.slug,g.slug,l.slug)} onClick={()=>close()}><TopicIcon name={l.icon as TopicIconKey} size={15}/>{l.title}</Link>)}</div></details>)}</div></details>)}</div>
  </div>}
 </header>;
}
