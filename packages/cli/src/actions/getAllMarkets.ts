import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  filter?: string[];
};

const getAllMarkets = async (opts: Options): Promise<void> => {
  const { endpoint, filter } = opts;
  if (Array.isArray(filter) && filter[0]==='ilter')
    return console.log('-filter is not an option. Did you mean --filter ?');

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getAllMarkets();

  // Check -f has arguments (since otherwise filter==true)
  if (Array.isArray(filter))
    res.forEach(market=> console.log(market.toFilteredJSONString(filter)))
  else
    res.forEach(market=> console.log(market.toJSONString()));
};

export default getAllMarkets;
