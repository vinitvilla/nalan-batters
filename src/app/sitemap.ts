import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nalanbatters.ca';

  // Fetch all active, non-deleted products for indexable product pages.
  // TODO: Add a `slug` field to the Product model (Prisma migration) and switch
  // from id-based URLs to human-readable slugs for better keyword targeting,
  // e.g. /products/fresh-dosa-batter instead of /products/<uuid>.
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDelete: false },
      select: { id: true, updatedAt: true },
    });

    productUrls = products.map((p) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    // Graceful degradation: if DB is unavailable at build time, sitemap
    // still generates without product URLs rather than failing the build.
    console.error('[sitemap] Failed to fetch products from DB');
  }

  return [
    // Homepage — highest priority, crawled daily (products & availability change)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Individual product pages — the primary SEO targets
    ...productUrls,
  ];
}
