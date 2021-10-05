import { ApiPromise } from "@polkadot/api";

import ErrorTable from "./errorTable";
import Models from "./models";
import { initApi } from "./util";

export * as models from "./models";
export * as types from "./types";
export * as util from "./util";

export default class SDK {
  public api: ApiPromise;
  public errorTable: ErrorTable;
  public models: Models;

  static async initialize(
    endpoint = "wss://bsr.zeitgeist.pm",
    opts = { logEndpointInitTime: true }
  ): Promise<SDK> {
    const start = Date.now();
    const api = await initApi(endpoint);
    if (opts.logEndpointInitTime) {
      console.log(`${endpoint} initialised in ${Date.now() - start} ms.`);
    }

    const eTable = await ErrorTable.populate(api);
    const sdk = new SDK(api, eTable);

    return sdk;
  }

  static mock(mockedAPI: ApiPromise): SDK {
    return new SDK(mockedAPI);
  }

  constructor(api: ApiPromise, errorTable?: ErrorTable) {
    this.api = api;
    this.errorTable = errorTable;
    this.models = new Models(this.api, errorTable);
  }
}

// Needs an changed line to redeploy version.
