import SDK from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });
  const addrs = ["dE24zvxMRa46j6iv2YAYbnYF5MTeZrQUnSGffZ9rCVuNCDDDy"];
  const res = await sdk.models.getAccountBalances(addrs);
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
