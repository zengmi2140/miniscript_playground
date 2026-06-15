import type {
  FriendlyError,
  KeyVariable,
  MiniscriptNode,
  Network,
  ScriptContext,
} from './types';
import type { CompileOutput } from './compiler';

export const COMPILER_WORKER_TIMEOUT_MS = 5000;

export interface CompilerWorkerInput {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
  availableKeys: string[];
  availableHashes: string[];
  currentTimeBlocks: number;
  blockTipHeight?: number;
}

export interface CompilerWorkerResult {
  output: CompileOutput;
  semanticTree: MiniscriptNode | null;
}

interface WorkerRequest {
  id: number;
  input: CompilerWorkerInput;
}

interface WorkerResponse {
  id: number;
  result: CompilerWorkerResult;
  fatal?: boolean;
}

interface PendingRequest {
  id: number;
  resolve: (result: CompilerWorkerResult) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

function workerFailureResult(kind: 'timeout' | 'crash'): CompilerWorkerResult {
  const error: FriendlyError = {
    raw: kind === 'timeout' ? 'Compilation worker timeout' : 'Compilation worker restarted',
    category: 'engine_init',
    friendly: {
      zh:
        kind === 'timeout'
          ? '策略编译超时，编译引擎已重启。请简化策略后重试。'
          : '编译引擎发生异常并已自动重启，请重试。',
      en:
        kind === 'timeout'
          ? 'Policy compilation timed out and the engine was restarted. Simplify the policy and retry.'
          : 'The compilation engine failed and was restarted. Please retry.',
    },
  };
  return {
    output: { result: null, paths: [], error },
    semanticTree: null,
  };
}

export class CompilerWorkerClient {
  private worker: Worker | null = null;
  private pending: PendingRequest | null = null;
  private nextId = 0;

  constructor(
    private readonly createWorker: () => Worker = () =>
      new Worker(new URL('../../workers/compiler.worker.ts', import.meta.url), {
        type: 'module',
      }),
  ) {}

  compile(input: CompilerWorkerInput): Promise<CompilerWorkerResult> {
    if (this.pending) {
      const superseded = this.pending;
      this.pending = null;
      clearTimeout(superseded.timeout);
      superseded.reject(new Error('Compilation request superseded'));
      this.restartWorker();
    }

    const worker = this.ensureWorker();
    const id = ++this.nextId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pending?.id !== id) return;
        this.pending = null;
        this.restartWorker();
        resolve(workerFailureResult('timeout'));
      }, COMPILER_WORKER_TIMEOUT_MS);

      this.pending = { id, resolve, reject, timeout };
      const request: WorkerRequest = { id, input };
      worker.postMessage(request);
    });
  }

  dispose(): void {
    if (this.pending) {
      clearTimeout(this.pending.timeout);
      this.pending.reject(new Error('Compilation worker disposed'));
      this.pending = null;
    }
    this.worker?.terminate();
    this.worker = null;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = this.createWorker();
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      if (!this.pending || response.id !== this.pending.id) return;
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timeout);
      if (response.fatal) this.restartWorker();
      pending.resolve(response.result);
    };
    worker.onerror = () => {
      if (!this.pending) {
        this.restartWorker();
        return;
      }
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timeout);
      this.restartWorker();
      pending.resolve(workerFailureResult('crash'));
    };
    this.worker = worker;
    return worker;
  }

  private restartWorker(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}

