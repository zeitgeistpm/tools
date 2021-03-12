import SDK from "../src/index";
import {MockApi} from "./mockApi";

let sdk;

beforeAll(async () => {
  // sdk = await SDK.mock(MockApi);
  sdk = await SDK.initialize();
});

afterAll(async() => {
  await sdk.api.disconnect();
});

test('Can get all market ids', async () => {
  const ids = await sdk.models.getAllMarketIds();
  expect(ids).toBeTruthy();
});

test('Can get all markets', async () => {
  const markets = await sdk.models.getAllMarkets();
  expect(markets).toBeTruthy();
  for (const market of markets) {
    console.log(market.toJSONString());
  }
});
