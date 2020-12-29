import SDK from "../src/index";
import Swap from "../src/models/swaps";

test('Gets a pool from a pool id', async () => {
  const sdk = await SDK.initialize();
  const pool = await sdk.models.fetchPoolData(0);
  expect(pool).toBeInstanceOf(Swap);
  await sdk.api.disconnect();
});

test('Can fetch data using the swaps-namespaced RPC', async () => {
  const sdk = await SDK.initialize();
  const pool = await sdk.models.fetchPoolData(0);
  const sharesId = await pool.sharesId();
  console.log(sharesId.toString());
  const account = await pool.accountId();
  console.log(account.toString());
  // const spotPrice = await pool.getSpotPrice(pool.assets[0], pool.assets[1]);
  // console.log(spotPrice);
  await sdk.api.disconnect();
});
