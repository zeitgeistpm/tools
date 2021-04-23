export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as shares } from "./shares";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  types: {
    Address: "MultiAddress",
    Amount: "i128",
    AmountOf: "i128",
    Asset: {
      _enum: {
        CategoricalOutcome: "(MarketId, CategoryIndex)",
        ScalarOutcome: "(MarketId, ScalarPosition)",
        CombinatorialOutcome: null,
        PoolShare: "u128",
        Ztg: null,
      }
    },
    BalanceInfo: "Balance",
    BlockNumber: "u64",
    CategoryIndex: "u16",
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    Index: "u64",
    Lookup: "MultiAddress",
    ScalarPosition: {
      _enum: [
        "Long",
        "Short"
      ]
    }
  },
};
