import SDK from "../src/index";
import { Market } from "../src/models";

test('Gets a market from market id', async () => {
  const sdk = await SDK.initialize();
  const market = await sdk.models.fetchMarketData(2);
  expect(market).toBeInstanceOf(Market);
  await sdk.api.disconnect();
});

test('Gets the pool id from a market', async () => {
  const sdk = await SDK.initialize();
  const market = await sdk.models.fetchMarketData(2);
  const poolId = await market.getPoolId();
  expect(poolId).toBeInstanceOf(Number);
  await sdk.api.disconnect();
});
