// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Enum, Option, Struct, u128, u16, u8 } from '@polkadot/types';
import type { AccountId, BlockNumber, Moment } from '@polkadot/types/interfaces/runtime';
import type { ITuple } from '@polkadot/types/types';

/** @name Market */
export interface Market extends Struct {
  readonly creator: AccountId;
  readonly creation: MarketCreation;
  readonly creator_fee: u8;
  readonly oracle: AccountId;
  readonly metadata: Bytes;
  readonly market_type: MarketType;
  readonly period: MarketPeriod;
  readonly scoring_rule: ScoringRule;
  readonly status: MarketStatus;
  readonly report: Option<Report>;
  readonly resolved_outcome: Option<OutcomeReport>;
  readonly mdm: MarketDisputeMechanism;
}

/** @name MarketCreation */
export interface MarketCreation extends Enum {
  readonly isPermissionless: boolean;
  readonly isAdvised: boolean;
  readonly type: 'Permissionless' | 'Advised';
}

/** @name MarketDispute */
export interface MarketDispute extends Struct {
  readonly at: BlockNumber;
  readonly by: AccountId;
  readonly outcome: OutcomeReport;
}

/** @name MarketDisputeMechanism */
export interface MarketDisputeMechanism extends Enum {
  readonly isAuthorized: boolean;
  readonly asAuthorized: AccountId;
  readonly isCourt: boolean;
  readonly isSimpleDisputes: boolean;
  readonly type: 'Authorized' | 'Court' | 'SimpleDisputes';
}

/** @name MarketId */
export interface MarketId extends u128 {}

/** @name MarketPeriod */
export interface MarketPeriod extends Enum {
  readonly isBlock: boolean;
  readonly asBlock: ITuple<[BlockNumber, BlockNumber]>;
  readonly isTimestamp: boolean;
  readonly asTimestamp: ITuple<[Moment, Moment]>;
  readonly type: 'Block' | 'Timestamp';
}

/** @name MarketStatus */
export interface MarketStatus extends Enum {
  readonly isProposed: boolean;
  readonly isActive: boolean;
  readonly isSuspended: boolean;
  readonly isClosed: boolean;
  readonly isCollectingSubsidy: boolean;
  readonly isInsufficientSubsidy: boolean;
  readonly isReported: boolean;
  readonly isDisputed: boolean;
  readonly isResolved: boolean;
  readonly type: 'Proposed' | 'Active' | 'Suspended' | 'Closed' | 'CollectingSubsidy' | 'InsufficientSubsidy' | 'Reported' | 'Disputed' | 'Resolved';
}

/** @name MarketType */
export interface MarketType extends Enum {
  readonly isCategorical: boolean;
  readonly asCategorical: u16;
  readonly isScalar: boolean;
  readonly asScalar: ITuple<[u128, u128]>;
  readonly type: 'Categorical' | 'Scalar';
}

/** @name OutcomeReport */
export interface OutcomeReport extends Enum {
  readonly isCategorical: boolean;
  readonly asCategorical: u16;
  readonly isScalar: boolean;
  readonly asScalar: u128;
  readonly type: 'Categorical' | 'Scalar';
}

/** @name Report */
export interface Report extends Struct {
  readonly at: BlockNumber;
  readonly by: AccountId;
  readonly outcome: OutcomeReport;
}

/** @name ScoringRule */
export interface ScoringRule extends Enum {
  readonly isCpmm: boolean;
  readonly isRikiddoSigmoidFeeMarketEma: boolean;
  readonly type: 'Cpmm' | 'RikiddoSigmoidFeeMarketEma';
}

export type PHANTOM_PREDICTIONMARKETS = 'predictionMarkets';
