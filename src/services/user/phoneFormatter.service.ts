/**
 * Phone Formatter Service
 * Handles phone number formatting for US numbers
 */

/**
 * Formats a phone number to include +1 country code
 * @param phone - Phone number to format
 * @returns Formatted phone number with +1 prefix
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.startsWith('+1') ? phone : '+1' + phone.replace(/^\+?1?/, '');
}

/**
 * Formats phone number for display (e.g., +1 123-456-7890)
 * @param phone - Phone number to format
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  // Remove +1 prefix for parsing
  const digits = formatted.replace(/^\+1/, '');

  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return formatted;
}
