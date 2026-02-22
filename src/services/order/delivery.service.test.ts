import { describe, it, expect } from 'vitest';
import {
  isDeliveryAvailable,
  isFreeDeliveryEligible,
  getNextAvailableDeliveryDates,
} from './delivery.service';
import type { FreeDeliveryConfig } from '@/types/config';

// Mock config: free delivery on Monday for Scarborough, Wednesday for Toronto
const mockFreeDeliveryConfig: FreeDeliveryConfig = {
  Monday: ['Scarborough', 'Markham'],
  Wednesday: ['Toronto', 'Scarborough'],
  Friday: ['Mississauga'],
};

describe('isDeliveryAvailable', () => {
  it('returns true when city matches a delivery day', () => {
    // Monday = 2026-02-23 (Monday)
    const monday = new Date(2026, 1, 23);
    expect(isDeliveryAvailable(monday, 'Scarborough', mockFreeDeliveryConfig)).toBe(true);
  });

  it('returns false when city does not match delivery day', () => {
    const monday = new Date(2026, 1, 23);
    expect(isDeliveryAvailable(monday, 'Toronto', mockFreeDeliveryConfig)).toBe(false);
  });

  it('returns false when day has no config', () => {
    // Tuesday = 2026-02-24
    const tuesday = new Date(2026, 1, 24);
    expect(isDeliveryAvailable(tuesday, 'Scarborough', mockFreeDeliveryConfig)).toBe(false);
  });

  it('performs case-insensitive city matching', () => {
    const monday = new Date(2026, 1, 23);
    expect(isDeliveryAvailable(monday, 'scarborough', mockFreeDeliveryConfig)).toBe(true);
    expect(isDeliveryAvailable(monday, 'SCARBOROUGH', mockFreeDeliveryConfig)).toBe(true);
  });

  it('matches partial city names (city.includes)', () => {
    const monday = new Date(2026, 1, 23);
    // "East Scarborough" includes "Scarborough"
    expect(isDeliveryAvailable(monday, 'East Scarborough', mockFreeDeliveryConfig)).toBe(true);
  });

  it('returns false when config is empty', () => {
    const monday = new Date(2026, 1, 23);
    expect(isDeliveryAvailable(monday, 'Scarborough', {})).toBe(false);
  });
});

describe('isFreeDeliveryEligible', () => {
  it('returns true for eligible DELIVERY orders', () => {
    const monday = new Date(2026, 1, 23);
    expect(isFreeDeliveryEligible(monday, 'Scarborough', 'DELIVERY', mockFreeDeliveryConfig)).toBe(true);
  });

  it('returns false for PICKUP orders regardless of eligibility', () => {
    const monday = new Date(2026, 1, 23);
    expect(isFreeDeliveryEligible(monday, 'Scarborough', 'PICKUP', mockFreeDeliveryConfig)).toBe(false);
  });

  it('handles string date input', () => {
    // Use T00:00:00 to create a local date (not UTC) — avoids timezone shift
    // 2026-02-23 is a Monday in local time
    expect(isFreeDeliveryEligible('2026-02-23T00:00:00', 'Scarborough', 'DELIVERY', mockFreeDeliveryConfig)).toBe(true);
  });

  it('returns false when city is not in free delivery zone for that day', () => {
    const monday = new Date(2026, 1, 23);
    expect(isFreeDeliveryEligible(monday, 'Mississauga', 'DELIVERY', mockFreeDeliveryConfig)).toBe(false);
  });
});

describe('getNextAvailableDeliveryDates', () => {
  it('returns requested number of available dates', () => {
    const dates = getNextAvailableDeliveryDates('Scarborough', mockFreeDeliveryConfig, 3);
    expect(dates).toHaveLength(3);
  });

  it('only returns dates matching the city config', () => {
    const dates = getNextAvailableDeliveryDates('Mississauga', mockFreeDeliveryConfig, 2);
    expect(dates).toHaveLength(2);
    // Mississauga is only available on Fridays
    for (const date of dates) {
      expect(date.getDay()).toBe(5); // Friday
    }
  });

  it('returns dates for cities with multiple delivery days', () => {
    const dates = getNextAvailableDeliveryDates('Scarborough', mockFreeDeliveryConfig, 4);
    expect(dates).toHaveLength(4);
    // Scarborough is available on Monday and Wednesday
    for (const date of dates) {
      expect([1, 3]).toContain(date.getDay()); // Monday = 1, Wednesday = 3
    }
  });

  it('defaults to 10 dates when count is not specified', () => {
    const dates = getNextAvailableDeliveryDates('Scarborough', mockFreeDeliveryConfig);
    expect(dates).toHaveLength(10);
  });
});
