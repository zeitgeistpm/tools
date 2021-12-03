// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option, Struct, U8aFixed, Vec, i128, u128, u16, u32, u64 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
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
  readonly top_nominators: Vec<Bond>;
  readonly bottom_nominators: Vec<Bond>;
  readonly total_counted: Balance;
  readonly total_backing: Balance;
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
}

/** @name EmaConfig */
export interface EmaConfig extends Struct {
  readonly ema_period: Timespan;
  readonly ema_period_estimate_after: Option<Timespan>;
  readonly smoothing: u128;
}

/** @name EmaMarketVolume */
export interface EmaMarketVolume extends Struct {
  readonly config: EmaConfig;
  readonly ema: u128;
  readonly multiplier: u128;
  readonly last_time: UnixTimestamp;
  readonly state: MarketVolumeState;
  readonly start_time: UnixTimestamp;
  readonly volumes_per_period: u128;
}

/** @name ExitQ */
export interface ExitQ extends Struct {
  readonly candidates: Vec<AccountId>;
  readonly nominators_leaving: Vec<AccountId>;
  readonly candidate_schedule: Vec<ITuple<[AccountId, RoundIndex]>>;
  readonly nominator_schedule: Vec<ITuple<[AccountId, Option<AccountId>, RoundIndex]>>;
}

/** @name FeeSigmoid */
export interface FeeSigmoid extends Struct {
  readonly config: FeeSigmoidConfig;
}

/** @name FeeSigmoidConfig */
export interface FeeSigmoidConfig extends Struct {
  readonly m: i128;
  readonly p: i128;
  readonly n: i128;
  readonly initial_fee: i128;
  readonly min_revenue: i128;
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

/** @name MarketVolumeState */
export interface MarketVolumeState extends Enum {
  readonly isUninitialized: boolean;
  readonly isDataCollectionStarted: boolean;
  readonly isDataCollected: boolean;
}

/** @name MaxRuntimeUsize */
export interface MaxRuntimeUsize extends u64 {}

/** @name Moment */
export interface Moment extends u64 {}

/** @name MultiHash */
export interface MultiHash extends Enum {
  readonly isSha3384: boolean;
  readonly asSha3384: U8aFixed;
}

/** @name Nominator2 */
export interface Nominator2 extends Struct {
  readonly delegations: Vec<Bond>;
  readonly revocations: Vec<AccountId>;
  readonly total: Balance;
  readonly scheduled_revocations_count: u32;
  readonly scheduled_revocations_total: Balance;
  readonly status: DelegatorStatus;
}

/** @name NominatorAdded */
export interface NominatorAdded extends Enum {
  readonly isAddedToTop: boolean;
  readonly asAddedToTop: Balance;
  readonly isAddedToBottom: boolean;
}

/** @name OrderedSet */
export interface OrderedSet extends Vec<Bond> {}

/** @name OwnedValuesParams */
export interface OwnedValuesParams extends Struct {
  readonly participated_blocks: BlockNumber;
  readonly perpetual_incentives: Balance;
  readonly total_incentives: Balance;
  readonly total_shares: Balance;
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
  readonly total_reward: Balance;
  readonly claimed_reward: Balance;
}

/** @name Rikiddo */
export interface Rikiddo extends Struct {
  readonly config: RikiddoConfig;
  readonly fees: FeeSigmoid;
  readonly ma_short: EmaMarketVolume;
  readonly ma_long: EmaMarketVolume;
}

/** @name RikiddoConfig */
export interface RikiddoConfig extends Struct {
  readonly initial_fee: i128;
  readonly log2_e: i128;
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
}

/** @name SerdeWrapper */
export interface SerdeWrapper extends Balance {}

/** @name Timespan */
export interface Timespan extends Enum {
  readonly isSeconds: boolean;
  readonly asSeconds: u32;
  readonly isMinutes: boolean;
  readonly asMinutes: u32;
  readonly isHours: boolean;
  readonly asHours: u32;
  readonly isDays: boolean;
  readonly asDays: u16;
  readonly isWeeks: boolean;
  readonly asWeeks: u16;
}

/** @name UnixTimestamp */
export interface UnixTimestamp extends u64 {}

/** @name VestingBlockNumber */
export interface VestingBlockNumber extends u32 {}

export type PHANTOM_INDEX = 'index';
