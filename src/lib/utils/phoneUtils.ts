/**
 * Phone number utility functions for standardizing phone number formats
 */

/**
 * Formats a phone number to the standard +1XXXXXXXXXX format
 * Handles various input formats:
 * - 416-555-0200
 * - (416) 555-0200
 * - 1234567890
 * - +14165550200
 * - 416 555 0200
 * 
 * @param phone - The phone number in any format
 * @returns Standardized phone number in +1XXXXXXXXXX format or null if invalid
 */
export function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different digit lengths
  if (digits.length === 10) {
    // Assume North American number without country code
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // North American number with country code
    return `+${digits}`;
  } else if (digits.length === 11 && !digits.startsWith('1')) {
    // Invalid 11-digit number (doesn't start with 1)
    return null;
  } else if (digits.length < 10 || digits.length > 11) {
    // Invalid length
    return null;
  }
  
  return null;
}

/**
 * Validates if a phone number is in the correct format
 * @param phone - The phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Check if it matches the +1XXXXXXXXXX pattern
  const phoneRegex = /^\+1\d{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Formats a phone number for display (human-readable format)
 * +14165550200 -> (416) 555-0200
 * @param phone - The standardized phone number
 * @returns Human-readable format or original string if invalid
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone || !isValidPhoneNumber(phone)) return phone;
  
  // Extract digits (remove +1)
  const digits = phone.substring(2);
  const areaCode = digits.substring(0, 3);
  const exchange = digits.substring(3, 6);
  const number = digits.substring(6, 10);
  
  return `(${areaCode}) ${exchange}-${number}`;
}

/**
 * Gets all possible phone number variations for database lookup
 * This helps find users regardless of how their phone was originally stored
 * @param phone - Input phone number
 * @returns Array of possible phone number formats to search for
 */
export function getPhoneVariations(phone: string): string[] {
  const standardized = formatPhoneNumber(phone);
  if (!standardized) return [];
  
  const digits = standardized.substring(2); // Remove +1
  const variations = [
    standardized,           // +14165550200
    digits,                 // 4165550200
    `1${digits}`,          // 14165550200
    `${digits.substring(0,3)}-${digits.substring(3,6)}-${digits.substring(6)}`, // 416-555-0200
    `(${digits.substring(0,3)}) ${digits.substring(3,6)}-${digits.substring(6)}` // (416) 555-0200
  ];
  
  return [...new Set(variations)]; // Remove duplicates
}
