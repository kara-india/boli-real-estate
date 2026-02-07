import Header from '@/components/Header'
import AnimatedBackground from '@/components/AnimatedBackground'
import Link from 'next/link'
import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await getServerSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      <AnimatedBackground />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 neon-text">
              Welcome to <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Boli</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              The Future of Real Estate Trading • Smart Bidding • Live Analytics
            </p>
          </div>

          {/* CTA Buttons */}
          {!session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 neon-glow"
              >
                🚀 Register Now
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                🔐 Log In
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center items-center mb-16">
              <Link
                href="/listings"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                🏠 Browse Properties
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                📊 My Dashboard
              </Link>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="glass-dark rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏘️
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Premium Listings
              </h3>
              <p className="text-gray-300 mb-4">
                Browse verified properties across Mira Road with detailed information and high-quality images
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs">Verified</span>
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs">HD Photos</span>
                <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs">Virtual Tours</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-dark rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Bidding
              </h3>
              <p className="text-gray-300 mb-4">
                Place competitive bids within seller-defined ranges and get instant notifications
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">Real-time</span>
                <span className="px-3 py-1 bg-pink-500/20 rounded-full text-xs">Secure</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">Transparent</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-dark rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Live Analytics
              </h3>
              <p className="text-gray-300 mb-4">
                Track 5-year price trends, appreciation rates, and make data-driven decisions
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 bg-orange-500/20 rounded-full text-xs">Historical</span>
                <span className="px-3 py-1 bg-red-500/20 rounded-full text-xs">Predictive</span>
                <span className="px-3 py-1 bg-orange-500/20 rounded-full text-xs">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="glass-dark rounded-3xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  30+
                </div>
                <div className="text-gray-400">Active Listings</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  ₹6K-10K
                </div>
                <div className="text-gray-400">Price Range/sqft</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  4
                </div>
                <div className="text-gray-400">Prime Zones</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  5 Years
                </div>
                <div className="text-gray-400">Historical Data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      {!session && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-dark rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join Boli today and get access to exclusive property listings, smart bidding tools, and comprehensive market analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2026 Boli. Powered by Next.js, Prisma & AI.</p>
        </div>
      </footer>
    </div>
  )
}
