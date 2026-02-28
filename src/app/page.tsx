import Link from 'next/link'
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/store/ProductCard'
import { getProducts, CATEGORIES } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getProducts>> = []
  try {
    featured = await getProducts()
  } catch {
    // backend may be unavailable at build time
  }
  const top = featured.slice(0, 4)

  return (
    <div className="space-y-20 pb-20">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl space-y-6">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              New arrivals available now
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Shop smarter.<br />
              Live better.
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed max-w-xl">
              Discover thousands of quality products across every category.
              Fast shipping, hassle-free returns, and unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/products">
                <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Truck className="h-6 w-6" />, title: 'Free shipping', desc: 'On all orders over $50' },
            { icon: <RotateCcw className="h-6 w-6" />, title: '30-day returns', desc: 'No questions asked policy' },
            { icon: <ShieldCheck className="h-6 w-6" />, title: 'Secure payment', desc: 'Your data is always safe' },
          ].map((badge) => (
            <Card key={badge.title}>
              <CardContent className="flex items-start gap-4 p-5">
                <span className="rounded-lg bg-muted p-2 text-foreground">{badge.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{badge.title}</p>
                  <p className="text-sm text-muted-foreground">{badge.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            All products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
            >
              <Card className="group cursor-pointer hover:border-foreground hover:shadow-md transition-all duration-200">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <span className="text-2xl select-none">{categoryEmoji(cat)}</span>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{cat}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Top picks curated for you</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {top.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Banner CTA ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-muted border-0">
          <CardContent className="px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">Join thousands of happy shoppers</h2>
              <p className="text-muted-foreground">Create an account and get 10% off your first order.</p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                <span className="text-sm text-muted-foreground ml-1">4.8 / 5 from 12,000+ reviews</span>
              </div>
            </div>
            <Link href="/register" className="flex-shrink-0">
              <Button size="lg" className="gap-2">Get Started Free <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    'Electronics': '💻', 'Fashion': '👗', 'Home & Garden': '🏡',
    'Sports': '⚽', 'Books': '📚', 'Beauty': '✨',
  }
  return map[cat] ?? '🛒'
}
