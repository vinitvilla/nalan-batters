import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment';
import logger, { logError, logInfo } from '@/lib/logger'

export async function GET() {
  try {
    // Get all active products with categories
    const products = await prisma.product.findMany({
      where: {
        isDelete: false,
        isActive: true
      },
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isDelete: false },
      orderBy: { name: 'asc' }
    });

    // Get configuration data for taxes and charges
    const configs = await prisma.config.findMany({
      where: {
        isDelete: false,
        isActive: true,
        title: {
          in: ['additionalCharges', 'freeDeliveryThreshold']
        }
      }
    });
    // Get active promo codes
    const promoCodes = await prisma.promoCode.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: moment().toDate() } }
        ]
      },
      orderBy: { code: 'asc' }
    });

    // Transform config data into a more usable format
    const configMap = configs.reduce<Record<string, unknown>>((acc, config) => {
      acc[config.title] = config.value;
      return acc;
    }, {});

    // Handle tax configuration with waive flag from additionalCharges
    let taxRate = 0.13; // Default 13% HST
    let taxWaived = false;

    const additionalCharges = configMap.additionalCharges as AdditionalChargesConfig | undefined;
    if (additionalCharges && additionalCharges.taxPercent) {
      const taxConfig = additionalCharges.taxPercent;
      if (taxConfig && typeof taxConfig === 'object') {
        taxWaived = taxConfig.waive === true;
        const taxPercent = parseFloat(String(taxConfig.percent));
        if (!isNaN(taxPercent) && taxPercent >= 0) {
          // Allow 0% tax rate - only use default if config is invalid
          taxRate = taxWaived ? 0 : taxPercent / 100;
        }
      }
    }

    // Set default values if configs don't exist
    const posConfig = {
      taxRate: taxRate,
      taxWaived: taxWaived,
      convenienceCharge: additionalCharges?.convenienceCharge?.amount || 2.50,
      deliveryCharge: additionalCharges?.deliveryCharge?.amount || 5.00,
      freeDeliveryThreshold: parseFloat(String(configMap.freeDeliveryThreshold)) || 50.00
    };

    logInfo(logger, { endpoint: 'GET /api/admin/pos', action: 'pos_data_fetched', productCount: products.length, categoryCount: categories.length, promoCodeCount: promoCodes.length });

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        config: posConfig,
        promoCodes
      }
    });

  } catch (error) {
    logError(logger, error, { endpoint: 'GET /api/admin/pos', action: 'pos_data_fetch_failed' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch POS data' },
      { status: 500 }
    );
  }
}
