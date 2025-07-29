/**
 * UUID generation utilities
 */

import { randomUUID } from 'crypto';

/**
 * Generate a new UUID v4
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}