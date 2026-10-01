import crypto from 'crypto';

/**
 * Generate readable unique order numbers.
 * Example format: MKH-2026-XXXXXX
 * (Uses cryptographic random bytes for collision resistance)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MKH-${year}-${randomChars}`;
}
