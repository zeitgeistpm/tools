import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring, encodeAddress, decodeAddress } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { hexToU8a, isHex } from "@polkadot/util";

import * as zeitgeistDefinitions from "@zeitgeistpm/type-defs";
import "@zeitgeistpm/types";

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

export const constructApiOptions = (provider: WsProvider) => ({
  provider,
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
        type: "Asset",
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
        type: "Asset",
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
            type: "Asset",
          },
          {
            name: "asset_out",
            type: "Asset",
          },
          {
            name: "at",
            type: "Hash",
            isOptional: true,
          },
        ],
        type: "SerdeWrapper",
      },
      getSpotPrices: {
        description: "Gets spot prices for a range of blocks",
        params: [
          {
            name: "pool_id",
            type: "u128",
          },
          {
            name: "asset_in",
            type: "Asset",
          },
          {
            name: "asset_out",
            type: "Asset",
          },
          {
            name: "blocks",
            type: "Vec<BlockNumber>",
          },
        ],
        type: "Vec<SerdeWrapper>",
      },
    },
  },
  typesAlias: {
    tokens: {
      AccountData: "TokensAccountData",
    },
  },
  types: {
    ...typesFromDefs(zeitgeistDefinitions),
    BalanceInfo: {
      amount: "Balance",
    },
    TokensAccountData: {
      free: "Balance",
      reserved: "Balance",
      frozen: "Balance",
    },
  },
});

export const lazyInitApi = (
  endpoint?: string
): [WsProvider, () => Promise<ApiPromise>] => {
  const provider = new WsProvider(endpoint, 1200, undefined, 15000);
  return [provider, () => ApiPromise.create(constructApiOptions(provider))];
};

export const initApi = (
  endpoint = "wss://bsr.zeitgeist.pm"
): Promise<ApiPromise> => {
  return ApiPromise.create(constructApiOptions(new WsProvider(endpoint)));
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

export const isValidAddress = (address: any): boolean => {
  if (typeof address !== "string") {
    return false;
  }
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
};
