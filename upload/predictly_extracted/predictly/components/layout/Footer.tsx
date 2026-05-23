import Link from 'next/link'
import { Twitter, MessageCircle, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center text-white text-sm font-bold">P</div>
              <span className="font-semibold tracking-tight">predictly</span>
            </div>
            <p className="text-sm text-fg-muted max-w-xs leading-relaxed">
              The world&apos;s information network. Trade on real-world events
              from politics to crypto, sports, and beyond.
            </p>
            <div className="mt-4 flex gap-2">
              {[Twitter, MessageCircle, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Markets', links: ['Politics', 'Crypto', 'Sports', 'Tech', 'Economics'] },
            { title: 'Platform', links: ['How it works', 'Fees', 'API', 'Resolution sources'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-fg-muted hover:text-fg transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} Predictly. Demo UI — not a real exchange.
          </p>
          <div className="flex gap-4 text-xs text-fg-subtle">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Disclaimers</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
