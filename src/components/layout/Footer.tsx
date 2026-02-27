import Link from 'next/link'
import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-neutral-800" />
              <span className="font-bold text-neutral-900">ShopNow</span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Quality products delivered to your door. Fast, reliable, and always
              at the best price.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/products?category=Electronics', label: 'Electronics' },
                { href: '/products?category=Fashion', label: 'Fashion' },
                { href: '/products?category=Home+%26+Garden', label: 'Home & Garden' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/register', label: 'Create Account' },
                { href: '/cart', label: 'My Cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Help
            </h3>
            <ul className="space-y-2">
              {[
                'Free shipping over $50',
                'Easy 30-day returns',
                'Secure payments',
                '24/7 customer support',
              ].map((item) => (
                <li key={item} className="text-sm text-neutral-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} ShopNow. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Built with Next.js · Powered by a real backend API
          </p>
        </div>
      </div>
    </footer>
  )
}
