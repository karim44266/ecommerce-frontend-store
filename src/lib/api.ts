const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

// ─── Generic helpers ───────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('store_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message: string =
      body?.message ?? `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken?: string
  mfaRequired?: boolean
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getMe(): Promise<{ userId: string; email: string; roles: string[] }> {
  return request('/auth/me')
}

// ─── Products (will use real API when available, mock otherwise) ──────────────

export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  stock: number
  rating: number
  reviewCount: number
}

export async function getProducts(params?: {
  category?: string
  search?: string
}): Promise<Product[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.search) query.set('search', params.search)

  try {
    return await request<Product[]>(`/products${query.size ? `?${query}` : ''}`)
  } catch {
    // Products API not yet implemented — return mock data
    return getMockProducts(params)
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    return await request<Product>(`/products/${id}`)
  } catch {
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) throw new Error('Product not found')
    return product
  }
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export interface OrderStatus {
  id: string
  status: string
  items: { productId: string; name: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export async function getOrder(id: string): Promise<OrderStatus> {
  return request<OrderStatus>(`/orders/${id}`)
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 89.99,
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Foldable design perfect for travel.',
    category: 'Electronics',
    image: 'https://placehold.co/600x600/1a1a2e/ffffff?text=Headphones',
    stock: 42,
    rating: 4.7,
    reviewCount: 1243,
  },
  {
    id: '2',
    name: 'Running Shoes Pro',
    price: 119.95,
    description:
      'Lightweight and responsive running shoes with advanced cushioning technology. Breathable mesh upper and durable rubber outsole.',
    category: 'Sports',
    image: 'https://placehold.co/600x600/16213e/ffffff?text=Shoes',
    stock: 28,
    rating: 4.5,
    reviewCount: 874,
  },
  {
    id: '3',
    name: 'Smart Home Security Camera',
    price: 54.99,
    description:
      '1080p HD indoor security camera with night vision, motion detection, two-way audio, and cloud storage. Works with Alexa and Google Home.',
    category: 'Electronics',
    image: 'https://placehold.co/600x600/0f3460/ffffff?text=Camera',
    stock: 65,
    rating: 4.3,
    reviewCount: 2108,
  },
  {
    id: '4',
    name: 'Organic Cotton Crew T-Shirt',
    price: 24.99,
    description:
      '100% organic cotton classic-fit T-shirt. Sustainably sourced and GOTS certified. Available in 10 colors.',
    category: 'Fashion',
    image: 'https://placehold.co/600x600/533483/ffffff?text=T-Shirt',
    stock: 150,
    rating: 4.6,
    reviewCount: 3412,
  },
  {
    id: '5',
    name: 'Stainless Steel Water Bottle',
    price: 29.95,
    description:
      'Double-wall vacuum insulated water bottle. Keeps drinks cold 24 hours, hot 12 hours. BPA-free, leak-proof lid.',
    category: 'Sports',
    image: 'https://placehold.co/600x600/2b2d42/ffffff?text=Bottle',
    stock: 93,
    rating: 4.8,
    reviewCount: 5621,
  },
  {
    id: '6',
    name: 'Aromatic Soy Wax Candle Set',
    price: 38.00,
    description:
      'Set of 3 hand-poured soy wax candles with natural essential oil blends: Lavender, Vanilla Cedarwood, and Fresh Linen. Up to 45hrs burn time each.',
    category: 'Home & Garden',
    image: 'https://placehold.co/600x600/8d99ae/ffffff?text=Candles',
    stock: 77,
    rating: 4.9,
    reviewCount: 1876,
  },
  {
    id: '7',
    name: 'The Art of Clean Code – Book',
    price: 34.99,
    description:
      'A comprehensive guide to writing clean, maintainable, and efficient code. Packed with real-world examples, code reviews, and best practices.',
    category: 'Books',
    image: 'https://placehold.co/600x600/ef233c/ffffff?text=Book',
    stock: 200,
    rating: 4.7,
    reviewCount: 924,
  },
  {
    id: '8',
    name: 'Vitamin C Brightening Serum',
    price: 44.95,
    description:
      'Potent 20% Vitamin C serum with hyaluronic acid and niacinamide. Brightens dull skin, evens skin tone, and boosts collagen production.',
    category: 'Beauty',
    image: 'https://placehold.co/600x600/ffb703/000000?text=Serum',
    stock: 55,
    rating: 4.4,
    reviewCount: 2340,
  },
]

function getMockProducts(params?: { category?: string; search?: string }): Product[] {
  let products = MOCK_PRODUCTS
  if (params?.category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === params.category!.toLowerCase(),
    )
  }
  if (params?.search) {
    const q = params.search.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }
  return products
}


