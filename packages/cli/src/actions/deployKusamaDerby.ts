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
  console.log("sending transactions from", signer.address);

  // first deploy new markets
  const marketIds = [];
  for (let i = 0; i < 3; i++) {
    const marketId = await sdk.model.createNewMarket(
      signer,
      `kusama-derby-test-${i}`,
      "test descriptions",
      "5D2L4ghyiYE8p2z7VNJo9JYwRuc8uzPWtMBqdVyvjRcsnw4P",
      { timestamp: 1620504000000 },
      "Permissionless",
      [
        "karura",
        "moonriver",
        "phala",
        "robonomics",
        "kilt",
        "equilibrium",
        "hydradx",
        "shiden",
      ]
    );

    marketIds.push(marketId);
  }

  console.log(marketIds);

  for (const marketId of marketIds) {
    const market = await sdk.model.fetchMarketData(marketId);
    await market.buyCompleteSet(signer, "5000000000000" as any);
    await market.deploySwapPool(
      signer,
      Array(8).fill(1000000000000).concat(8000000000000)
    );

    const pool = await market.getPool();
    await pool.joinPool(signer, 4000000000000, Array(9).fill(8000000000000));
  }
};

export default deployKusamaDerby;
