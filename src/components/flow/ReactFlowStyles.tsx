'use client';

// Import local ReactFlow styles (extracted for Next.js compatibility)
// Next.js doesn't support importing CSS from node_modules in component files
import '@/styles/reactflow.css';

export function ReactFlowStyles({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
