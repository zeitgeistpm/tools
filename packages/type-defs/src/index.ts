export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  typesAlias: {
    tokens: {
      AccountData: {
        free: "Balance",
        reserved: "Balance",
        frozen: "Balance",
      },
    },
  },
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
      },
    },
    SerdeWrapper: "Balance",
    BlockNumber: "u64",
    CategoryIndex: "u16",
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    Index: "u64",
    Lookup: "MultiAddress",
    MultiHash: {
      _enum: {
        Sha3_384: "[u8; 50]",
      },
    },
    ScalarPosition: {
      _enum: ["Long", "Short"],
    },
  },
};
