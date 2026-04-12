import Link from 'next/link'
import {
  ArrowRight, Truck, RotateCcw, ShieldCheck,
  Wrench, Hammer, Zap, Droplets, Paintbrush, Cog, Building2, HardHat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/store/ProductCard'
import { getProducts, getCategories, type SimpleCategory } from '@/lib/api'

export const dynamic = 'force-dynamic'

/* ── Hardware categories with icons ──────────────────────────── */
const HW_DEPARTMENTS = [
  { name: 'Power Tools', icon: Wrench, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', href: '/products?category=Power+Tools' },
  { name: 'Hand Tools', icon: Hammer, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400', href: '/products?category=Hand+Tools' },
  { name: 'Electrical', icon: Zap, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', href: '/products?category=Electrical' },
  { name: 'Plumbing', icon: Droplets, color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400', href: '/products?category=Plumbing' },
  { name: 'Paint', icon: Paintbrush, color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400', href: '/products?category=Paint' },
  { name: 'Fasteners', icon: Cog, color: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', href: '/products?category=Fasteners' },
  { name: 'Safety Equipment', icon: HardHat, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400', href: '/products?category=Safety+Equipment' },
  { name: 'Building Materials', icon: Building2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400', href: '/products?category=Building+Materials' },
]

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getProducts>> = []
  let categories: SimpleCategory[] = []
  try {
    ;[featured, categories] = await Promise.all([getProducts(), getCategories()])
  } catch {
    // backend may be unavailable at build time
  }
  const top = featured.slice(0, 8)

  return (
    <div className="pb-20">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hw-hero-pattern">
        <div className="hw-dot-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs tracking-wider uppercase">
              Same-Day Pickup Available
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight uppercase">
              Built for Pros.
              <br />
              <span className="text-primary">Priced for Everyone.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg">
              Professional-grade tools, building materials, and construction supplies.
              Everything you need to get the job done right.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/products">
                <Button size="lg" className="gap-2 font-semibold text-sm uppercase tracking-wide hw-glow">
                  Shop All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white gap-2 text-sm uppercase tracking-wide font-semibold"
                >
                  Open Pro Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 hw-fade-up">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Truck className="h-5 w-5" />, title: 'Free Shipping $75+', desc: 'On qualifying orders nationwide' },
            { icon: <RotateCcw className="h-5 w-5" />, title: '30-Day Returns', desc: 'Hassle-free return policy' },
            { icon: <ShieldCheck className="h-5 w-5" />, title: 'Pro Guaranteed', desc: 'Top brands, trusted quality' },
          ].map((badge) => (
            <Card key={badge.title} className="border-border shadow-md bg-card hw-lift">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {badge.icon}
                </span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Shop by Department ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 hw-fade-up hw-fade-up-delay-1">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
              Shop by Department
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find everything you need for your next project
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {HW_DEPARTMENTS.map((dept) => {
            const Icon = dept.icon
            return (
              <Link key={dept.name} href={dept.href}>
                <Card className="hw-cat-card cursor-pointer border-border hover:border-primary/40 py-0">
                  <CardContent className="flex flex-col items-center gap-2.5 p-4 text-center">
                    <span className={`flex items-center justify-center w-11 h-11 rounded-lg ${dept.color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {dept.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Dynamic categories from API ───────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h3 className="font-display text-lg font-bold text-foreground uppercase tracking-tight mb-4">
            Browse Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/products">
              <Badge variant="default" className="px-4 py-1.5 text-sm cursor-pointer">All</Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                <Badge variant="outline" className="px-4 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────── */}
      {top.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 hw-fade-up hw-fade-up-delay-2">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
                Featured Products
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Top-selling tools and materials</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {top.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {top.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
              {top.slice(4, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Pro Account CTA ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 hw-fade-up hw-fade-up-delay-3">
        <div className="relative overflow-hidden rounded-xl bg-hw-dark">
          <div className="hw-dot-grid absolute inset-0 pointer-events-none opacity-50" />
          <div className="relative px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
                Open a Pro Account
              </h2>
              <p className="text-white/50 text-sm max-w-md">
                Get volume pricing, dedicated account management, net-30 terms,
                and priority access to new products.
              </p>
            </div>
            <Link href="/register" className="flex-shrink-0">
              <Button size="lg" className="gap-2 font-semibold text-sm uppercase tracking-wide hw-glow">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
