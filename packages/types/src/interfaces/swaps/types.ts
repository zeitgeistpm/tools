// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Enum, Struct, Vec, u128 } from '@polkadot/types';
import type { AccountId, Balance } from '@polkadot/types/interfaces/runtime';
import type { Asset } from '@zeitgeistpm/types/interfaces/index';

/** @name CommonPoolEventParams */
export interface CommonPoolEventParams extends Struct {
  readonly pool_id: u128;
  readonly who: AccountId;
}

/** @name Pool */
export interface Pool extends Struct {
  readonly assets: Vec<Asset>;
  readonly pool_status: PoolStatus;
  readonly swap_fee: Balance;
  readonly total_weight: u128;
  readonly weights: BTreeMap<Asset, u128>;
}

/** @name PoolAssetEvent */
export interface PoolAssetEvent extends Struct {
  readonly bound: Balance;
  readonly cpep: CommonPoolEventParams;
  readonly transferred: Balance;
}

/** @name PoolAssetsEvent */
export interface PoolAssetsEvent extends Struct {
  readonly bounds: Vec<Balance>;
  readonly cpep: CommonPoolEventParams;
  readonly transferred: Vec<Balance>;
}

/** @name PoolId */
export interface PoolId extends u128 {}

/** @name PoolStatus */
export interface PoolStatus extends Enum {
  readonly isActive: boolean;
  readonly isStale: boolean;
}

/** @name SwapEvent */
export interface SwapEvent extends Struct {
  readonly asset_amount_in: Balance;
  readonly asset_amount_out: Balance;
  readonly asset_bound: Balance;
  readonly cpep: CommonPoolEventParams;
  readonly max_price: Balance;
}

export type PHANTOM_SWAPS = 'swaps';
