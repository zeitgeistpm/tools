// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option, Struct, i128, u128, u16, u32, u64 } from '@polkadot/types-codec';

/** @name EmaConfig */
export interface EmaConfig extends Struct {
  readonly emaPeriod: Timespan;
  readonly emaPeriodEstimateAfter: Option<Timespan>;
  readonly smoothing: u128;
}

/** @name EmaMarketVolume */
export interface EmaMarketVolume extends Struct {
  readonly config: EmaConfig;
  readonly ema: u128;
  readonly multiplier: u128;
  readonly lastTime: UnixTimestamp;
  readonly state: MarketVolumeState;
  readonly startTime: UnixTimestamp;
  readonly volumesPerPeriod: u128;
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
  readonly initialFee: i128;
  readonly minRevenue: i128;
}

/** @name MarketVolumeState */
export interface MarketVolumeState extends Enum {
  readonly isUninitialized: boolean;
  readonly isDataCollectionStarted: boolean;
  readonly isDataCollected: boolean;
  readonly type: 'Uninitialized' | 'DataCollectionStarted' | 'DataCollected';
}

/** @name Rikiddo */
export interface Rikiddo extends Struct {
  readonly config: RikiddoConfig;
  readonly fees: FeeSigmoid;
  readonly maShort: EmaMarketVolume;
  readonly maLong: EmaMarketVolume;
}

/** @name RikiddoConfig */
export interface RikiddoConfig extends Struct {
  readonly initialFee: i128;
  readonly log2E: i128;
}

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
  readonly type: 'Seconds' | 'Minutes' | 'Hours' | 'Days' | 'Weeks';
}

/** @name UnixTimestamp */
export interface UnixTimestamp extends u64 {}

export type PHANTOM_RIKKIDO = 'rikkido';
