'use client'

import Link from 'next/link'
import { useSupabase } from '@/context/SupabaseContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Building, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
    const { session } = useSupabase()
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        toast.success('Signed out successfully')
        setMobileMenuOpen(false)
        router.refresh()
        router.push('/')
    }

    const isActive = (path: string) => pathname === path ? 'text-gold-dark font-bold' : 'text-gray-500 hover:text-gold-dark'

    const closeMobileMenu = () => setMobileMenuOpen(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 md:gap-3 group" onClick={closeMobileMenu}>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                            <span className="font-bold text-lg md:text-xl text-gold-dark group-hover:text-white">B</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight group-hover:text-gold-dark transition-colors">
                                BidMetric
                            </h1>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-medium">Smart Real Estate</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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

                    {/* Desktop Auth & Profile */}
                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
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

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gold-dark hover:bg-gray-50 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="px-4 py-4 space-y-1">
                        <Link
                            href="/"
                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/')}`}
                            onClick={closeMobileMenu}
                        >
                            Home
                        </Link>
                        <Link
                            href="/listings"
                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/listings')}`}
                            onClick={closeMobileMenu}
                        >
                            Browse Properties
                        </Link>
                        <Link
                            href="/analytics"
                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/analytics')}`}
                            onClick={closeMobileMenu}
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/partners"
                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/partners')}`}
                            onClick={closeMobileMenu}
                        >
                            Partners
                        </Link>
                        {session && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/dashboard')}`}
                                    onClick={closeMobileMenu}
                                >
                                    My Bids
                                </Link>
                                <Link
                                    href="/dashboard/seller"
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/dashboard/seller')}`}
                                    onClick={closeMobileMenu}
                                >
                                    My Listings
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Auth Section */}
                    <div className="px-4 py-4 border-t border-gray-100">
                        {session ? (
                            <div className="space-y-3">
                                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Signed in as</div>
                                    <div className="text-sm font-bold text-gray-900 truncate">{session.user?.email}</div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-4 py-3 text-base font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    className="block w-full px-4 py-3 text-base font-bold text-center text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="block w-full px-4 py-3 text-base font-bold text-center bg-gold text-white rounded-lg shadow-lg shadow-gold/20 hover:bg-gold-dark transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
