export const MockApi = {
  config: 'mock',
  status: {
    isInBlock: true,
    asInBlock: '489846146846846516516',
    toHuman: () => 0
  },
  cb: (eventMethod) => ({
    events: [
      {
        phase: 'phase',
        event: {
          method: eventMethod,
          data: [1],
          section: 1
        }
      }
    ],
    status: MockApi.status
  }),
  disconnect: () => true,
  balance: {
    toHuman: () => 0
  },
  rpc: {
    predictionMarkets: {
      marketOutcomeShareId: (marketId: number, shareId: number) => 0
    },
    swaps: {
      poolSharesId: (poolId) => 0,
      poolAccountId: (poolId) => 0
    }
  },
  tx: {
    shares: {
      wrapNativeCurrency: (amount) => ({
        signAndSend: (signer) => 1000000000000
      })
    },
    predictionMarkets: {
      report: (marketId, outcome) => ({
        signAndSend: (param1, callback : (param) => void) => {
          setTimeout(() => {
            callback(MockApi.cb("MarketReported"));
          }, 500);
          return () => {};
        }
      }),
      dispute: (marketId, outcome) => ({
        signAndSend: (param1, callback : (param) => void) => {
          setTimeout(() => {
            callback(MockApi.cb("MarketDisputed"));
          }, 500);
          return () => {};
        }
      }),
      deploySwapPoolForMarket: (marketId, weights) => ({
        signAndSend: (param1, callback : (param) => void) => {
          setTimeout(() => {
            callback(MockApi.cb("PoolCreated"))
          }, 500);
          return () => {};
        }
      }),
      buyCompleteSet: (marketId, amount) => ({
        signAndSend: (param1, callback : (param) => void) => {
          setTimeout(() => {
            callback(MockApi.cb(""))
          }, 500);
          return () => {};
        }
      }),
      create: (param1, param2, param3, param4, param5) => ({
        signAndSend: (param1, callback : (param) => void) => {
          setTimeout(() => {
            callback(MockApi.cb("MarketCreated"));
          }, 500);
          return () => {};
        }
      })
    }
  },
  query: {
    system: {
      account: (address: string) => {
        return MockApi.balance;
      }
    },
    swaps: {
      pools: (poolId) => ({
        assets: ['1', '2'],
        swap_fee: 0,
        total_weight: 0,
        weights: [0,0],
        shareId: () => 0,
        accountId: () => 0,
        toJSON: () => {return MockApi.query.swaps.pools(0)}
      })
    },
    predictionMarkets: {
      marketIds: {
        keys: () => [
          {
            toString: () => '0xc0ba43aeab59a2fb95a8ca2c3a18ae9cd8426954fc0e154310293fc43493f5825b7fbbaf8340fe173a11f1f3bff9364208000000000000000000000000000000'
          }
        ]
      },
      marketToSwapPool: (marketId) => ({
        toHuman: () => 0
      }),
      markets: (marketId: number) => ({
        toJSON: () => ({
          metadata: '0x516d59676645676f4e787269365a67674154733856465848505656776173524364507a6e5958456e643277455270'
        })
      })
    }
  }
};
