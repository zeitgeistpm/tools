// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Enum, Option, Struct, Vec, u128 } from '@polkadot/types';
import type { AccountId, Balance } from '@polkadot/types/interfaces/runtime';
import type { Asset } from '@zeitgeistpm/types/interfaces/index';
import type { MarketId, MarketPeriod, ScoringRule } from '@zeitgeistpm/types/interfaces/predictionMarkets';

/** @name CommonPoolEventParams */
export interface CommonPoolEventParams extends Struct {
  readonly pool_id: u128;
  readonly who: AccountId;
}

/** @name Pool */
export interface Pool extends Struct {
  readonly assets: Vec<Asset>;
  readonly base_asset: Option<Asset>;
  readonly market_id: MarketId;
  readonly pool_status: PoolStatus;
  readonly scoring_rule: ScoringRule;
  readonly swap_fee: Option<Balance>;
  readonly total_subsidy: Option<Balance>;
  readonly total_weight: Option<u128>;
  readonly weights: Option<BTreeMap<Asset, u128>>;
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
  readonly isCollectingSubsidy: boolean;
  readonly isStale: boolean;
}

/** @name SubsidyUntil */
export interface SubsidyUntil extends Struct {
  readonly market_id: MarketId;
  readonly period: MarketPeriod;
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
