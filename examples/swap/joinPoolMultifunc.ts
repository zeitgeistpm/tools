import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const amountOut = "4000000000000";
  const amountIn = "4000000000000";
  const trimmedBounds = {
    poolAmount: Number(amountOut),
    assetMax: amountIn.split(",").map(Number),
  };
  const poolId = 1;

  // Generate signer based on seed
  const seed = "";
  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  const res = await pool.joinPoolMultifunc(
    signer,
    {
      bounds: trimmedBounds as any,
    },
    false
  );

  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
