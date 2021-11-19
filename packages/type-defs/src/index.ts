export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as swaps } from "./swaps";
export { default as court } from "./court";

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
    AuthorId: "AccountId",
    SerdeWrapper: "Balance",
    BlockNumber: "u64",
    Bond: {
      owner: "AccountId",
      amount: "Balance",
    },
    CategoryIndex: "u16",
    CollatorSnapshot: {
      bond: "Balance",
      nominators: "Vec<Bond>",
      total: "Balance",
    },
    Currency: "Asset",
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    ExitQ: {
      candidates: "Vec<AccountId>",
      nominators_leaving: "Vec<AccountId>",
      candidate_schedule: "Vec<(AccountId, RoundIndex)>",
      nominator_schedule: "Vec<(AccountId, Option<AccountId>, RoundIndex)>",
    },
    Index: "u64",
    InflationInfo: {
      expect: "RangeBalance",
      annual: "RangePerbill",
      round: "RangePerbill",
    },
    Lookup: "MultiAddress",
    MarketIdOf: "u128",
    MaxRuntimeUsize: "u64",
    Moment: "u64",
    MultiHash: {
      _enum: {
        Sha3_384: "[u8; 50]",
      },
    },
    OrderedSet: "Vec<Bond>",
    OwnedValuesParams: {
      participated_blocks: "BlockNumber",
      perpetual_incentives: "Balance",
      total_incentives: "Balance",
      total_shares: "Balance",
    },
    ParachainBondConfig: {
      account: "AccountId",
      percent: "Percent",
    },
    RangeBalance: {
      min: "Balance",
      ideal: "Balance",
      max: "Balance",
    },
    RangePerbill: {
      min: "Perbill",
      ideal: "Perbill",
      max: "Perbill",
    },
    RelayChainAccountId: "AccountId32",
    RewardInfo: {
      total_reward: "Balance",
      claimed_reward: "Balance",
    },
    RoundIndex: "u32",
    RoundInfo: {
      current: "RoundIndex",
      first: "BlockNumber",
      length: "u32",
    },
    ScalarPosition: {
      _enum: ["Long", "Short"],
    },
    VestingBlockNumber: "u32",
  },
};
