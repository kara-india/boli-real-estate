'use client'

import Link from 'next/link'
import { useSupabase } from '@/context/SupabaseContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Building, LogOut, User } from 'lucide-react'

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

    const isActive = (path: string) => pathname === path ? 'text-gold-dark font-bold' : 'text-gray-500 hover:text-gold-dark'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                            <span className="font-bold text-xl text-gold-dark group-hover:text-white">B</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-gold-dark transition-colors">
                                BidMetric
                            </h1>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Smart Real Estate</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className={`text-sm tracking-wide transition-colors ${isActive('/')}`}>
                            Home
                        </Link>
                        <Link href="/listings" className={`text-sm tracking-wide transition-colors ${isActive('/listings')}`}>
                            Browse
                        </Link>
                        <Link href="/analytics" className={`text-sm tracking-wide transition-colors ${isActive('/analytics')}`}>
                            Analytics
                        </Link>
                        <Link href="/partners" className={`text-sm tracking-wide transition-colors ${isActive('/partners')}`}>
                            Partners
                        </Link>
                        {session && (
                            <>
                                <Link href="/dashboard" className={`text-sm tracking-wide transition-colors ${isActive('/dashboard')}`}>
                                    My Bids
                                </Link>
                                <Link href="/dashboard/seller" className={`text-sm tracking-wide transition-colors ${isActive('/dashboard/seller')}`}>
                                    My Listings
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Auth & Profile */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-100">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-xs text-gray-400 font-medium">Signed in as</div>
                                        <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{session.user?.email}</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-500">
                                        <User size={18} />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 text-sm font-bold bg-gold text-white rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-gold/30 hover:-translate-y-0.5 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
