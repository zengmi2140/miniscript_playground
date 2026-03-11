'use client';

import Link from 'next/link';
import {
  Key,
  Users,
  ShieldCheck,
  Heart,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { Vault } from 'lucide-react';
import type { Scenario } from '@/lib/engine/types';
import { useI18n } from '@/lib/i18n/context';
import { getScenarioTags, getTopBarColor } from '@/lib/scenarios/tags';

const ICON_MAP: Record<string, LucideIcon> = {
  Key,
  Users,
  ShieldCheck,
  Heart,
  Vault,
  Lock,
};

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { locale } = useI18n();
  const Icon = ICON_MAP[scenario.icon] || Key;
  const tags = getScenarioTags(scenario);
  const barColor = getTopBarColor(scenario);

  return (
    <Link
      href={`/playground?scenario=${scenario.id}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-border-default bg-surface-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-surface-elevated hover:shadow-lg hover:shadow-black/20"
    >
      <div className={`h-1 w-full ${barColor}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-node bg-surface-elevated transition-colors group-hover:bg-surface-overlay">
          <Icon className="h-5 w-5 text-text-secondary transition-colors group-hover:text-text-primary" />
        </div>

        <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-text-primary">
          {scenario.title[locale]}
        </h3>

        <p className="mb-4 flex-1 text-[13px] leading-relaxed text-text-secondary">
          {scenario.description[locale]}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.type}
              className={`inline-flex items-center rounded-chip px-2 py-0.5 text-chip ${tag.bgColor} ${tag.color}`}
            >
              {tag.label[locale]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
