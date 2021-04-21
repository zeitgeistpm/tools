export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as shares } from "./shares";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  types: {
    Asset: {
      _enum: {
        CategoricalOutcome: "(MarketId, CategoryIndex)",
        ScalarOutcome: "(MarketId, ScalarPosition)",
        CombinatorialOutcome: null,
        PoolShare: "u128",
        Ztg: null,
      }
    },
    BlockNumber: "u64",
    CategoryIndex: "u16",
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    AmountOf: "i128",
    Amount: "i128",
    Address: "MultiAddress",
    Lookup: "MultiAddress",
    Index: "u64",
    ScalarPosition: {
      _enum: [
        "Long",
        "Short"
      ]
    }
  },
};
