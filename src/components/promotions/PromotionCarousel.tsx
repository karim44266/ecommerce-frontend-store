'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTracker } from '@/lib/hooks/useTracker';
import type { PromotionDto } from '@/lib/hooks/useRecommendations';
import { cn } from '@/lib/utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3000';
const SESSION_STORAGE_KEY = 'store_session_id';

type RecommendationSource = 'personalized' | 'popular' | 'fallback' | null;

interface PromotionCarouselProps {
  title?: string;
  maxItems?: number;
  recommendations: PromotionDto[];
  source: RecommendationSource;
  isLoading: boolean;
}

function ensureSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const generated =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

function getProductImageUrl(image: string | null | undefined, name: string): string {
  const normalized = typeof image === 'string' ? image.trim() : '';
  if (normalized.length > 0) {
    return normalized;
  }

  return `https://placehold.co/800x600/e8eefc/1f2937?text=${encodeURIComponent(name)}`;
}

export function PromotionCarousel({
  title = 'Picked For You',
  maxItems = 8,
  recommendations,
  source,
  isLoading,
}: PromotionCarouselProps) {
  const { token } = useAuth();
  const tracker = useTracker();

  const containerRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const impressionsFiredRef = useRef(false);

  const displayItems = useMemo(
    () => recommendations.slice(0, Math.max(1, maxItems)),
    [maxItems, recommendations],
  );

  const [hasSentAnyImpression, setHasSentAnyImpression] = useState(false);

  const postTrackingEvent = (
    productId: string,
    position: number,
    metadata: Record<string, unknown>,
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    const sessionId = ensureSessionId();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    void fetch(`${API_BASE_URL}/tracking/event`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventType: 'VIEW_PRODUCT',
        entityId: productId,
        entityType: 'PRODUCT',
        metadata: {
          ...metadata,
          position,
          source,
        },
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container || displayItems.length === 0 || impressionsFiredRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || impressionsFiredRef.current) {
          return;
        }

        impressionsFiredRef.current = true;

        const containerRect = container.getBoundingClientRect();
        const visibleIndices: number[] = [];

        cardRefs.current.forEach((card, index) => {
          if (!card) {
            return;
          }

          const rect = card.getBoundingClientRect();
          const visibleWidth =
            Math.min(rect.right, containerRect.right) -
            Math.max(rect.left, containerRect.left);
          const visibilityRatio = visibleWidth / Math.max(rect.width, 1);

          if (visibilityRatio >= 0.5) {
            visibleIndices.push(index);
          }
        });

        visibleIndices.forEach((index, sequence) => {
          const promotion = displayItems[index];
          if (!promotion) {
            return;
          }

          setTimeout(() => {
            postTrackingEvent(promotion.productId, index, {
              promotionImpression: true,
              isAdminForced: promotion.isAdminForced,
            });
          }, sequence * 100);
        });

        if (visibleIndices.length > 0) {
          setHasSentAnyImpression(true);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [displayItems, source, token]);

  /* ── Loading skeleton — matches Featured Products grid ── */
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`promo-skeleton-${index}`}
              className="overflow-hidden py-0 gap-0"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (displayItems.length === 0) {
    return null;
  }

  /* Split into rows of 4, matching Featured Products layout */
  const row1 = displayItems.slice(0, 4);
  const row2 = displayItems.slice(4, 8);

  return (
    <section
      ref={containerRef}
      className="space-y-6"
      data-impressions={hasSentAnyImpression ? 'sent' : 'pending'}
    >
      {/* ── Section header — mirrors Featured Products style ── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
              {title}
            </h2>
            {source === 'personalized' && (
              <Badge className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px] tracking-wide">
                <Sparkles className="h-3 w-3 mr-1" />
                Personalized
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {source === 'personalized'
              ? 'Curated just for you based on your browsing history'
              : 'Hand-picked products our customers love'}
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Product grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {row1.map((promotion, index) => (
          <PromotionProductCard
            key={promotion.productId}
            promotion={promotion}
            index={index}
            cardRefs={cardRefs}
            tracker={tracker}
            postTrackingEvent={postTrackingEvent}
          />
        ))}
      </div>

      {row2.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {row2.map((promotion, index) => (
            <PromotionProductCard
              key={promotion.productId}
              promotion={promotion}
              index={index + 4}
              cardRefs={cardRefs}
              tracker={tracker}
              postTrackingEvent={postTrackingEvent}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Individual promotion card — mirrors ProductCard design ──────── */

interface PromotionProductCardProps {
  promotion: PromotionDto;
  index: number;
  cardRefs: React.MutableRefObject<Array<HTMLAnchorElement | null>>;
  tracker: ReturnType<typeof useTracker>;
  postTrackingEvent: (
    productId: string,
    position: number,
    metadata: Record<string, unknown>,
  ) => void;
}

function PromotionProductCard({
  promotion,
  index,
  cardRefs,
  tracker,
  postTrackingEvent,
}: PromotionProductCardProps) {
  const { addItem } = useCart();
  const inStock = promotion.stockLevel > 0;
  const lowStock = promotion.stockLevel > 0 && promotion.stockLevel <= 5;
  const discountPercent = Number(promotion.discountPercent ?? 0);
  const hasDiscount = Number.isFinite(discountPercent) && discountPercent > 0;
  const effectivePrice = Number(promotion.displayPrice ?? promotion.price);

  const imageUrl = getProductImageUrl(promotion.image, promotion.productName);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: promotion.productId,
        name: promotion.productName,
        price: effectivePrice,
        image: imageUrl,
        sku: '',
        description: '',
        inventory: promotion.stockLevel,
        stock: promotion.stockLevel,
        status: inStock ? 'ACTIVE' : 'INACTIVE',
        category: null,
        categoryId: promotion.categoryId || null,
        createdAt: '',
        updatedAt: '',
      },
      1,
    );
  };

  return (
    <Link
      ref={(element) => {
        cardRefs.current[index] = element;
      }}
      href={`/products/${promotion.productId}`}
      className="group block"
      onClick={() => {
        tracker.trackProductView(promotion.productId);
        postTrackingEvent(promotion.productId, index, {
          promotionClick: true,
          isAdminForced: promotion.isAdminForced,
        });
      }}
    >
      <Card className="overflow-hidden py-0 gap-0 hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 hw-lift">
        {/* Product image */}
        <div className="relative aspect-[4/3] bg-muted/50 overflow-hidden">
          <Image
            src={imageUrl}
            alt={promotion.productName}
            fill
            className="object-cover hw-img-zoom"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />

          {/* Low stock badge */}
          {lowStock && (
            <Badge className="absolute top-2.5 left-2.5 bg-amber-600 text-white border-0 text-[10px] font-bold uppercase tracking-wide hw-stock-pulse">
              Only {promotion.stockLevel} left
            </Badge>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Badge
                variant="default"
                className="bg-hw-dark text-white text-xs px-4 py-1.5 font-semibold uppercase tracking-wide"
              >
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Promotion reason ribbon */}
          <Badge className="absolute top-2.5 right-2.5 bg-primary/90 text-primary-foreground border-0 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            {promotion.promotionReason}
          </Badge>

          {hasDiscount && (
            <Badge className="absolute top-10 right-2.5 bg-rose-600 text-white border-0 text-[10px] font-bold uppercase tracking-wide">
              -{Math.round(discountPercent)}%
            </Badge>
          )}
        </div>

        {/* Details */}
        <CardContent className="p-4 space-y-2">
          {/* Category label */}
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            Recommended
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {promotion.productName}
          </h3>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                inStock ? 'bg-hw-green' : 'bg-destructive',
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium',
                inStock ? 'text-hw-green' : 'text-destructive',
              )}
            >
              {inStock
                ? lowStock
                  ? `${promotion.stockLevel} in stock`
                  : 'In Stock'
                : 'Out of Stock'}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[11px] text-muted-foreground line-through">
                  ${promotion.price.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-foreground hw-price">
                ${effectivePrice.toFixed(2)}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="gap-1 text-xs font-semibold"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
