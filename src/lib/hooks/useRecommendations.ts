'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const RECOMMENDATION_TIMEOUT_MS = 3000;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3000';

export interface PromotionDto {
  productId: string;
  productName: string;
  image: string;
  categoryId: string;
  price: number;
  displayPrice: number;
  discountPercent: number | null;
  discountAmount: number | null;
  stockLevel: number;
  promotionReason: string;
  score: number;
  isAdminForced: boolean;
}

interface RecommendationResponse {
  recommendations: PromotionDto[];
  source: 'personalized' | 'popular' | 'fallback';
  generatedAt: string;
}

interface UseRecommendationsResult {
  recommendations: PromotionDto[];
  isLoading: boolean;
  source: 'personalized' | 'popular' | 'fallback' | null;
  refetch: () => void;
}

export function useRecommendations(): UseRecommendationsResult {
  const { token } = useAuth();

  const [recommendations, setRecommendations] = useState<PromotionDto[]>([]);
  const [source, setSource] = useState<
    'personalized' | 'popular' | 'fallback' | null
  >(null);
  const [isLoading, setIsLoading] = useState(
    typeof window !== 'undefined',
  );

  const cacheRef = useRef<RecommendationResponse | null>(null);
  const cacheTokenRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchRecommendations = useCallback(
    async (forceRefresh = false): Promise<void> => {
      if (typeof window === 'undefined') {
        setRecommendations([]);
        setSource(null);
        setIsLoading(false);
        return;
      }

      const tokenSnapshot = token ?? null;

      if (
        !forceRefresh &&
        cacheRef.current &&
        cacheTokenRef.current === tokenSnapshot
      ) {
        setRecommendations(cacheRef.current.recommendations);
        setSource(cacheRef.current.source);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const requestId = ++requestIdRef.current;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, RECOMMENDATION_TIMEOUT_MS);

      try {
        const response = await fetch(`${API_BASE_URL}/promotions/recommendations`, {
          method: 'GET',
          headers: {
            ...(tokenSnapshot
              ? { Authorization: `Bearer ${tokenSnapshot}` }
              : {}),
          },
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Recommendations request failed (${response.status})`);
        }

        const data = (await response.json()) as RecommendationResponse;

        if (requestIdRef.current !== requestId) {
          return;
        }

        cacheRef.current = data;
        cacheTokenRef.current = tokenSnapshot;
        setRecommendations(data.recommendations ?? []);
        setSource(data.source ?? null);
        setIsLoading(false);
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        // Timeout and network failures should be silent for users.
        console.error('Failed to load recommendations', error);
        cacheRef.current = null;
        cacheTokenRef.current = null;
        setRecommendations([]);
        setSource(null);
        setIsLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [token],
  );

  useEffect(() => {
    void fetchRecommendations(false);
  }, [fetchRecommendations]);

  const refetch = useCallback(() => {
    cacheRef.current = null;
    cacheTokenRef.current = null;
    void fetchRecommendations(true);
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    source,
    refetch,
  };
}
