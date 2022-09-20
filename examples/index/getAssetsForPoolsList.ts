import SDK from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });

  // get pools
  const pools = await sdk.models.filterPools();
  console.log(pools.toLocaleString);

  const res = await sdk.models.getAssetsForPoolsList(pools);
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
