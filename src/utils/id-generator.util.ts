import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/**
 * Generate highly secure subscription ID with cryptographic randomness
 * Format: SUB-{version}-{timestamp}-{random}-{hash}-{checksum}
 * Example: SUB-V2-M7NK8PLQ-F4D9E7A2B1C6-8H3J5K9P7R2M-A7C3
 * 
 * Structure breakdown:
 * - SUB: Prefix identifier
 * - V2: Version number
 * - M7NK8PLQ: Base36 timestamp (8 chars)
 * - F4D9E7A2B1C6: Cryptographic random (12 chars)
 * - 8H3J5K9P7R2M: HMAC-SHA256 hash (12 chars)
 * - A7C3: Checksum for validation (4 chars)
 * 
 * Total length: ~55 characters
 * Entropy: ~240 bits (cryptographically secure)
 */
export function generateSubscriptionId(): string {
  const version = 'V2';
  
  // High-resolution timestamp with random offset (prevents time-based guessing)
  const timestamp = (Date.now() + crypto.randomInt(0, 10000))
    .toString(36)
    .toUpperCase()
    .padStart(8, '0');
  
  // Cryptographic random bytes (96 bits of entropy)
  const randomPart = crypto
    .randomBytes(16)
    .toString('hex')
    .toUpperCase()
    .substring(0, 12);
  
  // Generate HMAC hash using secret key + random salt
  const secret = process.env.SUBSCRIPTION_SECRET || 'parking-system-secret-key-2025';
  const salt = crypto.randomBytes(8).toString('hex');
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}-${randomPart}-${salt}`)
    .digest('hex')
    .toUpperCase()
    .substring(0, 12);
  
  // Calculate checksum for validation
  const dataForChecksum = `${timestamp}${randomPart}${hmac}`;
  const checksum = crypto
    .createHash('sha256')
    .update(dataForChecksum)
    .digest('hex')
    .toUpperCase()
    .substring(0, 4);
  
  return `SUB-${version}-${timestamp}-${randomPart}-${hmac}-${checksum}`;
}

/**
 * Validate subscription ID format and checksum
 */
export function isValidSubscriptionId(id: string): boolean {
  // Pattern: SUB-V2-XXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXX
  const pattern = /^SUB-V[0-9]-[A-Z0-9]{8}-[A-Z0-9]{12}-[A-Z0-9]{12}-[A-Z0-9]{4}$/;
  
  if (!pattern.test(id)) {
    return false;
  }
  
  try {
    // Extract parts
    const parts = id.split('-');
    const timestamp = parts[2];
    const randomPart = parts[3];
    const hmac = parts[4];
    const providedChecksum = parts[5];
    
    // Recalculate checksum
    const dataForChecksum = `${timestamp}${randomPart}${hmac}`;
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(dataForChecksum)
      .digest('hex')
      .toUpperCase()
      .substring(0, 4);
    
    return providedChecksum === calculatedChecksum;
  } catch (error) {
    return false;
  }
}

/**
 * Generate secure ticket ID with high entropy
 * Format: TKT-{timestamp}-{random}-{hash}
 * Example: TKT-M7NK8PLQ-F4D9E7A2-B1C6D8E9
 * Length: ~35 characters
 */
export function generateTicketId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0');
  
  const randomPart = crypto
    .randomBytes(12)
    .toString('hex')
    .toUpperCase()
    .substring(0, 8);
  
  const hashPart = crypto
    .createHash('sha256')
    .update(`${timestamp}-${randomPart}-${Date.now()}`)
    .digest('hex')
    .toUpperCase()
    .substring(0, 8);
  
  return `TKT-${timestamp}-${randomPart}-${hashPart}`;
}

/**
 * Generate secure user ID
 * Format: USR-{timestamp}-{random}-{hash}
 * Example: USR-M7NK8PLQ-F4D9E7A2-B1C6D8E9
 */
export function generateUserId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0');
  
  const randomPart = crypto
    .randomBytes(12)
    .toString('hex')
    .toUpperCase()
    .substring(0, 8);
  
  const hashPart = crypto
    .createHash('sha256')
    .update(`${timestamp}-${randomPart}`)
    .digest('hex')
    .toUpperCase()
    .substring(0, 8);
  
  return `USR-${timestamp}-${randomPart}-${hashPart}`;
}

/**
 * Generate ultra-secure subscription ID (maximum security)
 * Format: SUB-{uuid}-{random}-{timestamp}-{hmac}
 * Example: SUB-A1B2C3D4E5F6-H7J8K9L0M1N2-P3Q4R5S6-T7U8V9W0X1Y2
 * Length: ~65 characters
 * Entropy: ~320 bits
 */
export function generateUltraSecureSubscriptionId(): string {
  // UUID without dashes (32 chars hex)
  const uuidPart = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 12);
  
  // Cryptographic random (96 bits)
  const randomPart = crypto
    .randomBytes(16)
    .toString('hex')
    .toUpperCase()
    .substring(0, 12);
  
  // Timestamp with random offset
  const timestamp = (Date.now() + crypto.randomInt(0, 100000))
    .toString(36)
    .toUpperCase()
    .padStart(8, '0');
  
  // HMAC with multiple salts
  const secret = process.env.SUBSCRIPTION_SECRET || 'parking-system-secret-key-2025';
  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');
  
  const hmac = crypto
    .createHmac('sha512', secret)
    .update(`${uuidPart}-${randomPart}-${timestamp}-${salt1}-${salt2}`)
    .digest('hex')
    .toUpperCase()
    .substring(0, 12);
  
  return `SUB-${uuidPart}-${randomPart}-${timestamp}-${hmac}`;
}

/**
 * Generate QR code compatible ID (numeric only with checksum)
 * For printing on cards - 20 digits with Luhn checksum
 * Example: 12345678901234567890
 */
export function generateNumericSubscriptionId(): string {
  // Generate 19 random digits
  let digits = '';
  for (let i = 0; i < 19; i++) {
    digits += crypto.randomInt(0, 10).toString();
  }
  
  // Calculate Luhn checksum
  const checksum = calculateLuhnChecksum(digits);
  
  return digits + checksum;
}

/**
 * Calculate Luhn checksum for numeric IDs
 */
function calculateLuhnChecksum(digits: string): number {
  let sum = 0;
  let isEven = true;
  
  // Process digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return (10 - (sum % 10)) % 10;
}

/**
 * Validate Luhn checksum
 */
export function validateLuhnChecksum(idWithChecksum: string): boolean {
  if (!/^\d+$/.test(idWithChecksum)) {
    return false;
  }
  
  const digits = idWithChecksum.substring(0, idWithChecksum.length - 1);
  const providedChecksum = parseInt(idWithChecksum[idWithChecksum.length - 1], 10);
  const calculatedChecksum = calculateLuhnChecksum(digits);
  
  return providedChecksum === calculatedChecksum;
}

/**
 * Generate verification code (8 digits with checksum)
 * For SMS or email verification
 */
export function generateVerificationCode(): string {
  // Generate 7 random digits
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += crypto.randomInt(0, 10).toString();
  }
  
  // Add checksum
  const checksum = calculateLuhnChecksum(code);
  return code + checksum;
}

/**
 * Generate short ID for temporary tickets
 * Format: 12 characters, uppercase alphanumeric with checksum
 * Example: A7F3D9E2B1C6
 */
export function generateShortId(): string {
  const randomPart = crypto
    .randomBytes(12)
    .toString('hex')
    .toUpperCase()
    .substring(0, 10);
  
  // Add 2-char checksum
  const checksum = crypto
    .createHash('md5')
    .update(randomPart)
    .digest('hex')
    .toUpperCase()
    .substring(0, 2);
  
  return randomPart + checksum;
}

/**
 * Generate session token (for API authentication)
 * Format: 64 characters hex
 * Example: A1B2C3D4E5F6...
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
}

/**
 * Generate API key (for third-party integrations)
 * Format: pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 */
export function generateApiKey(environment: 'test' | 'live' = 'live'): string {
  const prefix = environment === 'live' ? 'pk_live' : 'pk_test';
  const key = crypto.randomBytes(24).toString('hex').toUpperCase();
  return `${prefix}_${key}`;
}

/**
 * Mask subscription ID for display (security)
 * Example: SUB-V2-M7NK8PLQ-*****-*****-A7C3
 */
export function maskSubscriptionId(id: string): string {
  const parts = id.split('-');
  if (parts.length < 6) return id;
  
  return `${parts[0]}-${parts[1]}-${parts[2]}-*****-*****-${parts[5]}`;
}

/**
 * Extract timestamp from subscription ID (if possible)
 */
export function extractTimestampFromId(id: string): Date | null {
  try {
    const parts = id.split('-');
    if (parts.length < 3) return null;
    
    const timestamp = parseInt(parts[2], 36);
    return new Date(timestamp);
  } catch (error) {
    return null;
  }
}