import { ExplorePage } from '@/components/ExplorePage';
import { explorePages } from '@/lib/explore';
export const metadata = { title: 'Nature & Geography — Iran, Unfolded', description: 'Discover Iran’s rivers, mountains, forests, deserts and seas, with a simple landscape map.' };
export default function Page() { return <ExplorePage page={explorePages[0]} />; }
