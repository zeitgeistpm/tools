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
    MarketPeriod: {
      _enum: {
        Block: "Range<BlockNumber>",
        Timestamp: "Range<Moment>",
      },
    },
    MarketId: "u128",
    MarketType: {
      _enum: {
        Categorical: "u16",
        Scalar: "RangeInclusive<u128>",
      },
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
      metadata: "Vec<u8>",
      market_type: "MarketType",
      period: "MarketPeriod",
      status: "MarketStatus",
      report: "Option<Report>",
      resolved_outcome: "Option<Outcome>",
      mdm: "MarketDisputeMechanism",
    },
    Outcome: {
      _enum: {
        Categorical: "u16",
        Scalar: "u128",
      },
    },
    Report: {
      at: "BlockNumber",
      by: "AccountId",
      outcome: "Outcome",
    },
    MarketDispute: {
      at: "BlockNumber",
      by: "AccountId",
      outcome: "Outcome",
    },
    MarketDisputeMechanism: {
      _enum: {
        Authorized: "BlockNumber",
        Court: null,
        SimpleDisputes: null,
      },
    },
  },
};
