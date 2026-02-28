type ApiErrorPayload = { message?: string | string[] };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const buildErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as ApiErrorPayload | undefined;
    const message = data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  } catch {
    // ignore JSON parsing errors
  }
  return `Request failed with status ${response.status}`;
};

// ── Helpers ──────────────────────────────────────────────────

const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('store_token') : null;

export const apiPost = async <TResponse>(path: string, body: unknown, token?: string): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};

export const apiGet = async <TResponse>(path: string, token?: string): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};

// ── Types ────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

export interface OrderStatus {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// ── Constants ────────────────────────────────────────────────

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
] as const;

// ── Auth ─────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken?: string; mfaRequired?: boolean }> {
  return apiPost('/auth/login', { email, password });
}

export async function register(
  email: string,
  password: string,
): Promise<{ accessToken?: string }> {
  return apiPost('/auth/register', { email, password });
}

export async function getMe(): Promise<{
  userId: string;
  email: string;
  roles: string[];
}> {
  const token = getToken();
  return apiGet('/auth/me', token ?? undefined);
}

// ── Products ─────────────────────────────────────────────────

export async function getProducts(
  params?: { search?: string; category?: string },
): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  const qs = query.toString();
  return apiGet(`/products${qs ? `?${qs}` : ''}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiGet(`/products/${id}`);
}

// ── Orders ───────────────────────────────────────────────────

export async function getOrder(id: string): Promise<OrderStatus> {
  const token = getToken();
  return apiGet(`/orders/${id}`, token ?? undefined);
}
