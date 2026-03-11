'use client';

import { Key, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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

function getChipLabel(condition: PathCondition): string {
  switch (condition.type) {
    case 'signature':
      return condition.keyName;
    case 'timelock_relative':
      return condition.humanReadable;
    case 'timelock_absolute':
      return condition.humanReadable;
    case 'hashlock':
      return `${condition.hashType}`;
  }
}

export function ConditionChip({ condition, className }: ConditionChipProps) {
  const config = chipConfig[condition.type];
  const Icon = config.icon;
  const label = getChipLabel(condition);

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
