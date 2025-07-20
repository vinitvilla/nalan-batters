import moment from 'moment';

// Utility to format a number as currency string
function formatCurrency(value: number | string | undefined, currency: string = "USD") {
    const num = typeof value === "number" ? value : Number(value);
    if (isNaN(num)) return "$0.00";
    return num.toLocaleString("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Utility to format phone numbers to (XXX) XXX-XXXX xEXT (US only, no +1 allowed)
function formatPhoneNumber(phone: string): string {
  // Remove country code if present
  let cleaned = ('' + phone).replace(/\D/g, '');

  // Reject if starts with '1' (US country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.slice(1);
  }

  // Handle extensions (e.g., 1234567890x1234 or 1234567890 ext 1234)
  const extMatch = phone.match(/(?:x|ext\.?|extension)\s*(\d+)/i);
  const extension = extMatch ? extMatch[1] : "";

  // Format main number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    let formatted = `(${match[1]}) ${match[2]}-${match[3]}`;
    if (extension) {
      formatted += ` x${extension}`;
    }
    return formatted;
  }
  return phone;
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(date: string | number | Date | undefined, options?: { dateOnly?: boolean }): string {
    if (!date) return "";
    
    // Use moment.js to parse and format dates
    const m = moment(date);
    
    if (!m.isValid()) return "Invalid date";
    
    // Return date-only or date-time based on options
    if (options?.dateOnly) {
        return m.format('MMM D, YYYY');
    }
    
    // Default: return date with time
    return m.format('MMM D, YYYY h:mm A');
}

// Convenience function for date-only formatting
function formatDateOnly(date: string | number | Date | undefined): string {
    return formatDate(date, { dateOnly: true });
}

function formatAddress(address?: {
    street?: string;
    unit?: string;
    city?: string;
    province?: string;
    country?: string;
    postal?: string;
}): string {
    if (!address) return "";
    return [address.street, address.unit, address.city, address.province, address.country, address.postal]
        .filter(Boolean)
        .join(", ");
}

// Converts camelCase or PascalCase to Title Case (e.g., "userName" -> "User Name")
function camelToTitle(str: string): string {
  if (!str) return "";
  // Insert space before all caps and capitalize first letter
  const result = str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
  return result.trim();
}

// Formats order ID to show only first 8 characters for better readability
function formatOrderId(orderId: string): string {
  if (!orderId) return "";
  return orderId.length > 8 ? `#${orderId.substring(0, 8)}...` : `#${orderId}`;
}


export { formatCurrency, formatPhoneNumber, capitalize, formatDate, formatDateOnly, formatAddress, camelToTitle, formatOrderId };