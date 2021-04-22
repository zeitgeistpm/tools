// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Enum, Option, Struct, u128, u16, u64, u8 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
import type { AccountId, BlockNumber } from '@polkadot/types/interfaces/runtime';

/** @name Market */
export interface Market extends Struct {
  readonly creator: AccountId;
  readonly creation: MarketCreation;
  readonly creator_fee: u8;
  readonly oracle: AccountId;
  readonly end: MarketEnd;
  readonly metadata: Bytes;
  readonly market_type: MarketType;
  readonly market_status: MarketStatus;
  readonly report: Option<Report>;
  readonly resolved_outcome: Option<Outcome>;
}

/** @name MarketCreation */
export interface MarketCreation extends Enum {
  readonly isPermissionless: boolean;
  readonly isAdvised: boolean;
}

/** @name MarketDispute */
export interface MarketDispute extends Struct {
  readonly at: BlockNumber;
  readonly by: AccountId;
  readonly outcome: Outcome;
}

/** @name MarketEnd */
export interface MarketEnd extends Enum {
  readonly isBlock: boolean;
  readonly asBlock: BlockNumber;
  readonly isTimestamp: boolean;
  readonly asTimestamp: u64;
}

/** @name MarketId */
export interface MarketId extends u128 {}

/** @name MarketStatus */
export interface MarketStatus extends Enum {
  readonly isProposed: boolean;
  readonly isActive: boolean;
  readonly isSuspended: boolean;
  readonly isClosed: boolean;
  readonly isReported: boolean;
  readonly isDisputed: boolean;
  readonly isResolved: boolean;
}

/** @name MarketType */
export interface MarketType extends Enum {
  readonly isCategorical: boolean;
  readonly asCategorical: u16;
  readonly isScalar: boolean;
  readonly asScalar: ITuple<[u128, u128]>;
}

/** @name Outcome */
export interface Outcome extends Enum {
  readonly isCategorical: boolean;
  readonly asCategorical: u16;
  readonly isScalar: boolean;
  readonly asScalar: u128;
}

/** @name Report */
export interface Report extends Struct {
  readonly at: BlockNumber;
  readonly by: AccountId;
  readonly outcome: Outcome;
}

export type PHANTOM_PREDICTIONMARKETS = 'predictionMarkets';
