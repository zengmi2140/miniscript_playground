import dynamic from 'next/dynamic';

// PlaygroundClient contains all hooks, ReactFlow, WASM, and lucide icons.
// Importing it with ssr:false means the server never executes that code,
// permanently fixing the "Users is not defined" SSR crash.
// Force cache invalidation: refresh-20250402-v2
const PlaygroundClient = dynamic(
  () => import('./PlaygroundClient').then((m) => ({ default: m.PlaygroundClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface-base">
        <div className="h-full w-full animate-pulse bg-surface-card/40" />
      </div>
    ),
  }
);

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
