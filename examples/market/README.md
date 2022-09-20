# Market

### toJSONString

You can use this function to convert market object into string.

```typescript
const sdk = await SDK.initialize(endpoint);

const res = await sdk.models.getAllMarkets();

res.forEach((market) => console.log(market.toJSONString()));
```

### toFilteredJSONString

You can use this function to convert market object into string with filters.

```typescript
const sdk = await SDK.initialize(endpoint);

const res = await sdk.models.getAllMarkets();

res.forEach((market) => console.log(market.toFilteredJSONString(filter)));
```

### filterMarketData

Populate only selected attributes from the market data defined using filter.
Populates `marketId` by default.

```typescript
const res = filterMarketData(market, filter);
```

[Code snippet](./filterMarketData.ts)

### getEndTimestamp

You can use this function to get timestamp at the end of the market period.

```typescript
const res = market.getEndTimestamp();
```

[Code snippet](./getEndTimestamp.ts)

### getPoolId
You can use this function to get pool id to be used for fetching data using `sdk.models.market.getPool()`.
Returns null if no swap pool is available for the market.

```typescript
const res = market.getPoolId();
```

[Code snippet](./getPoolId.ts)

### getPool
You can use this function to recreate swap pool for this market using data fetched with `poolId`.

```typescript
const res = market.getPool();
```

[Code snippet](./getPool.ts)

### getDisputes

You can use this function to fetch disputes for this market using unique identifier `marketId`.

```typescript
const res = market.getDisputes();
```

[Code snippet](./getDisputes.ts)

### deploySwapPool

You can use this function to create swap pool for this market via `api.tx.predictionMarkets.deploySwapPoolForMarket(marketId, weights)`.

```typescript
const res = await market.deploySwapPool(signer, wts, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| weights | string | List of lengths for each asset. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./deploySwapPool.ts)

### assetSpotPricesInZtg

You can use this function to fetch spot prices of all assets in this market
Can be used to find prices at a particular block using unique identifier.

```typescript
const res = market.assetSpotPricesInZtg(blockHash);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| blockHash | any | not necessarily. The unique identifier for the block to fetch asset spot prices. |

[Code snippet](./assetSpotPricesInZtg.ts)

### buyCompleteSet

You can use this function to buy a complete set of outcome shares for the market.
**Note: This is the only way to create new shares.**

```typescript
const res = market.buyCompleteSet(signer, Number(1000000000000));
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| amount | number | The amount of each share. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./buyCompleteSet.ts)

### sellCompleteSet

You can use this function to sell/destroy a complete set of outcome shares for the market.

```typescript
const res = market.sellCompleteSet(signer, Number(1000000000000));
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| amount | number | The amount of each share. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./sellCompleteSet.ts)

### reportOutcome

You can use this function to report an outcome for the market.

```typescript
const res = await market.reportOutcome(signer, outcomeReport, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| outcome | OutcomeReport | The outcome of the market |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./reportOutcome.ts)

### dispute

You can use this function to submit a disputed outcome for the market.

```typescript
const res = await market.dispute(signer, outcomeReport, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| outcome | OutcomeReport | The outcome of the market |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./dispute.ts)

### redeemShares

You can use this function to redeem the winning shares for the market.

```typescript
const res = await market.redeemShares(signer, outcomeReport, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| outcome | OutcomeReport | The outcome of the market |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./redeemShares.ts)

### approve

You can use this function to approve the `Proposed` market that is waiting for approval from the advisory committee.

```typescript
const res = await market.approve(signer, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./approve.ts)

### reject

You can use this function to reject the `Proposed` market that is waiting for approval from the advisory committee.

```typescript
const res = await market.reject(signer, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./reject.ts)

### cancelAdvised

You can use this function to allow the proposer of the market that is currently in a `Proposed` state to cancel the market proposal.

```typescript
const res = await market.cancelAdvised(signer, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| callbackOrPaymentInfo | | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./cancelAdvised.ts)
