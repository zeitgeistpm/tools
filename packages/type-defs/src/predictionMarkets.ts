export default {
  rpc: {
    predictionMarkets: {
      marketOutcomeShareId: {
        description: "Get the market outcome share identifier.",
        params: [
          {
            name: "market_id",
            type: "MarketId",
          },
          {
            name: "outcome",
            type: "u16",
          },
          {
            name: "at",
            type: "Hash",
            isOptional: true,
          },
        ],
        type: "Hash",
      },
    },
  },
  types: {
    MarketCreation: {
      _enum: ["Permissionless", "Advised"],
    },
    MarketEnd: {
      enum: {
        Block: "u164",
        Timestamp: "u64",
      },
    },
    MarketId: "u128",
    MarketType: {
      _enum: ["Binary", "Categorical", "Scalar"],
    },
    MarketStatus: {
      _enum: [
        "Proposed",
        "Active",
        "Suspended",
        "Closed",
        "Reported",
        "Disputed",
        "Resolved",
      ],
    },
    Market: {
      creator: "AccountId",
      creation: "MarketCreation",
      creator_fee: "u8",
      oracle: "AccountId",
      end: "u64",
      metadata: "Vec<u8>",
      market_type: "MarketType",
      market_status: "MarketStatus",
      reported_outcome: "Option<u16>",
      reporter: "Option<AccountId>",
      categories: "Option<u16>",
    },
    MarketDispute: {
      at: "BlockNumber",
      by: "AccountId",
      outcome: "u16",
    },
  },
};
