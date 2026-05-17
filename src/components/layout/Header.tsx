'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart, User, LogOut, Search, Package, Menu,
  Wrench, Hammer, Zap, Droplets, Paintbrush, Cog,
  ShieldCheck, Building2, Phone, Mail, ChevronRight, Sun, Moon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { company } from '@/lib/company'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const HW_CATEGORIES = [
  { name: 'Power Tools', icon: Wrench, href: '/products?category=Power+Tools' },
  { name: 'Hand Tools', icon: Hammer, href: '/products?category=Hand+Tools' },
  { name: 'Electrical', icon: Zap, href: '/products?category=Electrical' },
  { name: 'Plumbing', icon: Droplets, href: '/products?category=Plumbing' },
  { name: 'Paint', icon: Paintbrush, href: '/products?category=Paint' },
  { name: 'Fasteners', icon: Cog, href: '/products?category=Fasteners' },
  { name: 'Safety', icon: ShieldCheck, href: '/products?category=Safety+Equipment' },
  { name: 'Building', icon: Building2, href: '/products?category=Building+Materials' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSheetOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* ── Top utility bar ────────────────────────────────────── */}
      <div className="hidden md:block bg-hw-dark text-white/80 hw-topbar-anim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {company.contact.phone}
            </span>
            <span className="hidden lg:inline text-white/40">|</span>
            <span className="hidden lg:inline flex items-center gap-1">
              <Mail className="h-3 w-3" /> {company.contact.email}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-blue-300">{company.tagline}</span>
            <span className="text-white/40">|</span>
            <Link href="/products" className="hover:text-white transition-colors">
              Product Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main bar ───────────────────────────────────────────── */}
      <div className="bg-background border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo container placed immediately left of the search bar */}
            <div className="flex items-center justify-center w-56">
              <Link href="/" aria-label={company.legalName} className="flex items-center">
                <Image
                  src={company.logo.primary}
                  alt={company.logo.alt}
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Search bar — desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-xl items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools, materials, equipment..."
                  className="pl-10 h-10 bg-muted/60 border-border rounded-lg text-sm focus:bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="ml-2 h-10 px-5 rounded-lg">
                Search
              </Button>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Dark mode toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="relative overflow-hidden"
                  aria-label="Toggle dark mode"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
                </Button>
              )}

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground border-2 border-background">
                      {itemCount > 9 ? '9+' : itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User — desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-12 h-12">
                        <Image
                          src={company.logo.primary}
                          alt={company.logo.alt}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                      <span className="sr-only">{company.legalName}</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-5">
                    {/* Mobile search */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="pl-9 h-9"
                        />
                      </div>
                      <Button type="submit" size="sm">Go</Button>
                    </form>

                    <Separator />

                    {/* Mobile nav links */}
                    <nav className="flex flex-col gap-1">
                      {[
                        { href: '/', label: 'Home' },
                        { href: '/products', label: 'All Products' },
                          { href: '/account', label: 'My Account' },
                        { href: '/orders', label: 'My Orders' },
                      ].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSheetOpen(false)}
                          className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            pathname === link.href
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>

                    <Separator />

                    {/* Mobile categories */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Departments
                      </p>
                      <nav className="flex flex-col gap-0.5">
                        {HW_CATEGORIES.map((cat) => {
                          const Icon = cat.icon
                          return (
                            <Link
                              key={cat.name}
                              href={cat.href}
                              onClick={() => setSheetOpen(false)}
                              className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <Icon className="h-4 w-4 text-primary" />
                              {cat.name}
                              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40" />
                            </Link>
                          )
                        })}
                      </nav>
                    </div>

                    <Separator />

                    {/* Mobile auth */}
                    {mounted && (
                      <div className="flex items-center justify-between px-3">
                        <span className="text-sm font-medium text-muted-foreground">Dark Mode</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                          className="gap-2"
                        >
                          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
                        </Button>
                      </div>
                    )}

                    <Separator />

                    {/* Mobile user auth */}
                    {user ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground truncate px-3">{user.email}</p>
                        <Link
                          href="/account"
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                          <User className="h-4 w-4" /> My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                          <Package className="h-4 w-4" /> My Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setSheetOpen(false)
                          }}
                          className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-destructive hover:bg-muted w-full"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 px-3">
                        <Link href="/login" onClick={() => setSheetOpen(false)}>
                          <Button variant="outline" className="w-full">Sign in</Button>
                        </Link>
                        <Link href="/register" onClick={() => setSheetOpen(false)}>
                          <Button className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category navigation bar — desktop ──────────────────── */}
      <div className="hidden md:block bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto hw-no-scrollbar">
            <Link
              href="/products"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                pathname === '/products'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All Products
            </Link>
            <span className="w-px h-4 bg-border mx-1" />
            {HW_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
