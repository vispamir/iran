import type { Metadata } from 'next';
import GovernanceAtlas from '@/components/governance/GovernanceAtlas';

export const metadata: Metadata = {
  title: 'Iran Governance Atlas | IRAN, Unfolded',
  description: 'Explore the branches, armed forces, councils and institutions of Iran through an interactive map of hierarchy, appointments, elections and oversight.',
};
export default function GovernancePage() { return <GovernanceAtlas/>; }
