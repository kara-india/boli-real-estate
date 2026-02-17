
'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowLeft, Building, Sparkles } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            })
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Registration successful! Check your email to confirm.')
                router.refresh()
                router.push('/')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
            {/* Form Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white order-2 md:order-1">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-dark font-bold text-xs uppercase tracking-widest mb-12 transition-colors">
                        <ArrowLeft size={16} /> Home
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Establish Account</h2>
                        <p className="text-gray-400 font-medium">Begin your professional bidding journey today.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
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
                            className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <span>Initialize Access</span>}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-sm font-medium text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-black text-gray-900 hover:text-gold-dark transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Branding Side */}
            <div className="hidden md:flex md:w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden p-12 order-1 md:order-2">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/10 rounded-full -ml-64 -mt-64 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full -mr-64 -mb-64 blur-3xl"></div>

                <div className="relative z-10 max-w-md text-white">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-900 text-3xl font-black mb-8">B</div>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6">Invest with <br /><span className="text-gold">Intelligence.</span></h1>
                    <p className="text-xl text-gray-400 font-light leading-relaxed">Join 1,200+ partners who skip the guesswork and use BidMetric for fair property valuation.</p>

                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-4 py-3 px-6 bg-white/5 border border-white/10 rounded-2xl w-fit">
                            <Sparkles className="text-gold" size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-200">AI-Powered Forecasting</span>
                        </div>
                        <div className="flex items-center gap-4 py-3 px-6 bg-white/5 border border-white/10 rounded-2xl w-fit">
                            <Building className="text-gold" size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-200">Direct-to-Owner Portal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
