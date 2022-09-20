import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const poolId = 1;

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  const sharesId = await pool.sharesId();

  console.log(sharesId.toString());
}

main()
  .catch(console.error)
  .finally(() => process.exit());
