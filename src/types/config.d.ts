export interface Config {
  additionalCharges?: {
    taxPercent?: { percent?: number; waive?: boolean };
    convenienceCharge?: { amount?: number; waive?: boolean };
    deliveryCharge?: { amount?: number; waive?: boolean };
  };
  freeDelivery?: Record<string, string[]>;
}

// Parsed config types for services
export interface ChargeConfig {
  taxPercent: { percent: number; waive: boolean };
  convenienceCharge: { amount: number; waive: boolean };
  deliveryCharge: { amount: number; waive: boolean };
}

export interface FreeDeliveryConfig {
  [dayName: string]: string[]; // e.g., "Monday": ["Toronto", "Mississauga"]
}
