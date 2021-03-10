import { ApiPromise } from "@polkadot/api";
import SDK from "../src/index";

let sdk;

beforeAll(async () => {
  sdk = await SDK.initialize();
});

afterAll(async() => {
  await sdk.api.disconnect();
});


test('SDK can properly initialize', async () => {
  expect(sdk).toBeInstanceOf(SDK);
});

test('Can use the API on the SDK', async () => {
  const api = sdk.api;
  expect(api).toBeInstanceOf(ApiPromise);
  const balRes = await api.query.system.account("5CS2Q1XbRR1eYnxeXUm8fqq6PfK3WLfwUvCpNvGsYAjKtsUC");
  console.log(balRes.toHuman());
});
