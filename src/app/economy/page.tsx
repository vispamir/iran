import { ExplorePage } from '@/components/ExplorePage';
import { explorePages } from '@/lib/explore';
export const metadata = { title: 'Industry & Economy — Iran, Unfolded', description: 'Explore Iran’s ports, factories, mines and industrial landscapes.' };
export default function Page() { return <ExplorePage page={explorePages[1]} />; }
