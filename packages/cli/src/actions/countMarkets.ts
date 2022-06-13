import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
};

const countMarkets = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getMarketCount();

  if (res >= 0) {
    console.log(`\x1b[36m%s\x1b[0m`, `\nCountMarkets successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\nCountMarkets failed!`);
  }
};

export default countMarkets;
