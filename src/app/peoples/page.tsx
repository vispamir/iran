import type { Metadata } from 'next';
import { PeoplesAtlas } from '@/components/peoples/PeoplesAtlas';
import '@/components/peoples/peoples.css';
export const metadata: Metadata = {title:'Many roots. One Iran. — The People of Iran',description:'Meet thirteen ethnic and regional communities through their languages, contemporary cultural portraits and an interactive map of their home regions. Many cultures, one shared Iranian home.',alternates:{canonical:'/peoples/'}};
export default function PeoplesPage(){return <PeoplesAtlas/>;}
