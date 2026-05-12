'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  getCategories,
  getProducts,
  type Product,
  type SimpleCategory,
} from '@/lib/api';
import { useRecommendations } from '@/lib/hooks/useRecommendations';

const PromotionBanner = dynamic(
  () =>
    import('@/components/promotions/PromotionBanner').then(
      (module) => module.PromotionBanner,
    ),
  {
    ssr: false,
  },
);

export default function CategoryProductsPage() {
  const params = useParams<{ id: string }>();
  const categoryId = String(params.id ?? '');

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<SimpleCategory | null>(null);

  const { recommendations } = useRecommendations();

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryProducts() {
      setLoading(true);
      try {
        const categories = await getCategories();
        const selected = categories.find((item) => item.id === categoryId) ?? null;

        if (!selected) {
          if (!cancelled) {
            setCategory(null);
            setProducts([]);
          }
          return;
        }

        const categoryProducts = await getProducts({ category: selected.name });
        if (!cancelled) {
          setCategory(selected);
          setProducts(categoryProducts);
        }
      } catch {
        if (!cancelled) {
          setCategory(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCategoryProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const title = useMemo(() => {
    if (!category) {
      return 'Category';
    }
    return category.name;
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">
          Category View
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground uppercase tracking-tight">
          {title}
        </h1>
        {!loading && (
          <Badge variant="outline">
            {products.length} product{products.length === 1 ? '' : 's'}
          </Badge>
        )}
      </div>

      {category && (
        <PromotionBanner
          categoryId={category.id}
          recommendations={recommendations}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`category-skeleton-${index}`} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            No products found
          </h2>
          <p className="text-sm text-muted-foreground">
            This category currently has no available products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
