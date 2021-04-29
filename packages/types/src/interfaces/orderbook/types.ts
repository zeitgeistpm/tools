// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option, Struct } from '@polkadot/types';
import type { AccountId, Balance, Hash } from '@polkadot/types/interfaces/runtime';

/** @name Order */
export interface Order extends Struct {
  readonly side: OrderSide;
  readonly maker: AccountId;
  readonly taker: Option<AccountId>;
  readonly share_id: Hash;
  readonly total: Balance;
  readonly price: Balance;
  readonly filled: Balance;
}

/** @name OrderSide */
export interface OrderSide extends Enum {
  readonly isBid: boolean;
  readonly isAsk: boolean;
}

export type PHANTOM_ORDERBOOK = 'orderbook';
