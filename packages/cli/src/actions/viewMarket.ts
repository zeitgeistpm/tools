import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  seed?: string;
  address?: string;
};

const viewMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;
  let { address } = opts;

  const sdk = await SDK.initialize(endpoint);
  
  if (seed) {
    address = address || util.signerFromSeed(seed).address
  }

  const market = await sdk.models.fetchMarketData(Number(marketId));
  if (address) {
    // TODO:  Poll tokens pallet for AccountIds with accounts_by_currency_id
    // But see: https://github.com/zeitgeistpm/zeitgeist/issues/101
    // (maybe wait until new index is built!)
    // const owns = (opts && opts.address)
    //   ? outcomeAssets.map (asset=>({
    //      asset: asset.toJSON(),
    //      amount: 777
    //     }))
    //   : null ;
    // console.log('owns:', owns);
    //
    // if (owns) {
    //   console.log(owns);
    //   // NB: no longer ExtendedMarketResponse type, since extra field's name is an address
    //   extendedMarketResponse[opts.address] = { owns };      
    // }  
  }
  console.log(market.toJSONString());
};

export default viewMarket;
