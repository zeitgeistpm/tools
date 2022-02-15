export default {
  rpc: {},
  types: {
    EmaConfig: {
      emaPeriod: "Timespan",
      emaPeriodEstimateAfter: "Option<Timespan>",
      smoothing: "u128",
    },
    EmaMarketVolume: {
      config: "EmaConfig",
      ema: "u128",
      multiplier: "u128",
      lastTime: "UnixTimestamp",
      state: "MarketVolumeState",
      startTime: "UnixTimestamp",
      volumesPerPeriod: "u128",
    },
    FeeSigmoid: {
      config: "FeeSigmoidConfig",
    },
    FeeSigmoidConfig: {
      m: "i128",
      p: "i128",
      n: "i128",
      initialFee: "i128",
      minRevenue: "i128",
    },
    MarketVolumeState: {
      _enum: ["Uninitialized", "DataCollectionStarted", "DataCollected"],
    },
    Rikiddo: {
      config: "RikiddoConfig",
      fees: "FeeSigmoid",
      maShort: "EmaMarketVolume",
      maLong: "EmaMarketVolume",
    },
    RikiddoConfig: {
      initialFee: "i128",
      log2E: "i128",
    },
    Timespan: {
      _enum: {
        Seconds: "u32",
        Minutes: "u32",
        Hours: "u32",
        Days: "u16",
        Weeks: "u16",
      },
    },
    UnixTimestamp: "u64",
  },
};
