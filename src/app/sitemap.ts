import type { MetadataRoute } from 'next';
import { allTopicPaths, topicHref } from '@/lib/taxonomy';
export default function sitemap(): MetadataRoute.Sitemap {
 const base=(process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3001').replace(/\/$/,'');
 return ['/', '/peoples/', '/governance/', '/fashion/', '/four-season/', '/nature/', '/economy/', '/urban-life/', '/explore/', ...allTopicPaths().map(topicHref)].map(path=>({url:base+path}));
}
