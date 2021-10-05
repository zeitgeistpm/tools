// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, U8aFixed, i128, u128, u16, u64 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
import type { AccountId, Balance, MultiAddress } from '@polkadot/types/interfaces/runtime';
import type { MarketId } from '@zeitgeistpm/types/interfaces/predictionMarkets';

/** @name Address */
export interface Address extends MultiAddress {}

/** @name Amount */
export interface Amount extends i128 {}

/** @name AmountOf */
export interface AmountOf extends i128 {}

/** @name Asset */
export interface Asset extends Enum {
  readonly isCategoricalOutcome: boolean;
  readonly asCategoricalOutcome: ITuple<[MarketId, CategoryIndex]>;
  readonly isScalarOutcome: boolean;
  readonly asScalarOutcome: ITuple<[MarketId, ScalarPosition]>;
  readonly isCombinatorialOutcome: boolean;
  readonly isPoolShare: boolean;
  readonly asPoolShare: u128;
  readonly isZtg: boolean;
}

/** @name AuthorId */
export interface AuthorId extends AccountId {}

/** @name BlockNumber */
export interface BlockNumber extends u64 {}

/** @name CategoryIndex */
export interface CategoryIndex extends u16 {}

/** @name Currency */
export interface Currency extends Asset {}

/** @name CurrencyId */
export interface CurrencyId extends Asset {}

/** @name CurrencyIdOf */
export interface CurrencyIdOf extends Asset {}

/** @name Index */
export interface Index extends u64 {}

/** @name Lookup */
export interface Lookup extends MultiAddress {}

/** @name MarketIdOf */
export interface MarketIdOf extends u128 {}

/** @name MaxRuntimeUsize */
export interface MaxRuntimeUsize extends u64 {}

/** @name Moment */
export interface Moment extends u64 {}

/** @name MultiHash */
export interface MultiHash extends Enum {
  readonly isSha3384: boolean;
  readonly asSha3384: U8aFixed;
}

/** @name ScalarPosition */
export interface ScalarPosition extends Enum {
  readonly isLong: boolean;
  readonly isShort: boolean;
}

/** @name SerdeWrapper */
export interface SerdeWrapper extends Balance {}

export type PHANTOM_INDEX = 'index';
