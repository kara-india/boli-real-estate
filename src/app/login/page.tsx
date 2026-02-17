
'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Welcome back to BidMetric')
                router.refresh()
                router.push('/')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            })
            if (error) throw error
        } catch (error) {
            toast.error('Error logging in with Google')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
            {/* Left Side: Branding / Visual */}
            <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center relative overflow-hidden p-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full -ml-64 -mb-64 blur-3xl"></div>

                <div className="relative z-10 max-w-md">
                    <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-8 shadow-2xl shadow-gold/20">B</div>
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6 italic">Secure property acquisition.</h1>
                    <p className="text-xl text-gray-500 font-light leading-relaxed">Join the most transparent real estate bidding platform in the city.</p>

                    <div className="mt-12 flex items-center gap-3 py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm w-fit">
                        <ShieldCheck className="text-gold" />
                        <span className="text-sm font-bold text-gray-800 uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-dark font-bold text-xs uppercase tracking-widest mb-12 transition-colors">
                        <ArrowLeft size={16} /> Home
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-400 font-medium">Continue your real estate journey.</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Professional Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Private Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[46px] text-gray-300 hover:text-gold transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <span>Authorize Access</span>}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">Gateway Partners</span></div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-5 py-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-all font-bold text-gray-700 text-sm shadow-sm"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21h-.19z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Authenticate with Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-sm font-medium text-gray-400">
                        New to the platform?{' '}
                        <Link href="/signup" className="font-black text-gray-900 hover:text-gold-dark transition-colors">
                            Establish Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
