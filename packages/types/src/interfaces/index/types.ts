// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, i128, u128, u16, u64 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
import type { MultiAddress } from '@polkadot/types/interfaces/runtime';
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

/** @name BlockNumber */
export interface BlockNumber extends u64 {}

/** @name CategoryIndex */
export interface CategoryIndex extends u16 {}

/** @name CurrencyId */
export interface CurrencyId extends Asset {}

/** @name CurrencyIdOf */
export interface CurrencyIdOf extends Asset {}

/** @name Index */
export interface Index extends u64 {}

/** @name Lookup */
export interface Lookup extends MultiAddress {}

/** @name ScalarPosition */
export interface ScalarPosition extends Enum {
  readonly isLong: boolean;
  readonly isShort: boolean;
}

export type PHANTOM_INDEX = 'index';
