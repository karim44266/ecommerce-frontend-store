'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRecommendations, type PromotionDto } from '@/lib/hooks/useRecommendations';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3000';

const PromotionCarousel = dynamic(
  () =>
    import('@/components/promotions/PromotionCarousel').then(
      (module) => module.PromotionCarousel,
    ),
  {
    ssr: false,
  },
);

/**
 * Fetches the latest products from the public products API and maps them
 * to the PromotionDto shape so the carousel can render them uniformly.
 */
async function fetchFallbackProducts(): Promise<PromotionDto[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=8`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.data ?? data ?? [];
    return (products as Array<Record<string, unknown>>).slice(0, 8).map(
      (p: Record<string, unknown>, idx: number) => ({
        productId: String(p.id ?? p._id ?? idx),
        productName: String(p.name ?? 'Product'),
        image: String(p.image ?? ''),
        categoryId: String(p.categoryId ?? ''),
        price: Number(p.price ?? 0),
        displayPrice: Number(p.price ?? 0),
        discountPercent: null,
        discountAmount: null,
        stockLevel: Number(p.stock ?? p.inventory ?? 0),
        promotionReason: 'Popular',
        score: 100 - idx,
        isAdminForced: false,
      }),
    );
  } catch {
    return [];
  }
}

export function HomePromotionsSection() {
  const { recommendations, source, isLoading } = useRecommendations();
  const [fallbackItems, setFallbackItems] = useState<PromotionDto[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  /* When recommendations come back empty (API 401, timeout, etc.),
     fetch the public products list as a fallback so the section is never empty. */
  useEffect(() => {
    if (!isLoading && recommendations.length === 0) {
      setFallbackLoading(true);
      fetchFallbackProducts()
        .then(setFallbackItems)
        .finally(() => setFallbackLoading(false));
    }
  }, [isLoading, recommendations.length]);

  const hasRecommendations = recommendations.length > 0;
  const items = hasRecommendations ? recommendations : fallbackItems;
  const effectiveSource = hasRecommendations ? source : ('popular' as const);
  const effectiveLoading = isLoading || (!hasRecommendations && fallbackLoading);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 hw-fade-up hw-fade-up-delay-1">
      <PromotionCarousel
        title="Picked For You"
        recommendations={items}
        source={effectiveSource}
        isLoading={effectiveLoading}
      />
    </section>
  );
}
