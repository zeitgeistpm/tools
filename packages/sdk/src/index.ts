import { ApiPromise } from "@polkadot/api";
import { isFunction } from "@polkadot/util";
import { GraphQLClient, request, gql } from "graphql-request";

import ErrorTable from "./errorTable";
import Models from "./models";
import { initApi } from "./util";
import { lazyInitApi } from "./util/polkadot";

export * as models from "./models";
export * as types from "./types";
export * as util from "./util";

type InitOptions = {
  logEndpointInitTime?: boolean;
  graphQlEndpoint?: string;
  ipfsClientUrl?: string;
  initialConnectionTries?: number;
};

export const pingGqlEndpoint = async (endpoint: string) => {
  try {
    await request(
      endpoint,
      gql`
        query PingQuery {
          markets(limit: 1) {
            id
          }
        }
      `
    );
    return true;
  } catch (error) {
    return false;
  }
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
    opts: InitOptions = {
      logEndpointInitTime: true,
      ipfsClientUrl: "https://ipfs.zeitgeist.pm",
      initialConnectionTries: 5,
    }
  ): Promise<SDK> {
    try {
      const start = Date.now();

      const api = await SDK.promiseWithTimeout<ApiPromise>(
        15000,
        new Promise(async (resolve, reject) => {
          const [provider, create] = lazyInitApi(endpoint);
          let connectionTries = 0;
          provider.on("error", () => {
            connectionTries++;
            if (connectionTries > (opts.initialConnectionTries || 5)) {
              provider.disconnect();
              reject("Could not connect to the node");
            }
          });
          provider.on("connected", () => {
            resolve(create());
          });
        }),
        "Timed out while connecting to the zeitgeist node. Check your node address."
      );

      if (opts.logEndpointInitTime) {
        console.log(`${endpoint} initialised in ${Date.now() - start} ms\n`);
      }

      const { graphQlEndpoint, ipfsClientUrl } = opts;
      let graphQLClient: GraphQLClient;

      if (graphQlEndpoint != null) {
        const active = await pingGqlEndpoint(graphQlEndpoint);
        if (!active) {
          console.warn("Graph Ql is unavailable, graphql features disabled.");
        } else {
          graphQLClient = new GraphQLClient(graphQlEndpoint, {});
        }
      }

      const eTable = await ErrorTable.populate(api);
      const sdk = new SDK(api, eTable, graphQLClient, ipfsClientUrl, endpoint);

      return sdk;
    } catch (e) {
      throw e;
    }
  }

  static mock(mockedAPI: ApiPromise): SDK {
    return new SDK(mockedAPI);
  }

  get graphQlEnabled() {
    return this.graphQLClient != null;
  }

  /**
   * @param api Polkadot.js API
   * @param graphQLClient If sdk is able to connect to this graphql client graphql support is enabled
   * @param ipfsClientUrl Connect to this ipfs node instead of the default one (https://ipfs.zeitgesit.pm)
   */
  constructor(
    public api: ApiPromise,
    public errorTable?: ErrorTable,
    public graphQLClient?: GraphQLClient,
    ipfsClientUrl?: string,
    endpoint?: string
  ) {
    this.models = new Models(this.api, errorTable, {
      graphQLClient,
      ipfsClientUrl,
      endpoint,
    });
  }
}
