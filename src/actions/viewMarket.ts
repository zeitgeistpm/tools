import all from "it-all";
import { concat, fromString, toString } from "uint8arrays";

import { initIpfs } from "../util/ipfs";
import {initApi} from "../util/polkadot";

import { hexToString } from "@polkadot/util";

type Options = {
  marketId: string;
};

const viewMarket = async (opts: Options) => {
  const { marketId } = opts;

  const api = await initApi();
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

  process.exit(0);
} 

export default viewMarket;
