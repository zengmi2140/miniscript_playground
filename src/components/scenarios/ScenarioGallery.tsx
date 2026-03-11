'use client';

import { SCENARIOS } from '@/lib/scenarios/data';
import { ScenarioCard } from './ScenarioCard';

export function ScenarioGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SCENARIOS.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  );
}
