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
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const strokeColor = data?.satisfied ? '#22C55E' : '#44403C';

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
