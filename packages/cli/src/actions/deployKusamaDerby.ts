import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  seed: string;
};

// Deploys all the sh!t we need for the Kusama Derby.
const deployKusamaDerby = async (opts: Options): Promise<void> => {
  const { endpoint, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log(`Sending transactions from `, signer.address);

  // first deploy new markets
  const marketIds = [];
  for (let i = 0; i < 3; i++) {
    const marketId = await sdk.models.createMarket({
      signer,
      oracle: `5D2L4ghyiYE8p2z7VNJo9JYwRuc8uzPWtMBqdVyvjRcsnw4P`,
      period: { timestamp: [1620504000000, 1620604000000] },
      deadlines: {
        gracePeriod: `0`,
        oracleDuration: `60000`,
        disputeDuration: `20000`,
      },
      metadata: {
        categories: [
          { name: `karura` },
          { name: `moonriver` },
          { name: `phala` },
          { name: `robonomics` },
          { name: `kilt` },
          { name: `equilibirium` },
          { name: `hydradx` },
          { name: `shiden` },
        ],
        slug: `kusama-derby-test-${i}`,
        description: `test description`,
        question: `who will win?`,
      },
      creationType: `Permissionless`,
      marketType: { Categorical: 8 },
      disputeMechanism: {
        authorized: `5D2L4ghyiYE8p2z7VNJo9JYwRuc8uzPWtMBqdVyvjRcsnw4P`,
      },
      scoringRule: `CPMM`,
      callbackOrPaymentInfo: false,
    });

    marketIds.push(marketId);
  }

  console.log(marketIds);

  for (const marketId of marketIds) {
    const market = await sdk.models.fetchMarketData(marketId);
    await market.buyCompleteSet(signer, `5000000000000` as any, false);
    await market.deploySwapPool(
      signer,
      `10000000`,
      `10000000000`,
      [
        `10000000000`,
        `10000000000`,
        `10000000000`,
        `10000000000`,
        `10000000000`,
        `10000000000`,
        `10000000000`,
        `10000000000`,
      ],
      false
    );
    const pool = await market.getPool();
    await pool.joinPool(
      signer,
      `4000000000000`,
      [
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
        `8000000000000`,
      ],
      false
    );
  }
};

export default deployKusamaDerby;
