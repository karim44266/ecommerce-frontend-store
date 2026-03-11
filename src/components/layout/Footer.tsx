import Link from 'next/link'
import {
  Wrench, Phone, Mail, MapPin,
  Hammer, Zap, Droplets, Paintbrush, Cog, ShieldCheck, Building2,
} from 'lucide-react'

const DEPT_LINKS = [
  { href: '/products?category=Power+Tools', label: 'Power Tools', icon: Wrench },
  { href: '/products?category=Hand+Tools', label: 'Hand Tools', icon: Hammer },
  { href: '/products?category=Electrical', label: 'Electrical', icon: Zap },
  { href: '/products?category=Plumbing', label: 'Plumbing', icon: Droplets },
  { href: '/products?category=Paint', label: 'Paint', icon: Paintbrush },
  { href: '/products?category=Fasteners', label: 'Fasteners', icon: Cog },
  { href: '/products?category=Safety+Equipment', label: 'Safety', icon: ShieldCheck },
  { href: '/products?category=Building+Materials', label: 'Building Materials', icon: Building2 },
]

export function Footer() {
  return (
    <footer className="bg-hw-dark text-white/70 mt-16">
      {/* Orange accent stripe */}
      <div className="h-1 hw-stripe-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-display text-lg font-bold text-white tracking-tight block">
                  PROBUILD
                </span>
                <span className="text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
                  Supply
                </span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Professional-grade tools and building materials for contractors
              and DIY enthusiasts. Quality you can build on.
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" /> (555) 123-4567
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" /> support@probuild.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" /> 123 Builder Ave, Construction City
              </p>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Departments
            </h3>
            <ul className="space-y-2">
              {DEPT_LINKS.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/register', label: 'Create Pro Account' },
                { href: '/orders', label: 'Order Tracking' },
                { href: '/cart', label: 'My Cart' },
                { href: '/products', label: 'Browse All Products' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Why ProBuild?
            </h3>
            <ul className="space-y-3">
              {[
                'Free shipping over $75',
                'Same-day pickup available',
                'Contractor volume pricing',
                'Easy 30-day returns',
                'Expert staff & support',
                'Satisfaction guaranteed',
              ].map((item) => (
                <li key={item} className="text-sm text-white/50 flex items-start gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ProBuild Supply. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built for Pros. Priced for Everyone.
          </p>
        </div>
      </div>
    </footer>
  )
}
