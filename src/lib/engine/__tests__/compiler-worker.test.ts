import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  COMPILER_WORKER_TIMEOUT_MS,
  CompilerWorkerClient,
  type CompilerWorkerInput,
  type CompilerWorkerResult,
} from '../compiler-worker';

const INPUT: CompilerWorkerInput = {
  policy: 'pk(A)',
  keyVariables: [],
  context: 'wsh',
  network: 'testnet',
  availableKeys: [],
  availableHashes: [],
  currentTimeBlocks: 0,
};

const SUCCESS: CompilerWorkerResult = {
  output: {
    result: {
      policy: 'pk(A)',
      policyWithKeys: 'pk(A)',
      miniscript: 'pk(A)',
      miniscriptWithKeys: 'pk(A)',
      asm: 'A OP_CHECKSIG',
      descriptor: 'wsh(pk(A))',
      address: 'tb1qexample',
      scriptHex: '00',
    },
    paths: [],
    error: null,
  },
  semanticTree: { type: 'key', name: 'A' },
};

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  posted: unknown[] = [];
  terminated = false;

  postMessage(message: unknown) {
    this.posted.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  respond(result: CompilerWorkerResult, fatal = false) {
    const request = this.posted.at(-1) as { id: number };
    this.onmessage?.({
      data: { id: request.id, result, ...(fatal ? { fatal: true } : {}) },
    } as MessageEvent);
  }
}

afterEach(() => {
  vi.useRealTimers();
});

describe('CompilerWorkerClient', () => {
  it('returns worker results', async () => {
    const worker = new FakeWorker();
    const client = new CompilerWorkerClient(() => worker as unknown as Worker);
    const pending = client.compile(INPUT);
    worker.respond(SUCCESS);
    await expect(pending).resolves.toEqual(SUCCESS);
    client.dispose();
  });

  it('terminates a fatal worker and creates a clean one for the next compile', async () => {
    const workers = [new FakeWorker(), new FakeWorker()];
    const client = new CompilerWorkerClient(
      () => workers.find((worker) => !worker.posted.length) as unknown as Worker,
    );

    const first = client.compile(INPUT);
    workers[0].respond(SUCCESS, true);
    await expect(first).resolves.toEqual(SUCCESS);
    expect(workers[0].terminated).toBe(true);

    const second = client.compile(INPUT);
    workers[1].respond(SUCCESS);
    await expect(second).resolves.toEqual(SUCCESS);
    expect(workers[1].posted).toHaveLength(1);
    client.dispose();
  });

  it('terminates and reports a friendly error on timeout', async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new CompilerWorkerClient(() => worker as unknown as Worker);
    const pending = client.compile(INPUT);

    await vi.advanceTimersByTimeAsync(COMPILER_WORKER_TIMEOUT_MS);

    await expect(pending).resolves.toMatchObject({
      output: { result: null, error: { category: 'engine_init' } },
      semanticTree: null,
    });
    expect(worker.terminated).toBe(true);
    client.dispose();
  });

  it('discards an in-flight generation when a newer request starts', async () => {
    const workers = [new FakeWorker(), new FakeWorker()];
    let index = 0;
    const client = new CompilerWorkerClient(
      () => workers[index++] as unknown as Worker,
    );
    const first = client.compile(INPUT);
    const second = client.compile({ ...INPUT, policy: 'pk(B)' });

    await expect(first).rejects.toThrow('superseded');
    expect(workers[0].terminated).toBe(true);
    workers[1].respond(SUCCESS);
    await expect(second).resolves.toEqual(SUCCESS);
    client.dispose();
  });
});

