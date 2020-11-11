import all from "it-all";
import { concat, toString } from "uint8arrays";

import { initIpfs } from "../util/ipfs";
import {initApi} from "../util/polkadot";

import { hexToString } from "@polkadot/util";

type Options = {
  endpoint: string;
  marketId: string;
};

const viewMarket = async (opts: Options) => {
  const { endpoint, marketId } = opts;

  const api = await initApi(endpoint);
  const ipfs = initIpfs();

  const market = (await api.query.predictionMarkets.markets(marketId)).toJSON() as any;

  const { metadata } = market;
  market.metadata = hexToString(metadata);

  const data = toString(concat(await all(ipfs.cat(hexToString(metadata)))));
  
  const extract = (data: string) => {
    const titlePattern = "title:";
    const infoPattern = "::info:";
    return {
      title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
      info: data.slice(data.indexOf(infoPattern) + infoPattern.length),
    }
  }

  Object.assign(market, extract(data));

  console.log(market);
  //@ts-ignore
  console.log('Invalid share id:', (await api.rpc.predictionMarkets.marketOutcomeShareId(0,0)).toString());
  //@ts-ignore
  console.log('Yes share id:', (await api.rpc.predictionMarkets.marketOutcomeShareId(0,1)).toString());
  //@ts-ignore
  console.log('No share id:', (await api.rpc.predictionMarkets.marketOutcomeShareId(0,2)).toString());


  process.exit(0);
} 

export default viewMarket;
