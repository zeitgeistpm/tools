import { ApiPromise } from "@polkadot/api";
import Models from "./models";
import { initApi } from "./util";

export * as models from "./models";
export * as types from "./types";
export * as util from "./util";

export default class SDK {
  public api: ApiPromise;
  public models: Models;

  static async initialize(
    endpoint = "wss://bp-rpc.zeitgeist.pm"
  ): Promise<SDK> {
    const api = await initApi(endpoint);

    return new SDK(api);
  }

  constructor(api: ApiPromise) {
    this.api = api;
    this.models = new Models(this.api);
  }
}
