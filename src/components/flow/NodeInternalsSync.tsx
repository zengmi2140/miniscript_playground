'use client';

import { useLayoutEffect } from 'react';
import { useNodes, useUpdateNodeInternals } from '@xyflow/react';

/**
 * After layout or fitView, re-read handle bounds so edges connect to measured nodes.
 */
export function NodeInternalsSync() {
  const nodes = useNodes();
  const updateNodeInternals = useUpdateNodeInternals();

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      nodes.forEach((n) => updateNodeInternals(n.id));
    });
    return () => cancelAnimationFrame(id);
  }, [nodes, updateNodeInternals]);

  return null;
}
