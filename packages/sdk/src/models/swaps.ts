import { ApiPromise } from "@polkadot/api";
import { PoolResponse } from "../types";

/**
 * The Swap class provides an interface over the `Swaps` module for
 * providing liquidity to pools and swapping assets.
 */
export default class Swap {
  public assets;
  public swapFee;
  public totalWeight;
  public weights;

  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;

  constructor(details: PoolResponse, api: ApiPromise) {
    const { assets, swap_fee, total_weight, weights } = details;

    this.assets = assets;
    this.swapFee = swap_fee;
    this.totalWeight = total_weight;
    this.weights = weights;

    this.api = api;
  }
}
