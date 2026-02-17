
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Zap, ArrowRight, Building, Award, Users } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Fallback: If Supabase redirects here instead of /auth/callback
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gold/20 relative">
      <script dangerouslySetInnerHTML={{
        __html: `
          const url = new URL(window.location.href);
          if (url.searchParams.has('code')) {
            window.location.href = '/auth/callback' + window.location.search;
          }
        `
      }} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-xs font-bold uppercase tracking-widest border border-gold/20">
            <Award size={14} className="text-gold" />
            V 2.0 Now Live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900">
            Real Estate Intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-dark to-gold">
              & Transparent Bidding
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Stop guessing prices. See the true market value backed by predictive AI and participate in fair, transparent local auctions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* CTA Handling based on session */}
            {!session ? (
              <>
                <Link href="/listings" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:-translate-y-1">
                  Browse Properties
                </Link>
                <Link href="/partners" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all hover:-translate-y-1 flex items-center gap-2">
                  Browse Partners <Users size={18} />
                </Link>
                <Link href="/register" className="px-8 py-4 bg-gold text-white rounded-xl font-bold text-lg hover:bg-gold-dark transition-all flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-gold/20">
                  Get Started <ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/listings" className="px-8 py-4 bg-gold text-white rounded-xl font-bold text-lg hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 hover:-translate-y-1">
                  Browse Properties
                </Link>
                <Link href="/partners" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all hover:-translate-y-1 flex items-center gap-2">
                  Browse Partners <Users size={18} />
                </Link>
                <Link href="/dashboard" className="px-8 py-4 bg-gray-900 text-white border border-gray-900 rounded-xl font-bold text-lg hover:bg-black transition-all hover:-translate-y-1">
                  My Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Why top brokers use BidMetric</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gold/20 transition-all group">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} className="text-gold-dark" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fair Valuation</h3>
              <p className="text-gray-500 leading-relaxed">
                BidMetric AI analyzes 50+ factors including HPI, infrastructure, and builder reputation to give you a fair price.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real-Time Bidding</h3>
              <p className="text-gray-500 leading-relaxed">
                Participate in transparent auctions. See active bids live and place your offer with confidence using our smart slider.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all group">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">City Intelligence</h3>
              <p className="text-gray-500 leading-relaxed">
                Understand price drivers: Metro lines, upcoming infrastructure projects, and zoning plans for every locality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 font-medium">© 2026 BidMetric. <span className="text-gray-300">|</span> Smart Real Estate.</p>
        </div>
      </footer>
    </div>
  )
}
