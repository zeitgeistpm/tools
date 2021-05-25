import { ApiPromise } from "@polkadot/api";
import Model from "./models";
import { initApi } from "./util";

export * as consts from "./consts";
export * as model from "./models";
export * as types from "./types";
export * as util from "./util";
export default class SDK {
  public api: ApiPromise;
  public model: Model;

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
    await sdk.populateErrors();
    return sdk;
  }

  populateErrors = async (): Promise<any> => {
    const metadata = await this.api.rpc.state.getMetadata();
    const inner = metadata.get("metadata");
    // @ts-ignore
    const errors = inner.toJSON().v12.modules.map((module) => {
      const { name, errors, index } = module;
      const pallet = errors.length
        ? errors.map((error, errorIndex) => ({
            name: error.name,
            documentation: error.documentation,
          }))
        : [];
      pallet.name = name;
      return pallet;
    });

    console.log(errors);
    this.model.errors = errors;
    return errors;
  };

  static mock(mockedAPI): SDK {
    return new SDK(mockedAPI as any);
  }

  constructor(api: ApiPromise) {
    this.api = api;
    this.model = new Model(this.api);
  }
}
