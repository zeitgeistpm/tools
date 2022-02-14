export { default as court } from "./court";
export { default as orderbook } from "./orderbook";
export { default as predictionMarkets } from "./predictionMarkets";
export { default as rikkido } from "./rikkido";
export { default as swaps } from "./swaps";

export const index = {
  rpc: {},
  typesAlias: {
    tokens: {
      AccountData: {
        free: "Balance",
        reserved: "Balance",
        miscFrozen: "Balance",
        feeFrozen: "Balance",
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
      topNominators: "Vec<Bond>",
      bottomNominators: "Vec<Bond>",
      totalCounted: "Balance",
      totalBacking: "Balance",
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
    ExitQ: {
      candidates: "Vec<AccountId>",
      nominatorsLeaving: "Vec<AccountId>",
      candidateSchedule: "Vec<(AccountId, RoundIndex)>",
      nominatorSchedule: "Vec<(AccountId, Option<AccountId>, RoundIndex)>",
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
    Nominator2: {
      delegations: "Vec<Bond>",
      revocations: "Vec<AccountId>",
      total: "Balance",
      scheduledRevocationsCount: "u32",
      scheduledRevocationsTotal: "Balance",
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
      participatedBlocks: "BlockNumber",
      perpetualIncentives: "Balance",
      totalIncentives: "Balance",
      totalShares: "Balance",
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
      totalReward: "Balance",
      claimedReward: "Balance",
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
