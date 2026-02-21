import type { FreeDeliveryConfig } from '@/types/config';
import type { DeliveryType } from '@/generated/prisma';

/**
 * Delivery Service
 * All delivery-related business logic
 * Eliminates duplication from orderHelpers, orderStore, and OrderSummary
 */

// Helper - gets day name from date
function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Pure - checks if delivery is available for a given address and date
export function isDeliveryAvailable(
  deliveryDate: Date,
  city: string,
  freeDeliveryConfig: FreeDeliveryConfig
): boolean {
  const dayName = getDayName(deliveryDate);
  const eligibleCities = freeDeliveryConfig[dayName] || [];

  return eligibleCities.some((eligibleCity) =>
    city.toLowerCase().includes(eligibleCity.toLowerCase())
  );
}

// Pure - checks if order is eligible for free delivery
export function isFreeDeliveryEligible(
  deliveryDate: Date | string,
  city: string,
  deliveryType: DeliveryType,
  freeDeliveryConfig: FreeDeliveryConfig
): boolean {
  // Pickup orders are never eligible for free delivery
  if (deliveryType !== 'DELIVERY') {
    return false;
  }

  // Convert string date to Date object if needed
  const date = typeof deliveryDate === 'string' ? new Date(deliveryDate) : deliveryDate;

  return isDeliveryAvailable(date, city, freeDeliveryConfig);
}

// Pure - gets next N available delivery dates for a city
export function getNextAvailableDeliveryDates(
  city: string,
  freeDeliveryConfig: FreeDeliveryConfig,
  count: number = 10
): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date();
  const checkDate = new Date(currentDate);

  while (dates.length < count) {
    if (isDeliveryAvailable(checkDate, city, freeDeliveryConfig)) {
      dates.push(new Date(checkDate));
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return dates;
}
