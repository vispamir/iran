import { BrandLogo } from './BrandLogo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { taxonomy, topicHref, type TopicNode } from '@/lib/taxonomy';
import { TopicIcon } from './TopicIcon';
import { TopicCatalog, type TopicCard } from './TopicCatalog';
import './taxonomy.css';
import type { ContentPage } from '@/lib/content-model';
import { ContentArticle } from './content/ContentArticle';
const card = (node:TopicNode,prefix:string[]):TopicCard=>({id:node.id,title:node.title,href:topicHref([...prefix,node.slug]),intro:node.intro,icon:node.icon,count:node.children.length});
export function TaxonomyPage({path,ancestors,content}:{path:string[];ancestors:TopicNode[];content?:ContentPage}) {
 const node=ancestors.at(-1), root=ancestors[0], parent=ancestors.at(-2);
 const siblings=path.length>1?(parent?.children??[]):taxonomy;
 const position=node?siblings.findIndex(n=>n.id===node.id):-1;
 const next=position>=0?siblings[(position+1)%siblings.length]:undefined;
 const children=node?.children??taxonomy;
 return <div className="iran-site taxonomy-page"><div className="taxonomy-shell">
 <nav className="topic-breadcrumb" aria-label="Breadcrumb"><ol><li><Link href="/">Home</Link></li><li>{node?<Link href="/explore/">Explore Iran</Link>:<span aria-current="page">Explore Iran</span>}</li>{ancestors.map((n,i)=><li key={n.id}>{i===ancestors.length-1?<span aria-current="page">{n.title}</span>:<Link href={topicHref(path.slice(0,i+1))}>{n.title}</Link>}</li>)}</ol></nav>
 <header className="topic-hero"><div><span className="ir-eyebrow">{node?`${root.title.toUpperCase()} / ${path.length===1?'PERSPECTIVE':path.length===2?'SUBJECT':'FIELD NOTE'}`:'AN OPEN INVITATION TO DISCOVER'}</span><h1>{node?(content?.name??node.title):<>A country of stories.<br/><em>Find your way in.</em></>}</h1><p>{node?(content?.description??node.intro):'Start with a question, a place or something that catches your eye. Twenty-six perspectives connect Iran’s landscapes and histories with the ideas and everyday lives of its people.'}</p><div className="topic-hero-meta"><span>{node?`LEVEL 0${path.length}`:'26 PERSPECTIVES'}</span><span>{children.length?`${children.length} ${node?'subjects to explore':'starting points'}`:'Part of a connected cultural guide'}</span></div></div><span className="topic-hero-icon"><TopicIcon name={node?.icon??'travel'} size={128}/></span></header>
 {content&&<ContentArticle page={content}/>}
 {children.length>0?<TopicCatalog cards={children.map(n=>card(n,path))} searchable label={node?'Explore this perspective':'Choose a perspective'}/>:!content?<section className="topic-reading"><div className="topic-reading-label"><TopicIcon name={node!.icon} size={24}/><span className="ir-eyebrow">CONNECTIONS WORTH FOLLOWING</span></div><h2>A detail within<br/><em>a bigger picture.</em></h2><p>{parent!.intro}</p><Link href={topicHref(path.slice(0,-1))}>Explore {parent!.title}<ArrowUpRight size={17}/></Link></section>:null}
 {root?.feature&&<Link className="topic-feature-link" href={root.feature}><span><span className="ir-eyebrow">THE VISUAL FIELD GUIDE</span><strong>{root.feature==='/nature/'?'Landscapes, rivers & a natural atlas':root.feature==='/economy/'?'Ports, factories & industrial landscapes':'Everyday culture & urban spaces'}</strong><span>Explore the illustrated perspective</span></span><ArrowUpRight size={27}/></Link>}
 {node&&<><section className="topic-related"><div><span className="ir-eyebrow">KEEP YOUR CURIOSITY MOVING</span><h2>{path.length===3?'Alongside this topic':'Other ways in'}</h2></div><div>{siblings.filter(n=>n.id!==node.id).map(n=><Link href={topicHref([...path.slice(0,-1),n.slug])} key={n.id}><TopicIcon name={n.icon} size={19}/>{n.title}<ArrowUpRight size={15}/></Link>)}</div></section><nav className="topic-pagination" aria-label="Continue exploring"><Link href={topicHref(path.slice(0,-1))}><ArrowLeft size={17}/><span>BACK TO<br/><strong>{parent?.title??'All perspectives'}</strong></span></Link>{next&&next.id!==node.id&&<Link href={topicHref([...path.slice(0,-1),next.slug])}><span>NEXT {path.length===3?'TOPIC':'PERSPECTIVE'}<br/><strong>{next.title}</strong></span><ArrowRight size={17}/></Link>}</nav></>}
 </div><footer className="ir-footer"><Link href="/" className="ir-logo"><BrandLogo/></Link><p>A country to discover. A perspective to unfold.</p><Link href="/explore/">All perspectives ↗</Link><span>© {new Date().getFullYear()} Iran, Unfolded</span></footer></div>;
}
