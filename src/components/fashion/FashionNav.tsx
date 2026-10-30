'use client';
import { useEffect, useState } from 'react';
const links = [['Editorial', 'editorial'], ['Urban Style', 'urban-style'], ['The Looks', 'style-guide'], ['Designers', 'designers'], ['Culture', 'culture']];
export function FashionNav() {
 const [open, setOpen] = useState(false);
 const [active, setActive] = useState('editorial');
 useEffect(() => {
  const observer = new IntersectionObserver(entries => { for (const entry of entries) if(entry.isIntersecting) setActive(entry.target.id); }, { rootMargin: '-15% 0px -55% 0px' });
  links.forEach(([,id]) => { const el = document.getElementById(id); if(el) observer.observe(el); });
  return () => observer.disconnect();
 }, []);
 return <header className="na-header"><a className="na-wordmark" href="#editorial" aria-label="Fashion editorial introduction">Fashion<span>IRAN, UNFOLDED / SPECIAL FEATURE</span></a><button className="na-menu" aria-expanded={open} aria-controls="na-navigation" onClick={() => setOpen(!open)} onKeyDown={e => {if(e.key === 'Escape') setOpen(false);}}>{open ? 'Close −' : 'Menu +'}</button><nav id="na-navigation" className={open ? 'is-open' : ''} aria-label="Magazine navigation" onKeyDown={e => {if(e.key === 'Escape') {setOpen(false); document.querySelector<HTMLButtonElement>('.na-menu')?.focus();}}}>{links.map(([label,id]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>)}</nav><span className="na-language" aria-label="Language: English">EN <span aria-hidden="true">↗</span></span></header>;
}
