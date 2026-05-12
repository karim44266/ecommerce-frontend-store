'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getStoreToken } from '@/lib/auth';

const TRACKING_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  '';
const SESSION_STORAGE_KEY = 'store_session_id';
const DEBOUNCE_MS = 1000;

type EventType = 'VIEW_PRODUCT' | 'VIEW_CATEGORY' | 'ADD_TO_CART';
type EntityType = 'PRODUCT' | 'CATEGORY';

interface TrackingPayload {
  eventType: EventType;
  entityId: string;
  entityType: EntityType;
}

interface DebounceHandles {
  product?: ReturnType<typeof setTimeout>;
  category?: ReturnType<typeof setTimeout>;
}

const generateUuidV4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
};

const getOrCreateSessionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated = generateUuidV4();
    localStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return generateUuidV4();
  }
};

export function useTracker(): {
  trackProductView: (productId: string) => void;
  trackCategoryView: (categoryId: string) => void;
  trackAddToCart: (productId: string) => void;
} {
  const debounceHandlesRef = useRef<DebounceHandles>({});

  useEffect(() => {
    return () => {
      const productTimer = debounceHandlesRef.current.product;
      const categoryTimer = debounceHandlesRef.current.category;

      if (productTimer) {
        clearTimeout(productTimer);
      }
      if (categoryTimer) {
        clearTimeout(categoryTimer);
      }
    };
  }, []);

  const sendEvent = useCallback((payload: TrackingPayload): void => {
    if (typeof window === 'undefined' || !TRACKING_API_URL) {
      return;
    }

    const sessionId = getOrCreateSessionId();
    if (!sessionId) {
      return;
    }

    const token = getStoreToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    void fetch(`${TRACKING_API_URL}/tracking/event`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, []);

  const debounceTrack = useCallback(
    (key: keyof DebounceHandles, callback: () => void): void => {
      const currentTimer = debounceHandlesRef.current[key];
      if (currentTimer) {
        clearTimeout(currentTimer);
      }

      debounceHandlesRef.current[key] = setTimeout(callback, DEBOUNCE_MS);
    },
    [],
  );

  const trackProductView = useCallback(
    (productId: string): void => {
      if (!productId) {
        return;
      }

      debounceTrack('product', () => {
        sendEvent({
          eventType: 'VIEW_PRODUCT',
          entityId: productId,
          entityType: 'PRODUCT',
        });
      });
    },
    [debounceTrack, sendEvent],
  );

  const trackCategoryView = useCallback(
    (categoryId: string): void => {
      if (!categoryId) {
        return;
      }

      debounceTrack('category', () => {
        sendEvent({
          eventType: 'VIEW_CATEGORY',
          entityId: categoryId,
          entityType: 'CATEGORY',
        });
      });
    },
    [debounceTrack, sendEvent],
  );

  const trackAddToCart = useCallback(
    (productId: string): void => {
      if (!productId) {
        return;
      }

      sendEvent({
        eventType: 'ADD_TO_CART',
        entityId: productId,
        entityType: 'PRODUCT',
      });
    },
    [sendEvent],
  );

  return {
    trackProductView,
    trackCategoryView,
    trackAddToCart,
  };
}
