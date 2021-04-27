// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  endpoint: string;
  marketId: number;
  seed: string;
};

const deployPool = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const market = await sdk.models.fetchMarketData(marketId);
  const res = await market.deploySwapPool(signer, [
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
    "1".concat("0".repeat(10)),
  ]);

  console.log(res);
  console.log("!!!");
};

export default deployPool;
