import Link from 'next/link'
import { HardHat, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <HardHat className="h-12 w-12 text-primary" />
        </div>

        <h1 className="font-display text-7xl font-extrabold tracking-tighter text-primary mb-2">
          404
        </h1>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this page is still under construction. Let&apos;s get you back to the workshop.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="uppercase font-bold tracking-wide">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="uppercase font-semibold tracking-wide">
            <Link href="/products">
              Browse Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
