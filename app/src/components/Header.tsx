'use client'

import Link from 'next/link'
import { useSupabase } from '@/context/SupabaseContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function Header() {
    const { session } = useSupabase()
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        toast.success('Signed out successfully')
        router.refresh()
        router.push('/')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center neon-glow">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold neon-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                BidMetric
                            </h1>
                            <p className="text-xs text-gray-400">Smart Real Estate</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/listings"
                            className={`text-sm font-medium transition-all hover:text-blue-400 ${pathname === '/listings' ? 'text-blue-400' : 'text-gray-300'
                                }`}
                        >
                            Browse Properties
                        </Link>
                        <Link
                            href="/analytics"
                            className={`text-sm font-medium transition-all hover:text-purple-400 ${pathname === '/analytics' ? 'text-purple-400' : 'text-gray-300'
                                }`}
                        >
                            Price Analytics
                        </Link>
                        {session && (
                            <Link
                                href="/dashboard"
                                className={`text-sm font-medium transition-all hover:text-pink-400 ${pathname === '/dashboard' ? 'text-pink-400' : 'text-gray-300'
                                    }`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {session ? (
                            <>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                        {session.user?.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-white">{session.user?.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 glass rounded-lg text-sm text-white hover:bg-white/20 transition-all"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 glass rounded-lg text-sm text-white hover:bg-white/20 transition-all"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg text-sm text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
