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
      share_id: "Hash",
      total: "Balance",
      price: "Balance",
      filled: "Balance",
    },
  },
};
