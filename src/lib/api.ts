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

// ─── Generic helpers ─────────────────────────────────────────────

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};

// ─── Product types ───────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  image: string;
  inventory: number;
  stock: number;
  status: string;
  category: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Category types ──────────────────────────────────────────────

export interface SimpleCategory {
  id: string;
  name: string;
  slug: string;
}

export const getCategories = async (): Promise<SimpleCategory[]> =>
  apiGet<SimpleCategory[]>('/categories/simple');

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
] as const;

// ─── Auth helpers ────────────────────────────────────────────────

interface LoginResponse {
  accessToken?: string;
  mfaRequired?: boolean;
}

interface RegisterResponse {
  accessToken: string;
}

interface MeResponse {
  userId: string;
  email: string;
  roles: string[];
}

const getStoredToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('store_token') : null;

export const login = async (email: string, password: string): Promise<LoginResponse> =>
  apiPost<LoginResponse>('/auth/login', { email, password });

export const register = async (email: string, password: string): Promise<RegisterResponse> =>
  apiPost<RegisterResponse>('/auth/register', { email, password });

export const getMe = async (): Promise<MeResponse> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet<MeResponse>('/auth/me', token);
};

// ─── Product helpers ─────────────────────────────────────────────

interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (params?: GetProductsParams): Promise<Product[]> => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const res = await apiGet<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const getProduct = async (id: string): Promise<Product> =>
  apiGet<Product>(`/products/${id}`);

// ─── Order types & helpers ───────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  note: string | null;
  changedBy: string | null;
  changedByEmail: string | null;
  createdAt: string;
}

export interface OrderStatus {
  id: string;
  userId: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  shippingAddress: ShippingAddress | string;
  trackingNumber: string | null;
  carrier: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  trackingNumber: string | null;
  carrier: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const getOrder = async (id: string): Promise<OrderStatus> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet<OrderStatus>(`/orders/${id}`, token);
};

export const getOrders = async (page = 1, limit = 10): Promise<PaginatedResponse<OrderSummary>> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet<PaginatedResponse<OrderSummary>>(`/orders?page=${page}&limit=${limit}`, token);
};

export const createOrder = async (payload: CreateOrderPayload): Promise<OrderStatus> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiPost<OrderStatus>('/orders', payload, token);
};


