import { initApi } from "../util";

type PoolId = number;
type PoolResponse = {
  assets: string[];
  swap_fee: number;
  total_weight: number;
  weights: any;
};

/**
 * The Swap class provides an interface over the `Swaps` module for
 * providing liquidity to pools and swapping assets.
 */
export default class Swap {
  constructor() {}

  static async getRemote(poolId: PoolId): Promise<Swap> {
    const api = await initApi();

    const pool = (await api.query.swaps.pools(poolId)).toJSON() as any;

    if (!pool) {
      throw new Error(`Pool with pool id ${poolId} does not exist.`);
    }

    return new Swap();
  }
}
