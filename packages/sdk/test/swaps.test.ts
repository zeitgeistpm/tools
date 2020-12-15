import SDK from "../src/index";

test('Gets a pool from a pool id', async () => {
  const sdk = await SDK.initialize();
  const pool = await sdk.models.fetchPoolData(4);
  console.log(pool);
  await sdk.api.disconnect();
});
