import raw from '@/data/taxonomy.json';
import type { TopicIconKey } from '@/components/TopicIcon';
export type TopicNode = { id: string; sourceTitle: string; title: string; slug: string; intro: string; icon: TopicIconKey; image?: string; feature?: string; children: TopicNode[] };
export const taxonomy = raw as TopicNode[];
export function topicHref(segments: string[]) { return `/explore/${segments.length ? `${segments.join('/')}/` : ''}`; }
export function findTopic(segments: string[]) {
  let nodes = taxonomy;
  const ancestors: TopicNode[] = [];
  for (const slug of segments) {
    const node = nodes.find(n => n.slug === slug);
    if (!node) return undefined;
    ancestors.push(node); nodes = node.children;
  }
  return ancestors;
}
export function allTopicPaths(nodes: TopicNode[] = taxonomy, prefix: string[] = []): string[][] {
  return nodes.flatMap(n => { const path = [...prefix, n.slug]; return [path, ...allTopicPaths(n.children, path)]; });
}
