import { ApiPromise } from "@polkadot/api";
import { GraphQLClient } from "graphql-request";

import ErrorTable from "./errorTable";
import Models from "./models";
import { initApi } from "./util";

export * as models from "./models";
export * as types from "./types";
export * as util from "./util";

type InitOptions = {
  logEndpointInitTime?: boolean;
  graphQlEndpoint?: string;
};

export default class SDK {
  public models: Models;

  static async promiseWithTimeout<T>(
    timeoutMs: number,
    promise: Promise<T>,
    failureMessage?: string
  ): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
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
    opts: InitOptions = { logEndpointInitTime: true }
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

      const { graphQlEndpoint } = opts;
      let graphQLClient: GraphQLClient;

      if (graphQlEndpoint != null) {
        graphQLClient = new GraphQLClient(graphQlEndpoint, {});
      }

      const eTable = await ErrorTable.populate(api);
      const sdk = new SDK(api, eTable, graphQLClient);

      return sdk;
    } catch (e) {
      throw e;
    }
  }

  static mock(mockedAPI: ApiPromise): SDK {
    return new SDK(mockedAPI);
  }

  constructor(
    public api: ApiPromise,
    public errorTable?: ErrorTable,
    public graphQLClient?: GraphQLClient
  ) {
    this.models = new Models(this.api, errorTable, { graphQLClient });
  }
}

// Needs an changed line to redeploy version.
