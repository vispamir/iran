import type { Metadata } from 'next';
import './globals.css';
import './theme.css';
import '@/components/iran.css';
import { SiteHeader } from '@/components/SiteHeader';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'),
  title: 'IRAN, Unfolded — A world within a country',
  description: 'Meet Iran through its landscapes, people, history, creativity and possibilities.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var preference;try{preference=localStorage.getItem('iran-theme')}catch(e){}var query=window.matchMedia('(prefers-color-scheme: dark)');function apply(){document.documentElement.dataset.theme=preference==='dark'||preference==='light'?preference:query.matches?'dark':'light'}apply();query.addEventListener('change',function(){try{preference=localStorage.getItem('iran-theme')}catch(e){}apply()});window.addEventListener('storage',function(e){if(e.key==='iran-theme'){preference=e.newValue;apply()}})})();` }} /></head><body><a className="site-skip-link" href="#main">Skip to content</a><SiteHeader/><main id="main">{children}</main></body></html>;
}
