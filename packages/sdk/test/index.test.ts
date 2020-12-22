import { ApiPromise } from "@polkadot/api";
import SDK from "../src/index";

test('SDK can properly initialize', async () => {
  const sdk = await SDK.initialize();
  expect(sdk).toBeInstanceOf(SDK);
  await sdk.api.disconnect();
});

test('Can use the API on the SDK', async () => {
  const sdk = await SDK.initialize();
  const api = sdk.api;
  expect(api).toBeInstanceOf(ApiPromise);
  const balRes = await api.query.system.account("5CS2Q1XbRR1eYnxeXUm8fqq6PfK3WLfwUvCpNvGsYAjKtsUC");
  console.log(balRes.toHuman());
  await sdk.api.disconnect();
});
