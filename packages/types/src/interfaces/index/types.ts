// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option, Struct, U8aFixed, Vec, i128, u128, u16, u32, u64 } from '@polkadot/types-codec';
import type { ITuple } from '@polkadot/types-codec/types';
import type { AccountId, AccountId32, Balance, MultiAddress, Perbill, Percent } from '@polkadot/types/interfaces/runtime';
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
  readonly type: 'CategoricalOutcome' | 'ScalarOutcome' | 'CombinatorialOutcome' | 'PoolShare' | 'Ztg';
}

/** @name AuthorId */
export interface AuthorId extends AccountId {}

/** @name BlockNumber */
export interface BlockNumber extends u64 {}

/** @name Bond */
export interface Bond extends Struct {
  readonly owner: AccountId;
  readonly amount: Balance;
}

/** @name CategoryIndex */
export interface CategoryIndex extends u16 {}

/** @name Collator2 */
export interface Collator2 extends Struct {
  readonly id: AccountId;
  readonly bond: Balance;
  readonly nominators: Vec<AccountId>;
  readonly topNominators: Vec<Bond>;
  readonly bottomNominators: Vec<Bond>;
  readonly totalCounted: Balance;
  readonly totalBacking: Balance;
  readonly state: CollatorStatus;
}

/** @name CollatorSnapshot */
export interface CollatorSnapshot extends Struct {
  readonly bond: Balance;
  readonly delegations: Vec<Bond>;
  readonly total: Balance;
}

/** @name CollatorStatus */
export interface CollatorStatus extends Enum {
  readonly isActive: boolean;
  readonly isIdle: boolean;
  readonly isLeaving: boolean;
  readonly asLeaving: RoundIndex;
  readonly type: 'Active' | 'Idle' | 'Leaving';
}

/** @name Currency */
export interface Currency extends Asset {}

/** @name CurrencyId */
export interface CurrencyId extends Asset {}

/** @name CurrencyIdOf */
export interface CurrencyIdOf extends Asset {}

/** @name DelegatorStatus */
export interface DelegatorStatus extends Enum {
  readonly isActive: boolean;
  readonly isLeaving: boolean;
  readonly asLeaving: RoundIndex;
  readonly type: 'Active' | 'Leaving';
}

/** @name ExitQ */
export interface ExitQ extends Struct {
  readonly candidates: Vec<AccountId>;
  readonly nominatorsLeaving: Vec<AccountId>;
  readonly candidateSchedule: Vec<ITuple<[AccountId, RoundIndex]>>;
  readonly nominatorSchedule: Vec<ITuple<[AccountId, Option<AccountId>, RoundIndex]>>;
}

/** @name Index */
export interface Index extends u64 {}

/** @name InflationInfo */
export interface InflationInfo extends Struct {
  readonly expect: RangeBalance;
  readonly annual: RangePerbill;
  readonly round: RangePerbill;
}

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
  readonly type: 'Sha3384';
}

/** @name Nominator2 */
export interface Nominator2 extends Struct {
  readonly delegations: Vec<Bond>;
  readonly revocations: Vec<AccountId>;
  readonly total: Balance;
  readonly scheduledRevocationsCount: u32;
  readonly scheduledRevocationsTotal: Balance;
  readonly status: DelegatorStatus;
}

/** @name NominatorAdded */
export interface NominatorAdded extends Enum {
  readonly isAddedToTop: boolean;
  readonly asAddedToTop: Balance;
  readonly isAddedToBottom: boolean;
  readonly type: 'AddedToTop' | 'AddedToBottom';
}

/** @name OrderedSet */
export interface OrderedSet extends Vec<Bond> {}

/** @name OwnedValuesParams */
export interface OwnedValuesParams extends Struct {
  readonly participatedBlocks: BlockNumber;
  readonly perpetualIncentives: Balance;
  readonly totalIncentives: Balance;
  readonly totalShares: Balance;
}

/** @name ParachainBondConfig */
export interface ParachainBondConfig extends Struct {
  readonly account: AccountId;
  readonly percent: Percent;
}

/** @name RangeBalance */
export interface RangeBalance extends Struct {
  readonly min: Balance;
  readonly ideal: Balance;
  readonly max: Balance;
}

/** @name RangePerbill */
export interface RangePerbill extends Struct {
  readonly min: Perbill;
  readonly ideal: Perbill;
  readonly max: Perbill;
}

/** @name RelayChainAccountId */
export interface RelayChainAccountId extends AccountId32 {}

/** @name RewardInfo */
export interface RewardInfo extends Struct {
  readonly totalReward: Balance;
  readonly claimedReward: Balance;
}

/** @name RoundIndex */
export interface RoundIndex extends u32 {}

/** @name RoundInfo */
export interface RoundInfo extends Struct {
  readonly current: RoundIndex;
  readonly first: BlockNumber;
  readonly length: u32;
}

/** @name ScalarPosition */
export interface ScalarPosition extends Enum {
  readonly isLong: boolean;
  readonly isShort: boolean;
  readonly type: 'Long' | 'Short';
}

/** @name SerdeWrapper */
export interface SerdeWrapper extends Balance {}

/** @name VestingBlockNumber */
export interface VestingBlockNumber extends u32 {}

export type PHANTOM_INDEX = 'index';
