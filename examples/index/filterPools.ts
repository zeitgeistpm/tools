import SDK from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });

  const result = await sdk.models.filterPools();

  for (const pools of result) {
    console.log(`\nData for pool of id ${pools.poolId}\n`);
    console.log(pools);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
