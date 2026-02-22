import { prisma } from '@/lib/prisma';
import type { ChargeConfig, FreeDeliveryConfig } from '@/types/config';
import type { Config } from '@/generated/prisma';

/**
 * Config Service
 * Centralized configuration access with type safety
 */

type ConfigValue = Record<string, unknown>;

function asObj(value: Config['value']): ConfigValue {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as ConfigValue;
  }
  return {};
}

// Pure function - parses charge config from DB config array
export function parseChargeConfig(configs: Config[]): ChargeConfig {
  const additionalChargesConfig = configs.find((c) => c.title === 'additionalCharges');
  const val = additionalChargesConfig ? asObj(additionalChargesConfig.value) : {};

  const taxVal = asObj(val.taxPercent as Config['value']);
  const convVal = asObj(val.convenienceCharge as Config['value']);
  const delVal = asObj(val.deliveryCharge as Config['value']);

  return {
    taxPercent: {
      percent: (taxVal.percent as number) ?? 13,
      waive: (taxVal.waive as boolean) ?? false,
    },
    convenienceCharge: {
      amount: (convVal.amount as number) ?? 0,
      waive: (convVal.waive as boolean) ?? false,
    },
    deliveryCharge: {
      amount: (delVal.amount as number) ?? 0,
      waive: (delVal.waive as boolean) ?? false,
    },
  };
}

// Pure function - parses free delivery config
export function parseFreeDeliveryConfig(configs: Config[]): FreeDeliveryConfig {
  const freeDeliveryConfig = configs.find((c) => c.title === 'freeDelivery');
  return (freeDeliveryConfig ? asObj(freeDeliveryConfig.value) : {}) as FreeDeliveryConfig;
}

// Async - fetches all active configs from DB
export async function getAllConfigs(): Promise<Config[]> {
  const configs = await prisma.config.findMany({
    where: {
      isActive: true,
      isDelete: false,
    },
  });
  return configs;
}

// Async - gets specific config by title
export async function getConfigByTitle(title: string): Promise<Config | null> {
  const config = await prisma.config.findFirst({
    where: {
      title,
      isActive: true,
      isDelete: false,
    },
  });
  return config;
}

// Helper - extracts config field value safely
export function getConfigField<T = unknown>(
  configs: Config[],
  title: string,
  defaultValue: T
): T {
  const config = configs.find((c) => c.title === title);
  return (config ? asObj(config.value) : defaultValue) as T;
}
