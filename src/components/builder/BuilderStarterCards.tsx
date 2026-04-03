'use client';

import { User, Users, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import type { BuildStarterId } from '@/lib/builder/types';

interface BuilderStarterCardsProps {
  onSelect: (starterId: BuildStarterId) => void;
}

const starters: {
  id: BuildStarterId;
  icon: typeof User;
  titleKey: string;
  descKey: string;
}[] = [
  {
    id: 'single-control',
    icon: User,
    titleKey: 'builder.starter.singleControl',
    descKey: 'builder.starter.singleControlDesc',
  },
  {
    id: 'shared-control',
    icon: Users,
    titleKey: 'builder.starter.sharedControl',
    descKey: 'builder.starter.sharedControlDesc',
  },
  {
    id: 'recovery',
    icon: Shield,
    titleKey: 'builder.starter.recovery',
    descKey: 'builder.starter.recoveryDesc',
  },
];

export function BuilderStarterCards({ onSelect }: BuilderStarterCardsProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          {t('builder.starter.title')}
        </h2>
        <p className="text-sm text-text-secondary">
          {t('builder.starter.subtitle')}
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-3">
        {starters.map((starter) => {
          const Icon = starter.icon;
          return (
            <button
              key={starter.id}
              type="button"
              data-testid={`builder-starter-${starter.id}`}
              onClick={() => onSelect(starter.id)}
              className={cn(
                'group flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-surface-card p-6 text-center transition-all',
                'hover:border-border-active hover:bg-surface-elevated',
                'focus:outline-none focus:ring-2 focus:ring-btc-500 focus:ring-offset-2 focus:ring-offset-surface-base'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10 transition-colors group-hover:bg-btc-500/20">
                <Icon className="h-6 w-6 text-btc-500" />
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {t(starter.titleKey)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {t(starter.descKey)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
