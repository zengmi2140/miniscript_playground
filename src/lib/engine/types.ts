export interface Scenario {
  id: string;
  icon: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  explanation: { zh: string; en: string };
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
}

export interface KeyVariable {
  name: string;
  policyName: string;
  publicKey: string;
}

export type ScriptContext = 'wsh' | 'tr';
export type Network = 'testnet' | 'signet';

export interface CompilationResult {
  policy: string;
  miniscript: string;
  asm: string;
  descriptor: string;
  address: string;
  scriptHex: string;
}

export interface SpendingPath {
  index: number;
  label: string;
  conditions: PathCondition[];
  witnessAsm: string;
  witnessSize: number;
  nSequence?: number;
  nLockTime?: number;
  isMalleable: boolean;
  satisfiable: boolean;
  missingConditions: PathCondition[];
}

export type PathCondition =
  | { type: 'signature'; keyName: string }
  | { type: 'timelock_relative'; blocks: number; humanReadable: string }
  | { type: 'timelock_absolute'; value: number; humanReadable: string }
  | { type: 'hashlock'; hashType: 'sha256' | 'hash256' | 'ripemd160' | 'hash160'; hash: string };

export type MiniscriptNode =
  | { type: 'key'; name: string; wrapper?: string }
  | { type: 'older'; blocks: number; humanReadable: string }
  | { type: 'after'; value: number; humanReadable: string }
  | { type: 'hash'; hashType: string; hash: string }
  | { type: 'and'; children: MiniscriptNode[] }
  | { type: 'or'; children: MiniscriptNode[] }
  | { type: 'threshold'; k: number; n: number; children: MiniscriptNode[] }
  | { type: 'multi'; k: number; keys: string[] }
  | { type: 'just_1' }
  | { type: 'just_0' };

export interface PlaygroundState {
  playgroundMode: PlaygroundMode;
  policy: string;
  context: ScriptContext;
  network: Network;
  keyVariables: KeyVariable[];
  activeScenarioId: string | null;

  compilationResult: CompilationResult | null;
  compilationError: FriendlyError | null;
  semanticTree: MiniscriptNode | null;

  spendingPaths: SpendingPath[];

  availableKeys: Set<string>;
  availableHashes: Set<string>;
  currentTimeBlocks: number;

  selectedPathIndex: number | null;
  activeResultTab: ResultTab;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
}

export type ResultTab = 'policy' | 'miniscript' | 'script' | 'descriptor' | 'address' | 'paths' | 'warnings';

export type PlaygroundMode = 'scenario' | 'build';

export interface FriendlyError {
  raw: string;
  friendly: {
    zh: string;
    en: string;
  };
  line?: number;
  column?: number;
}
