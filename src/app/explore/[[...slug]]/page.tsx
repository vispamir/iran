import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allTopicPaths, findTopic, topicHref } from '@/lib/taxonomy';
import { TaxonomyPage } from '@/components/TaxonomyPage';
import { getExploreContent } from '@/lib/explore-content';
export const dynamicParams = false;
export function generateStaticParams() { return [{ slug: [] }, ...allTopicPaths().map(slug=>({slug}))]; }
type Props = { params: Promise<{slug?: string[]}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const path=(await params).slug??[];
 const trail=findTopic(path);
 if(!trail)notFound();
 const node=trail.at(-1);
 const content=node?await getExploreContent(node.id,topicHref(path)):undefined;
 return {title:content?.seo.title??(node?`${trail.map(n=>n.title).reverse().join(' · ')} — Iran, Unfolded`:'Explore Iran — 26 Ways to Discover'),description:content?.seo.description??node?.intro??'Explore Iran through history, people, nature, arts and contemporary life. Follow 26 perspectives across a three-level cultural guide.',alternates:{canonical:topicHref(path)},robots:{index:true,follow:true}};
}
export default async function Page({params}:Props) {
 const path=(await params).slug??[];
 const ancestors=findTopic(path);
 if(!ancestors)notFound();
 const node=ancestors.at(-1);
 const content=node?await getExploreContent(node.id,topicHref(path)):undefined;
 return <TaxonomyPage path={path} ancestors={ancestors} content={content}/>;
}
