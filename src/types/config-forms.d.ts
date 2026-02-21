// Ambient global declarations for config form value types.
// No import/export — types are globally available without any import statement.

interface AdditionalChargesConfig {
  taxPercent?: { percent?: number; waive?: boolean };
  convenienceCharge?: { amount?: number; waive?: boolean };
  deliveryCharge?: { amount?: number; waive?: boolean };
}

interface OperatingHoursConfig {
  Monday?: { start: string; end: string; closed: boolean };
  Tuesday?: { start: string; end: string; closed: boolean };
  Wednesday?: { start: string; end: string; closed: boolean };
  Thursday?: { start: string; end: string; closed: boolean };
  Friday?: { start: string; end: string; closed: boolean };
  Saturday?: { start: string; end: string; closed: boolean };
  Sunday?: { start: string; end: string; closed: boolean };
}

interface FreeDeliveryFormConfig {
  Monday?: string[];
  Tuesday?: string[];
  Wednesday?: string[];
  Thursday?: string[];
  Friday?: string[];
  Saturday?: string[];
  Sunday?: string[];
}
