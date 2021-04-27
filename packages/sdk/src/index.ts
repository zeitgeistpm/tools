import { ApiPromise } from "@polkadot/api";
import Models from "./models";
import { initApi } from "./util";

export * as consts from "./consts";
export * as models from "./models";
export * as types from "./types";
export * as util from "./util";
export default class SDK {
  public api: ApiPromise;
  public models: Models;

  static async initialize(
    endpoint = "wss://bp-rpc.zeitgeist.pm",
    logEndpointInitTime = true
  ): Promise<SDK> {
    const start=Date.now();
    const api = await initApi(endpoint);
    if (logEndpointInitTime) {
      console.log(`${endpoint} initialised in ${Date.now()-start} ms.`);      
    }

    return new SDK(api);
  }

  static mock(mockedAPI): SDK {
    return new SDK(mockedAPI as any);
  }

  constructor(api: ApiPromise) {
    this.api = api;
    this.models = new Models(this.api);
  }
}
