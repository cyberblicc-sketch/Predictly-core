import Link from 'next/link'
import { Disclaimer } from '@/components/layout/Disclaimer'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,210,132,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center font-bold text-white">
            PR
          </div>
          <span className="gradient-text font-semibold text-xl tracking-tight">
            Predictly
          </span>
        </Link>

        {/* Card-like container for children */}
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer with Disclaimer */}
      <div className="mt-auto">
        <Disclaimer compact />
      </div>
    </div>
  )
}
