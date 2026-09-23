/**
 * @module types
 * Parameters for every VeriTix write operation.
 *
 * The write methods on the module classes accept a single named-parameter
 * object instead of positional arguments, so multi-field calls cannot be
 * transposed by accident at the call site. On-chain amounts and ids are
 * expressed as `bigint` — never `number` — to preserve 128-bit precision.
 *
 * The shared record and config shapes these operations read and produce
 * (e.g. {@link SplitRecipient}) are landed in separate rebuild issues and will
 * be referenced from here once merged; single-use recipient fields below are
 * typed structurally until then.
 */

// ---------------------------------------------------------------------------
// Token module — params for the token write operations
// ---------------------------------------------------------------------------

/** Parameters for {@code mint(to, amount)}. */
export interface MintParams {
  /** Stellar account address that receives the freshly minted tokens */
  to: string;
  /** Token amount to mint (in stroops / smallest denomination) */
  amount: bigint;
}

/** Parameters for {@code transfer(from, to, amount)}. */
export interface TransferParams {
  /** Stellar account address that sends the tokens */
  from: string;
  /** Stellar account address that receives the tokens */
  to: string;
  /** Token amount to transfer (in stroops) */
  amount: bigint;
}

/** Parameters for {@code approve(from, spender, amount, expirationLedger)}. */
export interface ApproveParams {
  /** Stellar account address granting the allowance */
  from: string;
  /** Stellar account address that is allowed to spend */
  spender: string;
  /** Allowance amount (in stroops) */
  amount: bigint;
  /** Ledger sequence number after which the allowance expires */
  expirationLedger: number;
}

/** Parameters for {@code burn(amount)}. */
export interface BurnParams {
  /** Token amount to destroy from the caller's own balance (in stroops) */
  amount: bigint;
}

// ---------------------------------------------------------------------------
// Escrow module — params for createEscrow
// ---------------------------------------------------------------------------

/** Parameters for {@code createEscrow(beneficiary, amount, expiryLedger)}. */
export interface CreateEscrowParams {
  /** Stellar account address of the intended beneficiary */
  beneficiary: string;
  /** Amount to lock in escrow (in stroops) */
  amount: bigint;
  /** Ledger sequence number after which the depositor may reclaim the funds */
  expiryLedger: number;
  /** Optional free-form memo strings to attach to the record */
  memos?: string[];
}

// ---------------------------------------------------------------------------
// Dispute module — params for the dispute write operations
// ---------------------------------------------------------------------------

/** Parameters for {@code openDispute(escrowId, resolver)}. */
export interface OpenDisputeParams {
  /** The escrow ID to raise a dispute on */
  escrowId: bigint;
  /** Stellar account address of the designated resolver / arbitrator */
  resolver: string;
  /** Optional evidence text attached to the dispute */
  evidence?: string;
}

/** Parameters for {@code resolveDispute(disputeId, forBeneficiary)}. */
export interface ResolveDisputeParams {
  /** The dispute ID to resolve */
  disputeId: bigint;
  /** Whether the ruling favours the escrow beneficiary (true) or depositor */
  forBeneficiary: boolean;
  /** Optional free-form note recording the resolution */
  note?: string;
}

// ---------------------------------------------------------------------------
// Split module — params for createSplit
// ---------------------------------------------------------------------------

/**
 * A single recipient entry within a split.
 *
 * Basis points (BPS) are used so that shares sum to exactly 10 000.
 * Typed structurally here so this module compiles independently; it will be
 * replaced by the shared {@code SplitRecipient} type once the rebuild's
 * shared record types (issue #582) are merged.
 */
export interface SplitRecipientParam {
  /** Stellar account address of the recipient */
  address: string;
  /** Share of the total amount in basis points (1 bps = 0.01 %) */
  shareBps: number;
}

/** Parameters for {@code createSplit(recipients, totalAmount)}. */
export interface CreateSplitParams {
  /** Ordered list of recipients with their basis-point shares */
  recipients: SplitRecipientParam[];
  /** Total amount to split (in stroops) */
  totalAmount: bigint;
}

// ---------------------------------------------------------------------------
// Recurring module — params for setupRecurring
// ---------------------------------------------------------------------------

/** Parameters for {@code setupRecurring(payee, amount, interval)}. */
export interface SetupRecurringParams {
  /** Stellar account address of the payee */
  payee: string;
  /** Amount charged per interval (in stroops) */
  amount: bigint;
  /** Charge interval in ledgers (e.g. 17 280 ≈ 1 day at 5 s/ledger) */
  interval: number;
}