import SDK from "../src/index";

test('SDK can properly initialize', async () => {
  const sdk = await SDK.initialize();
  expect(sdk).toBeInstanceOf(SDK);
  await sdk.api.disconnect();
});
