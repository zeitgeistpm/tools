export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as shares } from "./shares";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  types: {
    Address: "AccountId",
    LookupSource: "AccountId",
    RefCount: "u32",
    Asset: {
      _enum: {
        Share: "Hash",
        PredictionMarketShare: "(MarketId, u16)",
        PoolShare: "u128",
        Ztg: null,
      }
    },
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset"
  },
};
