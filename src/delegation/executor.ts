/**
 * Wires the agent's `Executor` interface to the chain: a proposed transfer becomes
 * a 1Shot relayer redemption (getCapabilities → estimate → send). Every bundle
 * carries the mandatory fee transfer to the relayer's `feeCollector` plus the work
 * transfer, both authorized by one delegation. Errors are returned, never thrown.
 *
 * The permission context is supplied by a `ContextResolver`, so the same executor
 * serves both signing paths:
 *   - signingResolver: a script/backend signer signs a fresh scoped delegation
 *     per redemption (used by `npm run prove`).
 *   - staticResolver: reuse a wallet-granted EIP-7715 periodic budget across
 *     redemptions (used by the browser demo).
 */
import { parseUnits } from "viem";

import type { Executor } from "../agent/planner.js";
import type { ExecutionResult, ProposedAction } from "../agent/types.js";
import type {
  AuthorizationListEntry,
  OneShotRelayer,
  Send7710Params,
} from "../relayer.js";
import { buildBudgetDelegation } from "./delegation.js";
import { buildTransferExecution, toPermissionContext, type SignedDelegation } from "./redeem.js";

export interface ResolveArgs {
  feeAmount: bigint;
  workAmount: bigint;
  token: `0x${string}`;
  /** The relayer's redemption account — the delegate. */
  targetAddress: `0x${string}`;
  feeCollector: `0x${string}`;
}

/** Produces the signed permission context for a redemption (re-invoked if the fee changes). */
export type ContextResolver = (args: ResolveArgs) => Promise<unknown[]>;

/** Reuse a wallet-granted permission context (EIP-7715 periodic budget) across redemptions. */
export function staticResolver(permissionContext: unknown[]): ContextResolver {
  return async () => permissionContext;
}

/** The minimal smart-account surface the signing resolver needs. */
export interface SigningAccount {
  address: `0x${string}`;
  environment: Parameters<typeof buildBudgetDelegation>[0]["environment"];
  signDelegation(params: {
    delegation: ReturnType<typeof buildBudgetDelegation>;
  }): Promise<`0x${string}`>;
}

/** Sign a fresh budget delegation (scoped to fee+work) to the relayer per redemption. */
export function signingResolver(account: SigningAccount): ContextResolver {
  return async ({ feeAmount, workAmount, token, targetAddress }) => {
    const delegation = buildBudgetDelegation({
      environment: account.environment,
      from: account.address,
      to: targetAddress,
      token,
      maxAmount: feeAmount + workAmount,
    });
    const signature = await account.signDelegation({ delegation });
    return toPermissionContext({ ...delegation, signature } as SignedDelegation);
  };
}

export interface DelegatedExecutorOptions {
  relayer: OneShotRelayer;
  chainId: string;
  resolveContext: ContextResolver;
  /** EIP-7702 upgrade authorization to include (first use only). */
  authorization?: AuthorizationListEntry;
  /** Webhook URL for relayer status events (preferred over polling). */
  destinationUrl?: string;
  /** Mock fee placeholder for the first estimate; defaults to 0.01 of the token. */
  mockFee?: bigint;
}

export class DelegatedExecutor implements Executor {
  constructor(private readonly opts: DelegatedExecutorOptions) {}

  async execute(action: ProposedAction): Promise<ExecutionResult> {
    if (action.kind !== "transfer" || !action.token || !action.amount) {
      return { ok: false, error: "the spine executor only supports ERC-20 transfers" };
    }
    try {
      const { relayer, chainId } = this.opts;
      const caps = await relayer.getCapabilities([chainId]);
      const chainCaps = caps[chainId];
      if (!chainCaps) {
        return { ok: false, error: `relayer has no capabilities for chain ${chainId}` };
      }

      const token = action.token;
      const tokenCap = chainCaps.tokens.find(
        (t) => t.address.toLowerCase() === token.toLowerCase(),
      );
      if (!tokenCap) {
        return { ok: false, error: `relayer does not accept token ${token} on chain ${chainId}` };
      }

      const workAmount = BigInt(action.amount);
      const mockFee = this.opts.mockFee ?? parseUnits("0.01", Number(tokenCap.decimals));

      const build = async (feeAmount: bigint): Promise<Send7710Params> => {
        const permissionContext = await this.opts.resolveContext({
          feeAmount,
          workAmount,
          token,
          targetAddress: chainCaps.targetAddress,
          feeCollector: chainCaps.feeCollector,
        });
        return {
          chainId,
          transactions: [
            {
              permissionContext,
              executions: [
                buildTransferExecution(token, chainCaps.feeCollector, feeAmount),
                buildTransferExecution(token, action.to, workAmount),
              ],
            },
          ],
          ...(this.opts.authorization ? { authorizationList: [this.opts.authorization] } : {}),
        };
      };

      let params = await build(mockFee);
      let estimate = await relayer.estimate(params);
      if (!estimate.success) {
        return { ok: false, error: estimate.error ?? "relayer estimate failed" };
      }

      const requiredFee = BigInt(estimate.requiredPaymentAmount ?? mockFee.toString());
      if (requiredFee !== mockFee) {
        params = await build(requiredFee);
        estimate = await relayer.estimate(params);
        if (!estimate.success) {
          return { ok: false, error: estimate.error ?? "relayer re-estimate failed" };
        }
      }

      const taskId = await relayer.send({
        ...params,
        context: estimate.context,
        ...(this.opts.destinationUrl ? { destinationUrl: this.opts.destinationUrl } : {}),
      });

      return { ok: true, taskId, txStatus: "submitted" };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
