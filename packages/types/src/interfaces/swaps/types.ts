// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Enum, Option, Struct, Vec, u128 } from '@polkadot/types-codec';
import type { AccountId, Balance } from '@polkadot/types/interfaces/runtime';
import type { Asset } from '@zeitgeistpm/types/interfaces/index';
import type { MarketId, MarketPeriod, ScoringRule } from '@zeitgeistpm/types/interfaces/predictionMarkets';

/** @name CommonPoolEventParams */
export interface CommonPoolEventParams extends Struct {
  readonly poolId: u128;
  readonly who: AccountId;
}

/** @name Pool */
export interface Pool extends Struct {
  readonly assets: Vec<Asset>;
  readonly baseAsset: Asset;
  readonly marketId: MarketId;
  readonly poolStatus: PoolStatus;
  readonly scoringRule: ScoringRule;
  readonly swapFee: Option<Balance>;
  readonly totalSubsidy: Option<Balance>;
  readonly totalWeight: Option<u128>;
  readonly weights: Option<BTreeMap<Asset, u128>>;
}

/** @name PoolAssetEvent */
export interface PoolAssetEvent extends Struct {
  readonly asset: Asset;
  readonly bound: Balance;
  readonly cpep: CommonPoolEventParams;
  readonly transferred: Balance;
}

/** @name PoolAssetsEvent */
export interface PoolAssetsEvent extends Struct {
  readonly assets: Vec<Asset>;
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
  readonly isClosed: boolean;
  readonly isClean: boolean;
  readonly isInitialized: boolean;
  readonly type: 'Active' | 'CollectingSubsidy' | 'Closed' | 'Clean' | 'Initialized';
}

/** @name SubsidyUntil */
export interface SubsidyUntil extends Struct {
  readonly marketId: MarketId;
  readonly period: MarketPeriod;
}

/** @name SwapEvent */
export interface SwapEvent extends Struct {
  readonly assetAmountIn: Balance;
  readonly assetAmountOut: Balance;
  readonly assetBound: Balance;
  readonly assetIn: Asset;
  readonly assetOut: Asset;
  readonly cpep: CommonPoolEventParams;
  readonly maxPrice: Balance;
}

export type PHANTOM_SWAPS = 'swaps';
