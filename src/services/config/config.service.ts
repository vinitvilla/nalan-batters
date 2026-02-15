import { prisma } from '@/lib/prisma';
import type { ChargeConfig, FreeDeliveryConfig } from '@/types/config';
import type { Config } from '@/generated/prisma';

/**
 * Config Service
 * Centralized configuration access with type safety
 */

// Pure function - parses charge config from DB config array
export function parseChargeConfig(configs: any[]): ChargeConfig {
  const taxConfig = configs.find((c) => c.title === 'taxPercent');
  const convenienceConfig = configs.find((c) => c.title === 'convenienceCharge');
  const deliveryConfig = configs.find((c) => c.title === 'deliveryCharge');

  return {
    taxPercent: {
      percent: taxConfig?.value?.percent ?? 13,
      waive: taxConfig?.value?.waive ?? false,
    },
    convenienceCharge: {
      amount: convenienceConfig?.value?.amount ?? 0,
      waive: convenienceConfig?.value?.waive ?? false,
    },
    deliveryCharge: {
      amount: deliveryConfig?.value?.amount ?? 0,
      waive: deliveryConfig?.value?.waive ?? false,
    },
  };
}

// Pure function - parses free delivery config
export function parseFreeDeliveryConfig(configs: any[]): FreeDeliveryConfig {
  const freeDeliveryConfig = configs.find((c) => c.title === 'freeDelivery');
  return freeDeliveryConfig?.value ?? {};
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
export function getConfigField<T = any>(
  configs: any[],
  title: string,
  defaultValue: T
): T {
  const config = configs.find((c) => c.title === title);
  return config?.value ?? defaultValue;
}
