/**
 * @module utils/scval
 * Argument conversion helpers: TypeScript → Soroban `xdr.ScVal`.
 *
 * Every contract call has to marshal JavaScript values into Soroban's XDR
 * value type. These helpers are the single place that conversion happens for
 * call arguments, so the module implementations never duplicate it and never
 * let the underlying Stellar SDK raise its own opaque error.
 *
 * Depends on the `@stellar/stellar-sdk` peer dependency (>=12.3.0) restored
 * for the rebuild in issue #574.
 */
import { Address, nativeToScVal, StrKey, xdr } from '@stellar/stellar-sdk';

/**
 * Error thrown when an address passed to {@link addressToScVal} is not a
 * valid Stellar account (G…) or contract (C…) strkey.
 *
 * Carrying a stable {@link code} lets callers branch on the failure without
 * string-matching, mirroring the pattern the SDK's `VeriTixError` will
 * introduce for the wider error surface (issues #585/#586).
 */
export class InvalidAddressError extends Error {
  /** Stable machine-readable discriminator for this error class */
  public readonly code = 'INVALID_ADDRESS';
  /** The offending address string */
  public readonly address: string;

  constructor(address: string, message?: string) {
    super(message ?? `addressToScVal: invalid Stellar address — expected a G… account or C… contract strkey, got "${address}"`);
    this.name = 'InvalidAddressError';
    this.address = address;
    // Maintain the correct prototype chain in environments that transpile classes
    Object.setPrototypeOf(this, InvalidAddressError.prototype);
  }
}

/**
 * Converts a Stellar account (G…) or contract (C…) address to an `ScVal` of
 * type `Address`.
 *
 * @param address - A valid Stellar account or contract address (strkey).
 * @throws {InvalidAddressError} if the address is not a valid strkey —
 *   validated here instead of letting the Stellar SDK throw its own error.
 */
export function addressToScVal(address: string): xdr.ScVal {
  if (!isValidAddressStrkey(address)) {
    throw new InvalidAddressError(address);
  }
  return new Address(address).toScVal();
}

/**
 * Converts a `bigint` to an `ScVal` of the requested numeric type.
 *
 * @param value - The integer value.
 * @param type  - `"i128"` for signed 128-bit, `"u64"` for unsigned 64-bit.
 * @throws {TypeError} if `value` is not a `bigint`.
 */
export function bigintToScVal(value: bigint, type: 'i128' | 'u64'): xdr.ScVal {
  if (typeof value !== 'bigint') {
    throw new TypeError('bigintToScVal: value must be a bigint');
  }
  return nativeToScVal(value, { type });
}

/**
 * Converts a `boolean` to an `ScVal` of type `Bool`.
 *
 * @throws {TypeError} if `value` is not a boolean.
 */
export function boolToScVal(value: boolean): xdr.ScVal {
  if (typeof value !== 'boolean') {
    throw new TypeError('boolToScVal: value must be a boolean');
  }
  return xdr.ScVal.scvBool(value);
}

/**
 * Converts a UTF-8 `string` to an `ScVal` of type `String`.
 *
 * @throws {TypeError} if `value` is not a string.
 */
export function stringToScVal(value: string): xdr.ScVal {
  if (typeof value !== 'string') {
    throw new TypeError('stringToScVal: value must be a string');
  }
  return xdr.ScVal.scvString(value);
}

/**
 * Returns whether `address` is a valid Stellar account (G…) or contract (C…)
 * strkey. Kept internal to this module; the standalone public
 * `isValidStellarAddress` helper is scoped to issue #598.
 */
function isValidAddressStrkey(address: string): boolean {
  if (typeof address !== 'string') return false;
  return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address);
}