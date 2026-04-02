type ApiErrorPayload = { message?: string | string[] };

// Server components run inside Docker and need the internal service name.
// Client components run in the browser and need the public URL.
const API_BASE_URL =
  (typeof window === 'undefined'
    ? process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL) ?? 'http://localhost:3000';

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

export const apiPatch = async <TResponse>(path: string, body: unknown, token?: string): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
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

export interface PaginatedResponse<T> {
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

export interface CurrentUserProfile {
  id: string;
  userId?: string;
  email: string;
  name?: string;
  roles: string[];
  role?: string;
  status?: string;
  mfaEnabled?: boolean;
}

const getStoredToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('store_token') : null;

export const login = async (email: string, password: string): Promise<LoginResponse> =>
  apiPost<LoginResponse>('/auth/login', { email, password });

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> => apiPost<RegisterResponse>('/auth/register', { name, email, password });

export const getMe = async (): Promise<MeResponse> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet<MeResponse>('/auth/me', token);
};

export const getCurrentUser = async (): Promise<CurrentUserProfile> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet<CurrentUserProfile>('/users/me', token);
};

export const updateProfile = async (data: { name?: string }): Promise<CurrentUserProfile> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiPatch<CurrentUserProfile>('/users/me/profile', data, token);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiPatch<{ message: string }>('/users/me/password', data, token);
};

export const toggleMfa = async (enabled: boolean): Promise<{ mfaEnabled: boolean }> => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return apiPatch<{ mfaEnabled: boolean }>('/auth/mfa', { enabled }, token);
};

// ─── Product helpers ─────────────────────────────────────────────

export type SortBy = 'createdAt' | 'name' | 'price';
export type SortOrder = 'asc' | 'desc';

export interface GetProductsParams {
  search?: string;
  category?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

const buildProductQuery = (params?: GetProductsParams): string => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return query.toString();
};

export const getProducts = async (params?: GetProductsParams): Promise<Product[]> => {
  const qs = buildProductQuery(params);
  const res = await apiGet<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const getProductsPaginated = async (
  params?: GetProductsParams,
): Promise<PaginatedResponse<Product>> => {
  const qs = buildProductQuery(params);
  return apiGet<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
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
  deliveryCode?: string | null;
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


