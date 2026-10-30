import { ExplorePage } from '@/components/ExplorePage';
import { explorePages } from '@/lib/explore';
export const metadata = { title: 'People & Urban Life — Iran, Unfolded', description: 'Discover cafe culture, neighborhood life, green spaces and urban amenities in Iran.' };
export default function Page() { return <ExplorePage page={explorePages[2]} />; }
