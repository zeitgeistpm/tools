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

  static promiseWithTimeout<T>(
    timeoutMs: number,
    promise: Promise<T>,
    failureMessage?: string
  ) {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((resolve, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error(failureMessage)),
        timeoutMs
      );
    });

    return Promise.race([promise, timeoutPromise]).then((result) => {
      clearTimeout(timeoutHandle);
      return result;
    });
  }

  static async initialize(
    endpoint = "wss://bsr.zeitgeist.pm",
    opts = { logEndpointInitTime: true }
  ): Promise<SDK> {
    try {
      const start = Date.now();
      const api = await SDK.promiseWithTimeout(
        10000,
        initApi(endpoint),
        "Timed out while connecting to the zeitgeist node. Check your node address."
      );

      if (opts.logEndpointInitTime) {
        console.log(`${endpoint} initialised in ${Date.now() - start} ms.`);
      }

      const eTable = await ErrorTable.populate(api);
      const sdk = new SDK(api, eTable);

      return sdk;
    } catch (e) {
      throw e;
    }
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
