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
        "CollectingSubsidy",
        "InsufficientSubsidy",
        "Reported",
        "Disputed",
        "Resolved",
      ],
    },
    Market: {
      creator: "AccountId",
      creation: "MarketCreation",
      creatorFee: "u8",
      oracle: "AccountId",
      metadata: "Vec<u8>",
      marketType: "MarketType",
      period: "MarketPeriod",
      scoringRule: "ScoringRule",
      status: "MarketStatus",
      report: "Option<Report>",
      resolvedOutcome: "Option<OutcomeReport>",
      mdm: "MarketDisputeMechanism",
    },
    ScoringRule: {
      _enum: ["CPMM", "RikiddoSigmoidFeeMarketEma"],
    },
    OutcomeReport: {
      _enum: {
        Categorical: "u16",
        Scalar: "u128",
      },
    },
    Report: {
      at: "BlockNumber",
      by: "AccountId",
      outcome: "OutcomeReport",
    },
    MarketDispute: {
      at: "BlockNumber",
      by: "AccountId",
      outcome: "OutcomeReport",
    },
    MarketDisputeMechanism: {
      _enum: {
        Authorized: "AccountId",
        Court: null,
        SimpleDisputes: null,
      },
    },
  },
};
