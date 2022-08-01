export default {
  rpc: {},
  types: {
    Pool: {
      assets: "Vec<Asset>",
      baseAsset: "Asset",
      marketId: "MarketId",
      poolStatus: "PoolStatus",
      scoringRule: "ScoringRule",
      swapFee: "Option<Balance>",
      totalSubsidy: "Option<Balance>",
      totalWeight: "Option<u128>",
      weights: "Option<BTreeMap<Asset, u128>>",
    },
    CommonPoolEventParams: {
      poolId: "u128",
      who: "AccountId",
    },
    PoolAssetEvent: {
      asset: "Asset",
      bound: "Balance",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Balance",
    },
    PoolAssetsEvent: {
      assets: "Vec<Asset>",
      bounds: "Vec<Balance>",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Vec<Balance>",
    },
    PoolId: "u128",
    PoolStatus: {
      _enum: ["Active", "CollectingSubsidy", "Closed", "Clean", "Initialized"],
    },
    SubsidyUntil: {
      marketId: "MarketId",
      period: "MarketPeriod",
    },
    SwapEvent: {
      assetAmountIn: "Balance",
      assetAmountOut: "Balance",
      assetBound: "Balance",
      assetIn: "Asset",
      assetOut: "Asset",
      cpep: "CommonPoolEventParams<AccountId>",
      maxPrice: "Balance",
    },
  },
};
