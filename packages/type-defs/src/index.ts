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
    Collator2: {
      id: "AccountId",
      bond: "Balance",
      nominators: "Vec<AccountId>",
      top_nominators: "Vec<Bond>",
      bottom_nominators: "Vec<Bond>",
      total_counted: "Balance",
      total_backing: "Balance",
      state: "CollatorStatus",
    },
    CollatorSnapshot: {
      bond: "Balance",
      delegations: "Vec<Bond>",
      total: "Balance",
    },
    CollatorStatus: {
      _enum: {
        Active: null,
        Idle: null,
        Leaving: "RoundIndex",
      },
    },
    Currency: "Asset",
    CurrencyIdOf: "Asset",
    CurrencyId: "Asset",
    DelegatorStatus: {
      _enum: {
        Active: null,
        Leaving: "RoundIndex",
      },
    },
    EmaConfig: {
      ema_period: "Timespan",
      ema_period_estimate_after: "Option<Timespan>",
      smoothing: "u128",
    },
    EmaMarketVolume: {
      config: "EmaConfig",
      ema: "u128",
      multiplier: "u128",
      last_time: "UnixTimestamp",
      state: "MarketVolumeState",
      start_time: "UnixTimestamp",
      volumes_per_period: "u128",
    },
    ExitQ: {
      candidates: "Vec<AccountId>",
      nominators_leaving: "Vec<AccountId>",
      candidate_schedule: "Vec<(AccountId, RoundIndex)>",
      nominator_schedule: "Vec<(AccountId, Option<AccountId>, RoundIndex)>",
    },
    FeeSigmoid: {
      config: "FeeSigmoidConfig",
    },
    FeeSigmoidConfig: {
      m: "i128",
      p: "i128",
      n: "i128",
      initial_fee: "i128",
      min_revenue: "i128",
    },
    Index: "u64",
    InflationInfo: {
      expect: "RangeBalance",
      annual: "RangePerbill",
      round: "RangePerbill",
    },
    Lookup: "MultiAddress",
    MarketIdOf: "u128",
    MarketVolumeState: {
      _enum: ["Uninitialized", "DataCollectionStarted", "DataCollected"],
    },
    MaxRuntimeUsize: "u64",
    Moment: "u64",
    MultiHash: {
      _enum: {
        Sha3_384: "[u8; 50]",
      },
    },
    Nominator2: {
      delegations: "Vec<Bond>",
      revocations: "Vec<AccountId>",
      total: "Balance",
      scheduled_revocations_count: "u32",
      scheduled_revocations_total: "Balance",
      status: "DelegatorStatus",
    },
    NominatorAdded: {
      _enum: {
        AddedToTop: "Balance",
        AddedToBottom: null,
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
    Rikiddo: {
      config: "RikiddoConfig",
      fees: "FeeSigmoid",
      ma_short: "EmaMarketVolume",
      ma_long: "EmaMarketVolume",
    },
    RikiddoConfig: {
      initial_fee: "i128",
      log2_e: "i128",
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
    Timespan: {
      _enum: {
        Seconds: "u32",
        Minutes: "u32",
        Hours: "u32",
        Days: "u16",
        Weeks: "u16",
      },
    },
    UnixTimestamp: "u64",
    VestingBlockNumber: "u32",
  },
};
