#!/bin/bash
set -e

echo "=== Harness Initialization ==="

if [ ! -f package.json ]; then
  echo "package.json not found; run this script from the repository root."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" != "22" ]; then
  echo "Node 22 is required. Current version: $(node -v)"
  echo "Run: nvm use"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "node_modules not found. Run npm ci before verification."
  exit 1
fi

echo "=== npm run doc:health ==="
npm run doc:health

echo "=== npm run lint ==="
npm run lint

echo "=== npm run typecheck ==="
npm run typecheck

echo "=== npm run test:coverage ==="
npm run test:coverage

echo "=== npm run build:check ==="
npm run build:check

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read progress.md for the canonical current task state"
echo "2. Pick one active task only"
echo "3. Keep work in scope"
echo "4. Re-run verification before claiming done"
