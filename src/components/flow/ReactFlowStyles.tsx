'use client';

// Import ReactFlow styles in a client component
// This avoids issues with @import in globals.css
import '@xyflow/react/dist/style.css';

export function ReactFlowStyles({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
