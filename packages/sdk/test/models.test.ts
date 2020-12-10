import SDK from "../src/index";

test('Can get all market ids', async () => {
  const sdk = await SDK.initialize();
  const ids = await sdk.models.getAllMarketIds();
  expect(ids).toBeTruthy();
  await sdk.api.disconnect();
});

test('Can get all markets', async () => {
  const sdk = await SDK.initialize();
  const markets = await sdk.models.getAllMarkets();
  expect(markets).toBeTruthy();
  for (const market of markets) {
    console.log(market.toJSONString());
  }
  await sdk.api.disconnect();
});
