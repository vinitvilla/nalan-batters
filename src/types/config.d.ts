export interface Config {
  additionalCharges?: {
    taxPercent?: { percent?: number; waive?: boolean };
    convenienceCharge?: { amount?: number; waive?: boolean };
    deliveryCharge?: { amount?: number; waive?: boolean };
  };
  freeDelivery?: Record<string, string[]>;
}
