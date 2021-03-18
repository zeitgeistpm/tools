export default {
  rpc: {},
  types: {
    Pool: {
      assets: "Vec<Hash>",
      swap_fee: "Balance",
      total_weight: "u128",
      weights: "BTreeMap<Hash, u128>",
    },
  },
};
