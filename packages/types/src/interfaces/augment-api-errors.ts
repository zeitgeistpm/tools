// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { ApiTypes } from '@polkadot/api-base/types';

declare module '@polkadot/api-base/types/errors' {
  export interface AugmentedErrors<ApiType extends ApiTypes> {
    advisoryCommittee: {
      /**
       * Members are already initialized!
       **/
      AlreadyInitialized: AugmentedError<ApiType>;
      /**
       * Duplicate proposals not allowed
       **/
      DuplicateProposal: AugmentedError<ApiType>;
      /**
       * Duplicate vote ignored
       **/
      DuplicateVote: AugmentedError<ApiType>;
      /**
       * Account is not a member
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Proposal must exist
       **/
      ProposalMissing: AugmentedError<ApiType>;
      /**
       * The close call was made too early, before the end of the voting.
       **/
      TooEarly: AugmentedError<ApiType>;
      /**
       * There can only be a maximum of `MaxProposals` active proposals.
       **/
      TooManyProposals: AugmentedError<ApiType>;
      /**
       * Mismatched index
       **/
      WrongIndex: AugmentedError<ApiType>;
      /**
       * The given length bound for the proposal was too low.
       **/
      WrongProposalLength: AugmentedError<ApiType>;
      /**
       * The given weight bound for the proposal was too low.
       **/
      WrongProposalWeight: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    advisoryCommitteeMembership: {
      /**
       * Already a member.
       **/
      AlreadyMember: AugmentedError<ApiType>;
      /**
       * Not a member.
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    assetManager: {
      /**
       * Unable to convert the Amount type into Balance.
       **/
      AmountIntoBalanceFailed: AugmentedError<ApiType>;
      /**
       * Balance is too low.
       **/
      BalanceTooLow: AugmentedError<ApiType>;
      /**
       * Deposit result is not expected
       **/
      DepositFailed: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    authorized: {
      /**
       * The market unexpectedly has the incorrect dispute mechanism.
       **/
      MarketDoesNotHaveDisputeMechanismAuthorized: AugmentedError<ApiType>;
      /**
       * An account attempts to submit a report to an undisputed market.
       **/
      MarketIsNotDisputed: AugmentedError<ApiType>;
      /**
       * An unauthorized account attempts to submit a report.
       **/
      NotAuthorizedForThisMarket: AugmentedError<ApiType>;
      /**
       * The report does not match the market's type.
       **/
      OutcomeMismatch: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    balances: {
      /**
       * Beneficiary account must pre-exist
       **/
      DeadAccount: AugmentedError<ApiType>;
      /**
       * Value too low to create account due to existential deposit
       **/
      ExistentialDeposit: AugmentedError<ApiType>;
      /**
       * A vesting schedule already exists for this account
       **/
      ExistingVestingSchedule: AugmentedError<ApiType>;
      /**
       * Balance too low to send value
       **/
      InsufficientBalance: AugmentedError<ApiType>;
      /**
       * Transfer/payment would kill account
       **/
      KeepAlive: AugmentedError<ApiType>;
      /**
       * Account liquidity restrictions prevent withdrawal
       **/
      LiquidityRestrictions: AugmentedError<ApiType>;
      /**
       * Number of named reserves exceed MaxReserves
       **/
      TooManyReserves: AugmentedError<ApiType>;
      /**
       * Vesting balance too high to send value
       **/
      VestingBalance: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    council: {
      /**
       * Members are already initialized!
       **/
      AlreadyInitialized: AugmentedError<ApiType>;
      /**
       * Duplicate proposals not allowed
       **/
      DuplicateProposal: AugmentedError<ApiType>;
      /**
       * Duplicate vote ignored
       **/
      DuplicateVote: AugmentedError<ApiType>;
      /**
       * Account is not a member
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Proposal must exist
       **/
      ProposalMissing: AugmentedError<ApiType>;
      /**
       * The close call was made too early, before the end of the voting.
       **/
      TooEarly: AugmentedError<ApiType>;
      /**
       * There can only be a maximum of `MaxProposals` active proposals.
       **/
      TooManyProposals: AugmentedError<ApiType>;
      /**
       * Mismatched index
       **/
      WrongIndex: AugmentedError<ApiType>;
      /**
       * The given length bound for the proposal was too low.
       **/
      WrongProposalLength: AugmentedError<ApiType>;
      /**
       * The given weight bound for the proposal was too low.
       **/
      WrongProposalWeight: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    councilMembership: {
      /**
       * Already a member.
       **/
      AlreadyMember: AugmentedError<ApiType>;
      /**
       * Not a member.
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    court: {
      /**
       * It is not possible to insert a Juror that is already stored
       **/
      JurorAlreadyExists: AugmentedError<ApiType>;
      /**
       * An account id does not exist on the jurors storage.
       **/
      JurorDoesNotExists: AugmentedError<ApiType>;
      /**
       * On dispute or resolution, someone tried to pass a non-court market type
       **/
      MarketDoesNotHaveCourtMechanism: AugmentedError<ApiType>;
      /**
       * No-one voted on an outcome to resolve a market
       **/
      NoVotes: AugmentedError<ApiType>;
      /**
       * Forbids voting of unknown accounts
       **/
      OnlyJurorsCanVote: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    democracy: {
      /**
       * Cannot cancel the same proposal twice
       **/
      AlreadyCanceled: AugmentedError<ApiType>;
      /**
       * The account is already delegating.
       **/
      AlreadyDelegating: AugmentedError<ApiType>;
      /**
       * Identity may not veto a proposal twice
       **/
      AlreadyVetoed: AugmentedError<ApiType>;
      /**
       * Preimage already noted
       **/
      DuplicatePreimage: AugmentedError<ApiType>;
      /**
       * Proposal already made
       **/
      DuplicateProposal: AugmentedError<ApiType>;
      /**
       * Imminent
       **/
      Imminent: AugmentedError<ApiType>;
      /**
       * The instant referendum origin is currently disallowed.
       **/
      InstantNotAllowed: AugmentedError<ApiType>;
      /**
       * Too high a balance was provided that the account cannot afford.
       **/
      InsufficientFunds: AugmentedError<ApiType>;
      /**
       * Invalid hash
       **/
      InvalidHash: AugmentedError<ApiType>;
      /**
       * Maximum number of votes reached.
       **/
      MaxVotesReached: AugmentedError<ApiType>;
      /**
       * No proposals waiting
       **/
      NoneWaiting: AugmentedError<ApiType>;
      /**
       * Delegation to oneself makes no sense.
       **/
      Nonsense: AugmentedError<ApiType>;
      /**
       * The actor has no permission to conduct the action.
       **/
      NoPermission: AugmentedError<ApiType>;
      /**
       * No external proposal
       **/
      NoProposal: AugmentedError<ApiType>;
      /**
       * The account is not currently delegating.
       **/
      NotDelegating: AugmentedError<ApiType>;
      /**
       * Not imminent
       **/
      NotImminent: AugmentedError<ApiType>;
      /**
       * Next external proposal not simple majority
       **/
      NotSimpleMajority: AugmentedError<ApiType>;
      /**
       * The given account did not vote on the referendum.
       **/
      NotVoter: AugmentedError<ApiType>;
      /**
       * Invalid preimage
       **/
      PreimageInvalid: AugmentedError<ApiType>;
      /**
       * Preimage not found
       **/
      PreimageMissing: AugmentedError<ApiType>;
      /**
       * Proposal still blacklisted
       **/
      ProposalBlacklisted: AugmentedError<ApiType>;
      /**
       * Proposal does not exist
       **/
      ProposalMissing: AugmentedError<ApiType>;
      /**
       * Vote given for invalid referendum
       **/
      ReferendumInvalid: AugmentedError<ApiType>;
      /**
       * Too early
       **/
      TooEarly: AugmentedError<ApiType>;
      /**
       * Maximum number of proposals reached.
       **/
      TooManyProposals: AugmentedError<ApiType>;
      /**
       * Value too low
       **/
      ValueLow: AugmentedError<ApiType>;
      /**
       * The account currently has votes attached to it and the operation cannot succeed until
       * these are removed, either through `unvote` or `reap_vote`.
       **/
      VotesExist: AugmentedError<ApiType>;
      /**
       * Invalid upper bound.
       **/
      WrongUpperBound: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    grandpa: {
      /**
       * Attempt to signal GRANDPA change with one already pending.
       **/
      ChangePending: AugmentedError<ApiType>;
      /**
       * A given equivocation report is valid but already previously reported.
       **/
      DuplicateOffenceReport: AugmentedError<ApiType>;
      /**
       * An equivocation proof provided as part of an equivocation report is invalid.
       **/
      InvalidEquivocationProof: AugmentedError<ApiType>;
      /**
       * A key ownership proof provided as part of an equivocation report is invalid.
       **/
      InvalidKeyOwnershipProof: AugmentedError<ApiType>;
      /**
       * Attempt to signal GRANDPA pause when the authority set isn't live
       * (either paused or already pending pause).
       **/
      PauseFailed: AugmentedError<ApiType>;
      /**
       * Attempt to signal GRANDPA resume when the authority set isn't paused
       * (either live or already pending resume).
       **/
      ResumeFailed: AugmentedError<ApiType>;
      /**
       * Cannot signal forced change so soon after last.
       **/
      TooSoon: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    identity: {
      /**
       * Account ID is already named.
       **/
      AlreadyClaimed: AugmentedError<ApiType>;
      /**
       * Empty index.
       **/
      EmptyIndex: AugmentedError<ApiType>;
      /**
       * Fee is changed.
       **/
      FeeChanged: AugmentedError<ApiType>;
      /**
       * The index is invalid.
       **/
      InvalidIndex: AugmentedError<ApiType>;
      /**
       * Invalid judgement.
       **/
      InvalidJudgement: AugmentedError<ApiType>;
      /**
       * The target is invalid.
       **/
      InvalidTarget: AugmentedError<ApiType>;
      /**
       * Judgement given.
       **/
      JudgementGiven: AugmentedError<ApiType>;
      /**
       * No identity found.
       **/
      NoIdentity: AugmentedError<ApiType>;
      /**
       * Account isn't found.
       **/
      NotFound: AugmentedError<ApiType>;
      /**
       * Account isn't named.
       **/
      NotNamed: AugmentedError<ApiType>;
      /**
       * Sub-account isn't owned by sender.
       **/
      NotOwned: AugmentedError<ApiType>;
      /**
       * Sender is not a sub-account.
       **/
      NotSub: AugmentedError<ApiType>;
      /**
       * Sticky judgement.
       **/
      StickyJudgement: AugmentedError<ApiType>;
      /**
       * Too many additional fields.
       **/
      TooManyFields: AugmentedError<ApiType>;
      /**
       * Maximum amount of registrars reached. Cannot add any more.
       **/
      TooManyRegistrars: AugmentedError<ApiType>;
      /**
       * Too many subs-accounts.
       **/
      TooManySubAccounts: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    liquidityMining: {
      /**
       * Pallet account does not have enough funds
       **/
      FundDoesNotHaveEnoughBalance: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    marketCommons: {
      /**
       * A market with the provided ID does not exist.
       **/
      MarketDoesNotExist: AugmentedError<ApiType>;
      /**
       * Market does not have an stored associated pool id.
       **/
      MarketPoolDoesNotExist: AugmentedError<ApiType>;
      /**
       * It is not possible to fetch the latest market ID when
       * no market has been created.
       **/
      NoMarketHasBeenCreated: AugmentedError<ApiType>;
      /**
       * Market does not have a report
       **/
      NoReport: AugmentedError<ApiType>;
      /**
       * There's a pool registered for this market already.
       **/
      PoolAlreadyExists: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    multiSig: {
      /**
       * Call is already approved by this signatory.
       **/
      AlreadyApproved: AugmentedError<ApiType>;
      /**
       * The data to be stored is already stored.
       **/
      AlreadyStored: AugmentedError<ApiType>;
      /**
       * The maximum weight information provided was too low.
       **/
      MaxWeightTooLow: AugmentedError<ApiType>;
      /**
       * Threshold must be 2 or greater.
       **/
      MinimumThreshold: AugmentedError<ApiType>;
      /**
       * Call doesn't need any (more) approvals.
       **/
      NoApprovalsNeeded: AugmentedError<ApiType>;
      /**
       * Multisig operation not found when attempting to cancel.
       **/
      NotFound: AugmentedError<ApiType>;
      /**
       * No timepoint was given, yet the multisig operation is already underway.
       **/
      NoTimepoint: AugmentedError<ApiType>;
      /**
       * Only the account that originally created the multisig is able to cancel it.
       **/
      NotOwner: AugmentedError<ApiType>;
      /**
       * The sender was contained in the other signatories; it shouldn't be.
       **/
      SenderInSignatories: AugmentedError<ApiType>;
      /**
       * The signatories were provided out of order; they should be ordered.
       **/
      SignatoriesOutOfOrder: AugmentedError<ApiType>;
      /**
       * There are too few signatories in the list.
       **/
      TooFewSignatories: AugmentedError<ApiType>;
      /**
       * There are too many signatories in the list.
       **/
      TooManySignatories: AugmentedError<ApiType>;
      /**
       * A timepoint was given, yet no multisig operation is underway.
       **/
      UnexpectedTimepoint: AugmentedError<ApiType>;
      /**
       * A different timepoint was given to the multisig operation that is underway.
       **/
      WrongTimepoint: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    predictionMarkets: {
      /**
       * Someone is trying to call `dispute` with the same outcome that is currently
       * registered on-chain.
       **/
      CannotDisputeSameOutcome: AugmentedError<ApiType>;
      /**
       * Market account does not have enough funds to pay out.
       **/
      InsufficientFundsInMarketAccount: AugmentedError<ApiType>;
      /**
       * Sender does not have enough share balance.
       **/
      InsufficientShareBalance: AugmentedError<ApiType>;
      /**
       * Market period is faulty (too short, outside of limits)
       **/
      InvalidMarketPeriod: AugmentedError<ApiType>;
      /**
       * Catch-all error for invalid market status
       **/
      InvalidMarketStatus: AugmentedError<ApiType>;
      /**
       * An invalid market type was found.
       **/
      InvalidMarketType: AugmentedError<ApiType>;
      /**
       * An invalid Hash was included in a multihash parameter.
       **/
      InvalidMultihash: AugmentedError<ApiType>;
      /**
       * The outcome range of the scalar market is invalid.
       **/
      InvalidOutcomeRange: AugmentedError<ApiType>;
      /**
       * An operation is requested that is unsupported for the given scoring rule.
       **/
      InvalidScoringRule: AugmentedError<ApiType>;
      /**
       * Market is already reported on.
       **/
      MarketAlreadyReported: AugmentedError<ApiType>;
      /**
       * Market was expected to be active.
       **/
      MarketIsNotActive: AugmentedError<ApiType>;
      /**
       * Market was expected to be closed.
       **/
      MarketIsNotClosed: AugmentedError<ApiType>;
      /**
       * A market in subsidy collection phase was expected.
       **/
      MarketIsNotCollectingSubsidy: AugmentedError<ApiType>;
      /**
       * A proposed market was expected.
       **/
      MarketIsNotProposed: AugmentedError<ApiType>;
      /**
       * A reported market was expected.
       **/
      MarketIsNotReported: AugmentedError<ApiType>;
      /**
       * A resolved market was expected.
       **/
      MarketIsNotResolved: AugmentedError<ApiType>;
      /**
       * The point in time when the market becomes active is too late.
       **/
      MarketStartTooLate: AugmentedError<ApiType>;
      /**
       * The point in time when the market becomes active is too soon.
       **/
      MarketStartTooSoon: AugmentedError<ApiType>;
      /**
       * The maximum number of disputes has been reached.
       **/
      MaxDisputesReached: AugmentedError<ApiType>;
      /**
       * Sender does not have enough balance to buy shares.
       **/
      NotEnoughBalance: AugmentedError<ApiType>;
      /**
       * The number of categories for a categorical market is too low.
       **/
      NotEnoughCategories: AugmentedError<ApiType>;
      /**
       * The user has no winning balance.
       **/
      NoWinningBalance: AugmentedError<ApiType>;
      /**
       * Submitted outcome does not match market type.
       **/
      OutcomeMismatch: AugmentedError<ApiType>;
      /**
       * The report is not coming from designated oracle.
       **/
      ReporterNotOracle: AugmentedError<ApiType>;
      /**
       * It was tried to append an item to storage beyond the boundaries.
       **/
      StorageOverflow: AugmentedError<ApiType>;
      /**
       * Too many categories for a categorical market.
       **/
      TooManyCategories: AugmentedError<ApiType>;
      /**
       * An amount was illegally specified as zero.
       **/
      ZeroAmount: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    preimage: {
      /**
       * Preimage has already been noted on-chain.
       **/
      AlreadyNoted: AugmentedError<ApiType>;
      /**
       * The user is not authorized to perform this action.
       **/
      NotAuthorized: AugmentedError<ApiType>;
      /**
       * The preimage cannot be removed since it has not yet been noted.
       **/
      NotNoted: AugmentedError<ApiType>;
      /**
       * The preimage request cannot be removed since no outstanding requests exist.
       **/
      NotRequested: AugmentedError<ApiType>;
      /**
       * A preimage may not be removed when there are outstanding requests.
       **/
      Requested: AugmentedError<ApiType>;
      /**
       * Preimage is too large to store on-chain.
       **/
      TooLarge: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    proxy: {
      /**
       * Account is already a proxy.
       **/
      Duplicate: AugmentedError<ApiType>;
      /**
       * Call may not be made by proxy because it may escalate its privileges.
       **/
      NoPermission: AugmentedError<ApiType>;
      /**
       * Cannot add self as proxy.
       **/
      NoSelfProxy: AugmentedError<ApiType>;
      /**
       * Proxy registration not found.
       **/
      NotFound: AugmentedError<ApiType>;
      /**
       * Sender is not a proxy of the account to be proxied.
       **/
      NotProxy: AugmentedError<ApiType>;
      /**
       * There are too many proxies registered or too many announcements pending.
       **/
      TooMany: AugmentedError<ApiType>;
      /**
       * Announcement, if made at all, was made too recently.
       **/
      Unannounced: AugmentedError<ApiType>;
      /**
       * A call which is incompatible with the proxy type's filter was attempted.
       **/
      Unproxyable: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    rikiddoSigmoidFeeMarketEma: {
      /**
       * Conversion between the `Balance` and the internal Rikiddo core type failed.
       **/
      FixedConversionImpossible: AugmentedError<ApiType>;
      /**
       * Trying to create a Rikiddo instance for a `poolid` that already has a Rikiddo instance.
       **/
      RikiddoAlreadyExistsForPool: AugmentedError<ApiType>;
      /**
       * For a given `poolid`, no Rikiddo instance could be found.
       **/
      RikiddoNotFoundForPool: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    scheduler: {
      /**
       * Failed to schedule a call
       **/
      FailedToSchedule: AugmentedError<ApiType>;
      /**
       * Cannot find the scheduled call.
       **/
      NotFound: AugmentedError<ApiType>;
      /**
       * Reschedule failed because it does not change scheduled time.
       **/
      RescheduleNoChange: AugmentedError<ApiType>;
      /**
       * Given target block number is in the past.
       **/
      TargetBlockNumberInPast: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    simpleDisputes: {
      /**
       * 1. Any resolution must either have a `Disputed` or `Reported` market status
       * 2. If status is `Disputed`, then at least one dispute must exist
       **/
      InvalidMarketStatus: AugmentedError<ApiType>;
      /**
       * On dispute or resolution, someone tried to pass a non-simple-disputes market type
       **/
      MarketDoesNotHaveSimpleDisputesMechanism: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    sudo: {
      /**
       * Sender must be the Sudo account
       **/
      RequireSudo: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    swaps: {
      /**
       * The weight of an asset in a CPMM swap pool is greather than the upper weight cap.
       **/
      AboveMaximumWeight: AugmentedError<ApiType>;
      /**
       * The weight of an asset in a CPMM swap pool could not be found.
       **/
      AssetNotBound: AugmentedError<ApiType>;
      /**
       * The asset in question could not be found within the pool.
       **/
      AssetNotInPool: AugmentedError<ApiType>;
      /**
       * The spot price of an asset pair was greater than the specified limit.
       **/
      BadLimitPrice: AugmentedError<ApiType>;
      /**
       * The base asset of the swaps pool was None although a value was expected.
       **/
      BaseAssetNotFound: AugmentedError<ApiType>;
      /**
       * The weight of an asset in a CPMM swap pool is lower than the upper weight cap.
       **/
      BelowMinimumWeight: AugmentedError<ApiType>;
      /**
       * Some funds could not be transferred due to a too low balance.
       **/
      InsufficientBalance: AugmentedError<ApiType>;
      /**
       * Liquidity provided to new Balancer pool is less than `MinLiquidity`.
       **/
      InsufficientLiquidity: AugmentedError<ApiType>;
      /**
       * The market was not started since the subsidy goal was not reached.
       **/
      InsufficientSubsidy: AugmentedError<ApiType>;
      /**
       * Could not create CPMM pool since no amount was specified.
       **/
      InvalidAmountArgument: AugmentedError<ApiType>;
      /**
       * Could not create CPMM pool since no fee was supplied.
       **/
      InvalidFeeArgument: AugmentedError<ApiType>;
      /**
       * Dispatch called on pool with invalid status.
       **/
      InvalidPoolStatus: AugmentedError<ApiType>;
      /**
       * A function that is only valid for pools with specific scoring rules was called for a
       * pool with another scoring rule.
       **/
      InvalidScoringRule: AugmentedError<ApiType>;
      /**
       * A function was called for a swaps pool that does not fulfill the state requirement.
       **/
      InvalidStateTransition: AugmentedError<ApiType>;
      /**
       * Subsidy amount is too small.
       **/
      InvalidSubsidyAmount: AugmentedError<ApiType>;
      /**
       * Could not create CPMM pool since no weights were supplied.
       **/
      InvalidWeightArgument: AugmentedError<ApiType>;
      /**
       * A transferal of funds into a swaps pool was above a threshhold specified by the sender.
       **/
      LimitIn: AugmentedError<ApiType>;
      /**
       * No limit was specified for a swap.
       **/
      LimitMissing: AugmentedError<ApiType>;
      /**
       * A transferal of funds out of a swaps pool was below a threshhold specified by the
       * receiver.
       **/
      LimitOut: AugmentedError<ApiType>;
      /**
       * The custom math library yielded an invalid result (most times unexpected zero value).
       **/
      MathApproximation: AugmentedError<ApiType>;
      /**
       * The proportion of an asset added into a pool in comparison to the amount
       * of that asset in the pool is above the threshhold specified by a constant.
       **/
      MaxInRatio: AugmentedError<ApiType>;
      /**
       * The proportion of an asset taken from a pool in comparison to the amount
       * of that asset in the pool is above the threshhold specified by a constant.
       **/
      MaxOutRatio: AugmentedError<ApiType>;
      /**
       * The total weight of all assets within a CPMM pool is above a treshhold specified
       * by a constant.
       **/
      MaxTotalWeight: AugmentedError<ApiType>;
      /**
       * It was tried to remove subsidy from a pool which does not have subsidy provided by
       * the address that tried to remove the subsidy.
       **/
      NoSubsidyProvided: AugmentedError<ApiType>;
      /**
       * The pool in question does not exist.
       **/
      PoolDoesNotExist: AugmentedError<ApiType>;
      /**
       * The pool in question is inactive.
       **/
      PoolIsNotActive: AugmentedError<ApiType>;
      /**
       * The CPMM pool in question does not have a fee, although it should.
       **/
      PoolMissingFee: AugmentedError<ApiType>;
      /**
       * The Rikiddo pool in question does not have subsidy, although it should.
       **/
      PoolMissingSubsidy: AugmentedError<ApiType>;
      /**
       * The CPPM pool in question does not have weights, although it should.
       **/
      PoolMissingWeight: AugmentedError<ApiType>;
      /**
       * Two vectors do not have the same length (usually CPMM pool assets and weights).
       **/
      ProvidedValuesLenMustEqualAssetsLen: AugmentedError<ApiType>;
      /**
       * Tried to create a pool with at least two identical assets.
       **/
      SomeIdenticalAssets: AugmentedError<ApiType>;
      /**
       * No swap fee information found for CPMM pool
       **/
      SwapFeeMissing: AugmentedError<ApiType>;
      /**
       * The swap fee is higher than the allowed maximum.
       **/
      SwapFeeTooHigh: AugmentedError<ApiType>;
      /**
       * Tried to create a pool that has less assets than the lower threshhold specified by
       * a constant.
       **/
      TooFewAssets: AugmentedError<ApiType>;
      /**
       * Tried to create a pool that has more assets than the upper threshhold specified by
       * a constant.
       **/
      TooManyAssets: AugmentedError<ApiType>;
      /**
       * The pool does not support swapping the assets in question.
       **/
      UnsupportedTrade: AugmentedError<ApiType>;
      /**
       * The outcome asset specified as the winning asset was not found in the pool.
       **/
      WinningAssetNotFound: AugmentedError<ApiType>;
      /**
       * Some amount in a transaction equals zero.
       **/
      ZeroAmount: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    system: {
      /**
       * The origin filter prevent the call to be dispatched.
       **/
      CallFiltered: AugmentedError<ApiType>;
      /**
       * Failed to extract the runtime version from the new runtime.
       * 
       * Either calling `Core_version` or decoding `RuntimeVersion` failed.
       **/
      FailedToExtractRuntimeVersion: AugmentedError<ApiType>;
      /**
       * The name of specification does not match between the current runtime
       * and the new runtime.
       **/
      InvalidSpecName: AugmentedError<ApiType>;
      /**
       * Suicide called when the account has non-default composite data.
       **/
      NonDefaultComposite: AugmentedError<ApiType>;
      /**
       * There is a non-zero reference count preventing the account from being purged.
       **/
      NonZeroRefCount: AugmentedError<ApiType>;
      /**
       * The specification version is not allowed to decrease between the current runtime
       * and the new runtime.
       **/
      SpecVersionNeedsToIncrease: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    technicalCommittee: {
      /**
       * Members are already initialized!
       **/
      AlreadyInitialized: AugmentedError<ApiType>;
      /**
       * Duplicate proposals not allowed
       **/
      DuplicateProposal: AugmentedError<ApiType>;
      /**
       * Duplicate vote ignored
       **/
      DuplicateVote: AugmentedError<ApiType>;
      /**
       * Account is not a member
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Proposal must exist
       **/
      ProposalMissing: AugmentedError<ApiType>;
      /**
       * The close call was made too early, before the end of the voting.
       **/
      TooEarly: AugmentedError<ApiType>;
      /**
       * There can only be a maximum of `MaxProposals` active proposals.
       **/
      TooManyProposals: AugmentedError<ApiType>;
      /**
       * Mismatched index
       **/
      WrongIndex: AugmentedError<ApiType>;
      /**
       * The given length bound for the proposal was too low.
       **/
      WrongProposalLength: AugmentedError<ApiType>;
      /**
       * The given weight bound for the proposal was too low.
       **/
      WrongProposalWeight: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    technicalCommitteeMembership: {
      /**
       * Already a member.
       **/
      AlreadyMember: AugmentedError<ApiType>;
      /**
       * Not a member.
       **/
      NotMember: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    tokens: {
      /**
       * Cannot convert Amount into Balance type
       **/
      AmountIntoBalanceFailed: AugmentedError<ApiType>;
      /**
       * The balance is too low
       **/
      BalanceTooLow: AugmentedError<ApiType>;
      /**
       * Beneficiary account must pre-exist
       **/
      DeadAccount: AugmentedError<ApiType>;
      /**
       * Value too low to create account due to existential deposit
       **/
      ExistentialDeposit: AugmentedError<ApiType>;
      /**
       * Transfer/payment would kill account
       **/
      KeepAlive: AugmentedError<ApiType>;
      /**
       * Failed because liquidity restrictions due to locking
       **/
      LiquidityRestrictions: AugmentedError<ApiType>;
      /**
       * Failed because the maximum locks was exceeded
       **/
      MaxLocksExceeded: AugmentedError<ApiType>;
      TooManyReserves: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    treasury: {
      /**
       * Proposer's balance is too low.
       **/
      InsufficientProposersBalance: AugmentedError<ApiType>;
      /**
       * No proposal or bounty at that index.
       **/
      InvalidIndex: AugmentedError<ApiType>;
      /**
       * Too many approvals in the queue.
       **/
      TooManyApprovals: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    utility: {
      /**
       * Too many calls batched.
       **/
      TooManyCalls: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
    vesting: {
      /**
       * Amount being transferred is too low to create a vesting schedule.
       **/
      AmountLow: AugmentedError<ApiType>;
      /**
       * The account already has `MaxVestingSchedules` count of schedules and thus
       * cannot add another one. Consider merging existing schedules in order to add another.
       **/
      AtMaxVestingSchedules: AugmentedError<ApiType>;
      /**
       * Failed to create a new schedule because some parameter was invalid.
       **/
      InvalidScheduleParams: AugmentedError<ApiType>;
      /**
       * The account given is not vesting.
       **/
      NotVesting: AugmentedError<ApiType>;
      /**
       * An index was out of bounds of the vesting schedules.
       **/
      ScheduleIndexOutOfBounds: AugmentedError<ApiType>;
      /**
       * Generic error
       **/
      [key: string]: AugmentedError<ApiType>;
    };
  } // AugmentedErrors
} // declare module
