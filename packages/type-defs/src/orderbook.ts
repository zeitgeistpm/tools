export default {
  rpc: {},
  types: {
    OrderSide: {
      _enum: ["Bid", "Ask"],
    },
    Order: {
      side: "OrderSide",
      maker: "AccountId",
      taker: "Option<AccountId>",
      asset: "Asset",
      total: "Balance",
      price: "Balance",
      filled: "Balance",
    },
  },
};
