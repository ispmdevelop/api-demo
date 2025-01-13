import crypto from 'crypto';

export function generateUUID(length: number) {
  return crypto.randomBytes(length / 2).toString('hex');
}
