import { PlaygroundClient } from './PlaygroundClient';

// PlaygroundClient is a 'use client' component but CAN be SSR'd.
// Next.js will render its static shell (three-column layout, left panel, right panel)
// on the server, so users see the frame immediately.
//
// Only the heavy canvases (PathMap, BuilderCanvas) inside CenterPanel use
// dynamic({ ssr: false }) — those show a skeleton while loading.
//
// This architecture ensures instant page transition from homepage to playground.

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
