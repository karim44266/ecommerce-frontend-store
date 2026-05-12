'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PromotionDto } from '@/lib/hooks/useRecommendations';

interface PromotionBannerProps {
  categoryId: string;
  recommendations: PromotionDto[];
}

export function PromotionBanner({
  categoryId,
  recommendations,
}: PromotionBannerProps) {
  const matches = recommendations.filter(
    (promotion) => promotion.categoryId === categoryId,
  );

  if (matches.length === 0) {
    return null;
  }

  const preview = matches.slice(0, 3);

  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">
            Recommended In This Category
          </p>
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground uppercase tracking-tight">
            Picks You May Need
          </h3>
        </div>
        <Badge className="bg-primary text-primary-foreground text-xs uppercase tracking-wide">
          {matches.length} match{matches.length > 1 ? 'es' : ''}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {preview.map((promotion) => (
          <Link key={promotion.productId} href={`/products/${promotion.productId}`}>
            <Button variant="outline" size="sm" className="h-auto py-2 px-3 text-left">
              <span className="flex flex-col items-start">
                <span className="text-xs font-semibold line-clamp-1 max-w-[180px]">
                  {promotion.productName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ${promotion.price.toFixed(2)} · {promotion.promotionReason}
                </span>
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </section>
  );
}
