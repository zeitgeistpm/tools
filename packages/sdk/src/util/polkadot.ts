import { ApiPromise, WsProvider } from "@polkadot/api";
import Keyring from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";

import * as zeitgeistDefinitions from "@zeitgeistpm/type-defs";

const typesFromDefs = (
  definitions: Record<string, { types: Record<string, any> }>
): Record<string, any> => {
  return Object.values(definitions).reduce(
    (res: Record<string, any>, { types }): Record<string, any> => ({
      ...res,
      ...types,
    }),
    {}
  );
};

export const initApi = (
  endpoint = "wss://bp-rpc.zeitgeist.pm"
): Promise<ApiPromise> => {
  return ApiPromise.create({
    provider: new WsProvider(endpoint),
    rpc: {
      predictionMarkets: {
        marketOutcomeShareId: {
          description: "Get the market outcome share identifier.",
          params: [
            {
              name: "market_id",
              type: "MarketId",
            },
            {
              name: "outcome",
              type: "u16",
            },
            {
              name: "at",
              type: "Hash",
              isOptional: true,
            },
          ],
          type: "Hash",
        },
      },
      swaps: {
        poolSharesId: {
          description: "Gets the share identifier for the pool shares.",
          params: [
            {
              name: "pool_id",
              type: "u128",
            },
            {
              name: "at",
              type: "Hash",
              isOptional: true,
            },
          ],
          type: "Hash",
        },
        poolAccountId: {
          description: "Gets the pool's account.",
          params: [
            {
              name: "pool_id",
              type: "u128",
            },
            {
              name: "at",
              type: "Hash",
              isOptional: true,
            },
          ],
          type: "AccountId",
        },
        getSpotPrice: {
          description: "Gets the spot price for a pool's in and out assets.",
          params: [
            {
              name: "pool_id",
              type: "u128",
            },
            {
              name: "asset_in",
              type: "Hash",
            },
            {
              name: "asset_out",
              type: "Hash",
            },
            {
              name: "at",
              type: "Hash",
              isOptional: true,
            },
          ],
          type: "BalanceInfo<Balance>",
        },
      },
    },
    types: {
      ...typesFromDefs(zeitgeistDefinitions),
      BalanceInfo: {
        amount: "Balance",
      },
    },
  });
};

export const unsubOrWarns = (unsub: () => void) => {
  if (unsub) {
    unsub();
  } else {
    console.warn(
      "Failing to unsubscribe from subscriptions could lead to memory bloat"
    );
  }
};

export const signerFromSeed = (seed: string): KeyringPair => {
  const keyring = new Keyring({
    type: "sr25519",
  });
  return keyring.addFromUri(seed);
};
