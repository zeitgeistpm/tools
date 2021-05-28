import { ApiPromise } from "@polkadot/api";

import ErrorTable from "./errorTable";
import Models from "./models";
import { initApi } from "./util";

export * as consts from "./consts";
export * as models from "./models";
export * as types from "./types";
export * as util from "./util";

export default class SDK {
  public api: ApiPromise;
  public errorTable: ErrorTable;
  public models: Models;

  static async initialize(
    endpoint = "wss://bp-rpc.zeitgeist.pm",
    opts = { logEndpointInitTime: true }
  ): Promise<SDK> {
    const start = Date.now();
    const api = await initApi(endpoint);
    if (opts.logEndpointInitTime) {
      console.log(`${endpoint} initialised in ${Date.now() - start} ms.`);
    }

    const sdk = new SDK(api);
    const eTable = await ErrorTable.populate(api);
    sdk.errorTable = eTable;

    return sdk;
  }

  static mock(mockedAPI: any): SDK {
    return new SDK(mockedAPI);
  }

  constructor(api: ApiPromise) {
    this.api = api;
    this.models = new Models(this.api);
  }
}
