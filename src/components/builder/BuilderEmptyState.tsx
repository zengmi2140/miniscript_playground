'use client';

import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { BuilderStarterCards } from './BuilderStarterCards';
import type { BuildStarterId } from '@/lib/builder/types';

export function BuilderEmptyState() {
  const applyBuildStarter = usePlaygroundStore((s) => s.applyBuildStarter);

  const handleSelect = (starterId: BuildStarterId) => {
    applyBuildStarter(starterId);
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <BuilderStarterCards onSelect={handleSelect} />
    </div>
  );
}
