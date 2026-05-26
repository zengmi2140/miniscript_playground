'use client';

import { Key, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import { blocksToHumanLocale, afterToHumanLocale } from '@/lib/engine/time-utils';
import type { PathCondition } from '@/lib/engine/types';

interface ConditionChipProps {
  condition: PathCondition;
  className?: string;
}

const chipConfig = {
  signature: {
    icon: Key,
    bgClass: 'bg-semantic-key/10',
    borderClass: 'border-l-semantic-key',
    textClass: 'text-semantic-key',
  },
  timelock_relative: {
    icon: Clock,
    bgClass: 'bg-semantic-timelock/10',
    borderClass: 'border-l-semantic-timelock',
    textClass: 'text-semantic-timelock',
  },
  timelock_absolute: {
    icon: Clock,
    bgClass: 'bg-semantic-timelock/10',
    borderClass: 'border-l-semantic-timelock',
    textClass: 'text-semantic-timelock',
  },
  hashlock: {
    icon: Hash,
    bgClass: 'bg-semantic-hashlock/10',
    borderClass: 'border-l-semantic-hashlock',
    textClass: 'text-semantic-hashlock',
  },
};

export function ConditionChip({ condition, className }: ConditionChipProps) {
  const { locale } = useI18n();
  const config = chipConfig[condition.type];
  const Icon = config.icon;

  let label: string;
  switch (condition.type) {
    case 'signature':
      label = condition.displayName ?? condition.keyName;
      break;
    case 'timelock_relative':
      label = blocksToHumanLocale(condition.blocks, locale);
      break;
    case 'timelock_absolute':
      label = afterToHumanLocale(condition.value, locale);
      break;
    case 'hashlock':
      label = condition.hashType;
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-chip border-l-[3px] px-3 py-1.5 text-chip',
        config.bgClass,
        config.borderClass,
        className,
      )}
    >
      <Icon className={cn('h-3 w-3 flex-shrink-0', config.textClass)} />
      <span className="text-text-primary">{label}</span>
    </span>
  );
}
