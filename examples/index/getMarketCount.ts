/**
 * Script to validate Ztg balance history of an account against on-chain data
 */
import SDK from "@zeitgeistpm/sdk/dist";

/**
 * This acts as a count of all markets which have been created,
 * but includes those which have been cancelled, and all other statuses.
 * @returns The `market_count` from Zeitgeist chain.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";

  const sdk = await SDK.initialize(ZTGNET);

  const res = await sdk.models.getMarketCount();

  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
