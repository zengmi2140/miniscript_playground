'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { FlowEdgeData } from '@/lib/flow/tree-to-flow';

export const PathEdge = memo(function PathEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeData = data as FlowEdgeData | undefined;
  const relation = edgeData?.relation || 'and';
  const satisfied = edgeData?.satisfied || false;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  let stroke = '#44403C';
  if (satisfied) stroke = '#22C55E';
  else if (relation === 'or') stroke = '#78716C';

  const dashArray = relation === 'or' ? '6 4' : relation === 'threshold' ? '4 3' : undefined;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke,
        strokeWidth: 2,
        strokeDasharray: dashArray,
      }}
    />
  );
});

export const edgeTypes = {
  pathEdge: PathEdge,
};
