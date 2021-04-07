export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as shares } from "./shares";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  types: {
    Asset: {
      _enum: {
        Share: "Hash",
        PredictionMarketShare: "(MarketId, u16)",
        PoolShare: "u128",
        Ztg: null,
      }
    },
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    AmountOf: "i128",
    Amount: "i128",
    Address: "MultiAddress",
    Lookup: "MultiAddress",
    Index: "u64",
    BlockNumber: "u64"
  },
};
