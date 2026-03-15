'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { BuilderFlowEdgeData } from '@/lib/builder/tree-to-flow';

export const BuilderEdge = memo(function BuilderEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<BuilderFlowEdgeData>) {
  // Use smooth step path with offset to create cleaner connections
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    offset: 20, // Add offset for cleaner routing
  });

  const strokeColor = data?.satisfied ? '#22C55E' : '#57534E'; // stone-600 for better visibility

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: strokeColor,
        strokeWidth: 2,
      }}
    />
  );
});

export const builderEdgeTypes = {
  builderEdge: BuilderEdge,
};
