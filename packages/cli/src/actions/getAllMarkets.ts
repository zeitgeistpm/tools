// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  endpoint: string;
  filter?: string[];
};

const getAllMarkets = async (opts: Options): Promise<void> => {
  const { endpoint, filter } = opts;
  if (Array.isArray(filter) && filter[0] === "ilter") {
    return console.log("-filter is not an option. Did you mean --filter ?");
  }
  // supress output of endpoint initialisation timer, which confuses |jq '.'
  const sdk = await SDK.initialize(endpoint, { logEndpointInitTime: false });

  const res = await sdk.models.getAllMarkets();

  // Check -f has arguments (since otherwise filter==true)
  if (Array.isArray(filter)) {
    res.forEach((market) => console.log(market.toFilteredJSONString(filter)));
  } else {
    res.forEach((market) => console.log(market.toJSONString()));
  }
};

export default getAllMarkets;
