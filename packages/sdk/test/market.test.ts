import SDK, { util } from "../src/index";
import { Market } from "../src/models";
import Swap from "../src/models/swaps";

let sdk, signer, market, marketId, pool, poolId;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(async () => {
  await sleep(5000);
  sdk = await SDK.initialize();
  signer = util.signerFromSeed('clean useful exotic shoe day rural hotel pitch manual happy inherit concert');
  marketId = await sdk.models.createNewMarket(signer, 'test', 'new market for test', '5FzstFvrLWWjEbmPuibFHnvJ1UC9zYaRSQXLjdHPhTNxoiQn', Number(new Date().getTime() + 10000));
  market = await sdk.models.fetchMarketData(parseInt(marketId));
  await market.buyCompleteSet(signer, Number(1000000000000));
  await sdk.models.shares.wrapNativeCurrency(signer, "1000000000000");
});

afterAll(async () => {
  await sdk.api.disconnect();
})

test('Gets a market from market id', async () => {
  expect(market).toBeInstanceOf(Market);
});

test('Gets the pool id from a market', async () => {
  await sleep(5000);
  poolId = await market.deploySwapPool(signer, [
    "25".concat("0".repeat(10)),
    "125".concat("0".repeat(9)),
    "125".concat("0".repeat(9)),
  ]);

  expect(typeof poolId).toBe('string');
});

test('Report a market', async () => {
  await sleep(20000); //wait till block is expired
  const res = await market.report(signer, Number(1));
  expect(res).toEqual(marketId);
});

test('Dispute a market', async () => {
  const res = await market.dispute(signer, Number(1));
  expect(res).toEqual(marketId);
});


test('Gets a pool from a pool id', async () => {
  await sleep(5000);
  pool = await sdk.models.fetchPoolData(poolId);
  expect(pool).toBeInstanceOf(Swap);
});

test('Can fetch data using the swaps-namespaced RPC', async () => {
  const sharesId = await pool.sharesId();
  console.log(sharesId.toString());
  const account = await pool.accountId();
  console.log(account.toString());
  // const spotPrice = await pool.getSpotPrice(pool.assets[0], pool.assets[1]);
  // console.log(spotPrice);
});