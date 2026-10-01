import crypto from 'crypto';

/**
 * Generates a human-readable, collision-resistant unique order number.
 * Example format: MKH-20260930-1001
 * Follows the pattern: MKH-YYYYMMDD-XXXX (where XXXX is a unique random 4-digit code)
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate 4-digit random number between 1000 and 9999
  const randomSuffix = crypto.randomInt(1000, 9999).toString();
  return `MKH-${datePart}-${randomSuffix}`;
}

export default generateOrderNumber;
