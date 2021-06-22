export default {
  rpc: {},
  types: {
    Pool: {
      assets: "Vec<Asset>",
      pool_status: "PoolStatus",
      swap_fee: "Balance",
      total_weight: "u128",
      weights: "BTreeMap<Asset, u128>",
    },
    CommonPoolEventParams: {
      pool_id: "u128",
      who: "AccountId",
    },
    PoolAssetsEvent: {
      bounds: "Vec<Balance>",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Vec<Balance>",
    },
    PoolAssetEvent: {
      bound: "Balance",
      cpep: "CommonPoolEventParams<AccountId>",
      transferred: "Balance",
    },
    PoolId: "u128",
    PoolStatus: {
      _enum: {
        Active: null,
        Stale: null,
      },
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
