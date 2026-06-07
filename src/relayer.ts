/**
 * 1Shot API permissionless relayer client (JSON-RPC 2.0, no auth).
 *
 * Contract per `.agents/skills/public-relayer/`:
 *   getCapabilities([chainId])  -> { [chainId]: { feeCollector, targetAddress, tokens } }
 *   estimate7710Transaction(p)  -> { success, requiredPaymentAmount, context, ... }  (no task created)
 *   send7710Transaction(p+ctx)  -> TaskId (0x + 64 hex)
 *   getStatus({ id, logs })     -> { status: 100|110|200|400|500, ... }
 *
 * The HTTP layer is injected (`fetcher`) so request-building is unit-tested
 * without network access (see src/relayer.test.ts). The endpoint differs by
 * network (mainnet `.com` vs testnet `.dev`) — pass `chains.ts` `relayerUrl`.
 */
export type Hex = `0x${string}`;

/** One on-chain call the relayer executes inside the redeemDelegations batch. */
export interface Execution7710 {
  target: Hex;
  value: string; // wei as decimal or 0x-hex string
  data: Hex;
}

/** One delegated bundle: a (signed) delegation chain + the executions it authorizes. */
export interface DelegatedTransaction7710 {
  /** JSON-safe signed delegation chain ([child,…,parent]); build via redeem.toPermissionContext. */
  permissionContext: unknown[];
  executions: Execution7710[];
}

/** EIP-7702 authorization that upgrades an EOA to the stateless delegator (≤1 per request). */
export interface AuthorizationListEntry {
  address: Hex;
  chainId: number | string;
  nonce: number | string;
  r: Hex;
  s: Hex;
  yParity: number | string;
}

export interface Send7710Params {
  chainId: string;
  transactions: DelegatedTransaction7710[];
  authorizationList?: AuthorizationListEntry[];
  /** Signed price-lock quote from estimate; required on send, omitted on estimate. */
  context?: string;
  taskId?: Hex;
  /** Webhook URL for signed Ed25519 status events (preferred over polling). */
  destinationUrl?: string;
  memo?: string;
}

export interface Estimate7710Result {
  success: boolean;
  paymentTokenAddress?: Hex;
  paymentChain?: number;
  gasUsed?: Record<string, string>;
  /** Required fee in the mock payment token's smallest units; floored at minFee. */
  requiredPaymentAmount?: string;
  /** Signed price-lock quote for the first payment chain; pass as `context` on send. */
  context?: string;
  contextByChainId?: Record<string, string>;
  /** Present when success is false (validation/simulation failure). */
  error?: string;
}

export interface TokenCapability {
  address: Hex;
  symbol?: string;
  name?: string;
  decimals: number | string; // may arrive as a numeric string
}

export interface ChainCapability {
  feeCollector: Hex;
  /** The address the client MUST delegate `to` — the relayer's redemption account. */
  targetAddress: Hex;
  tokens: TokenCapability[];
}

export type GetCapabilitiesResult = Record<string, ChainCapability>;

export interface GetFeeDataParams {
  chainId: string;
  token: Hex;
}

export interface GetFeeDataResult {
  chainId: string;
  token: { address: Hex; decimals: number; symbol?: string; name?: string };
  rate: number;
  minFee: string;
  expiry: number;
  gasPrice: Hex;
  feeCollector: Hex;
  targetAddress?: Hex;
  context?: string;
}

export type TaskStatusCode = 100 | 110 | 200 | 400 | 500;

export interface TaskStatus {
  id: Hex;
  chainId?: string;
  createdAt?: number;
  status: TaskStatusCode;
  memo?: string;
  hash?: Hex;
  receipt?: unknown;
  message?: string;
  data?: unknown;
}

type Fetcher = typeof fetch;

interface JsonRpcResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

export class OneShotRelayer {
  constructor(
    private readonly url: string,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  private async rpc<T>(method: string, params: unknown): Promise<T> {
    const response = await this.fetcher(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!response.ok) {
      throw new Error(`relayer HTTP ${response.status}`);
    }
    const body = (await response.json()) as JsonRpcResponse<T>;
    if (body.error) {
      throw new Error(`relayer error ${body.error.code}: ${body.error.message}`);
    }
    if (body.result === undefined) {
      throw new Error("relayer returned no result");
    }
    return body.result;
  }

  /** Discover supported chains, accepted gas tokens, feeCollector, and targetAddress. */
  getCapabilities(chainIds: string[]): Promise<GetCapabilitiesResult> {
    return this.rpc("relayer_getCapabilities", chainIds);
  }

  /** Rough fee quote before the signed bundle exists (prefer `estimate` once it does). */
  getFeeData(params: GetFeeDataParams): Promise<GetFeeDataResult> {
    return this.rpc("relayer_getFeeData", params);
  }

  /** Validate + simulate the bundle; returns requiredPaymentAmount + signed price-lock context. */
  estimate(params: Send7710Params): Promise<Estimate7710Result> {
    return this.rpc("relayer_estimate7710Transaction", params);
  }

  /** Submit the bundle for relay; returns the TaskId. Include `context` from estimate. */
  send(params: Send7710Params): Promise<Hex> {
    return this.rpc("relayer_send7710Transaction", params);
  }

  getStatus(id: Hex, logs = true): Promise<TaskStatus> {
    return this.rpc("relayer_getStatus", { id, logs });
  }
}
