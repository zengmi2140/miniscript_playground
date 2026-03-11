'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ThreeColumnLayout } from '@/components/playground/ThreeColumnLayout';
import { LeftPanel } from '@/components/playground/LeftPanel';
import { CenterPanel } from '@/components/playground/CenterPanel';
import { RightPanel } from '@/components/playground/RightPanel';
import { usePlaygroundStore } from '@/lib/stores/playground-store';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const loadScenario = usePlaygroundStore((s) => s.loadScenario);
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);

  useEffect(() => {
    const scenarioId = searchParams.get('scenario');
    if (scenarioId && scenarioId !== activeScenarioId) {
      loadScenario(scenarioId);
    }
  }, [searchParams, loadScenario, activeScenarioId]);

  return (
    <ThreeColumnLayout
      left={<LeftPanel />}
      center={<CenterPanel />}
      right={<RightPanel />}
    />
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense>
      <PlaygroundContent />
    </Suspense>
  );
}
