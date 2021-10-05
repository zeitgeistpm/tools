export default {
  rpc: {},
  types: {
    Pool: {
      assets: "Vec<Asset>",
      base_asset: "Option<Asset>",
      market_id: "MarketId",
      pool_status: "PoolStatus",
      scoring_rule: "ScoringRule",
      swap_fee: "Option<Balance>",
      total_subsidy: "Option<Balance>",
      total_weight: "Option<u128>",
      weights: "Option<BTreeMap<Asset, u128>>",
    },
    CommonPoolEventParams: {
      pool_id: "u128",
      who: "AccountId",
    },
    PoolAssetEvent: {
      bound: "Balance",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Balance",
    },
    PoolAssetsEvent: {
      bounds: "Vec<Balance>",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Vec<Balance>",
    },
    PoolId: "u128",
    PoolStatus: {
      _enum: {
        Active: null,
        CollectingSubsidy: null,
        Stale: null,
      },
    },
    SubsidyUntil: {
      market_id: "MarketId",
      period: "MarketPeriod",
    },
    SwapEvent: {
      asset_amount_in: "Balance",
      asset_amount_out: "Balance",
      asset_bound: "Balance",
      cpep: "CommonPoolEventParams<AccountId>",
      max_price: "Balance",
    },
  },
};
