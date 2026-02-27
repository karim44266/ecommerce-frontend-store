import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <p className="text-8xl font-black text-neutral-900 leading-none">404</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-800">Page not found</h1>
      <p className="mt-2 text-neutral-500 max-w-sm">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have moved or never existed.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}
