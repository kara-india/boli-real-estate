'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    User, ShieldCheck, Briefcase, ChevronRight, ArrowLeft,
    MapPin, Phone, Mail, Lock, Building2, FileText,
    CheckCircle2, Upload, Info, Loader2, Rocket,
    Key, MailWarning, Globe, Sparkles, Check, Send, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

type Role = 'buyer' | 'rera_seller' | 'channel_partner';
type Step = 'role' | 'identity' | 'verification' | 'details' | 'success';
type AuthMethod = 'google' | 'email' | 'none';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Core State
    const [step, setStep] = useState<Step>('role');
    const [role, setRole] = useState<Role>('buyer');
    const [authMethod, setAuthMethod] = useState<AuthMethod>('none');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        pincode: '',
        otp: '',
        businessName: '',
        reraNumber: '',
        officeAddress: '',
        partnerType: 'Referral Partner',
        territory: [] as string[],
        localities: [] as string[],
        commission: '',
        agencyLogo: null as string | null,
        bio: '',
    });

    // Handle OAuth Callback
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && step === 'role') {
                setAuthMethod('google');
                setFormData(prev => ({
                    ...prev,
                    email: session.user.email || '',
                    fullName: session.user.user_metadata.full_name || prev.fullName
                }));
                setIsEmailVerified(true); // Google emails are pre-verified
                setStep('identity');
            }
        };
        checkSession();
    }, [supabase, step]);

    // EMAIL OTP LOGIC
    const handleSendEmailOtp = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            toast.error('Valid email address required');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: formData.email,
            options: {
                shouldCreateUser: true,
            }
        });
        if (error) {
            toast.error(error.message);
        } else {
            setIsOtpSent(true);
            toast.success('OTP sent to your email');
        }
        setLoading(false);
    };

    const handleVerifyEmailOtp = async () => {
        if (!formData.otp || formData.otp.length < 6) {
            toast.error('Enter 6-digit OTP');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            email: formData.email,
            token: formData.otp,
            type: 'email'
        });
        if (error) {
            toast.error(error.message);
        } else {
            setIsEmailVerified(true);
            setAuthMethod('email');
            toast.success('Email verified successfully');
        }
        setLoading(false);
    };

    // Navigation
    const nextStep = () => {
        if (step === 'role') setStep('identity');
        else if (step === 'identity') {
            if (role === 'buyer') {
                if (!isEmailVerified) {
                    toast.error('Email verification is mandatory');
                    return;
                }
                setStep('details');
            } else {
                if (authMethod === 'none') {
                    toast.error('Mandatory: Google or verified Email required');
                    return;
                }
                setStep('details');
            }
        }
    };

    const prevStep = () => {
        if (step === 'identity') setStep('role');
        else if (step === 'details') setStep('identity');
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/register`,
            }
        });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role, authMethod }),
            });
            if (!res.ok) throw new Error('Registration failed');
            setStep('success');
            toast.success('Account Ready!');
        } catch (err) {
            toast.error('Failed to complete setup.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans selection:bg-gold/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-4xl mx-auto">
                <div className="w-full max-w-2xl">

                    {/* Progress */}
                    {step !== 'success' && (
                        <div className="mb-12 flex items-center justify-between px-2">
                            <div className="flex gap-2">
                                {['role', 'identity', 'details'].map((s, idx) => (
                                    <div key={s} className={`h-1.5 rounded-full transition-all duration-700 ${['role', 'identity', 'details'].indexOf(step) >= idx ? 'w-12 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'w-6 bg-white/10'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">{step}</span>
                        </div>
                    )}

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">

                        {/* STEP 1: ROLE */}
                        {step === 'role' && (
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="mb-10">
                                    <h1 className="text-4xl font-black mb-3 tracking-tighter italic">Identify Yourself.</h1>
                                    <p className="text-gray-400 font-medium tracking-tight">Select your path to access Mira Road's best real estate deals.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'buyer', title: 'Home Buyer / Renter', icon: User, desc: 'Browse analytics, bid for properties and manage site visits.', badge: 'Free Forever' },
                                        { id: 'rera_seller', title: 'Authorized RERA Seller', icon: ShieldCheck, desc: 'Professional agent with full Golden Page features.', badge: 'RERA Req.' },
                                        { id: 'channel_partner', title: 'Developer / CP', icon: Briefcase, desc: 'High-volume relationship manager focus.', badge: 'Enterprise' }
                                    ].map((item) => (
                                        <button key={item.id} onClick={() => setRole(item.id as Role)} className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all text-left ${role === item.id ? 'bg-gold/10 border-gold shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${role === item.id ? 'bg-gold text-white rotate-6' : 'bg-white/5 text-gray-500'}`}>
                                                <item.icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-black text-xl tracking-tight">{item.title}</h3>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${role === item.id ? 'bg-gold text-white' : 'bg-white/10 text-gray-400'}`}>{item.badge}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                            <ChevronRight className={`transition-all duration-500 ${role === item.id ? 'text-gold translate-x-2' : 'text-white/5'}`} />
                                        </button>
                                    ))}
                                </div>
                                <button onClick={nextStep} className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl mt-12 hover:bg-gold hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4">Define Persona <ChevronRight size={16} /></button>
                            </div>
                        )}

                        {/* STEP 2: IDENTITY */}
                        {step === 'identity' && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                <button onClick={prevStep} className="group text-gray-500 hover:text-gold flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-10 transition-all">
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Step back
                                </button>
                                <h1 className="text-3xl font-black mb-2 italic">Verify your identity.</h1>
                                <p className="text-gray-400 mb-10 font-medium">Email verification is mandatory for all accounts.</p>

                                <div className="space-y-6">
                                    {/* Name & Pincode Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                            <input type="text" placeholder="Full Name*" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600" />
                                        </div>
                                        <div className="relative group">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                            <input type="text" placeholder="Pincode*" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600" />
                                        </div>
                                    </div>

                                    {/* Email Row */}
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="relative group flex-1">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                                <input type="email" disabled={isEmailVerified} placeholder="Verification Email*" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600 disabled:opacity-50" />
                                            </div>
                                            {!isEmailVerified && !isOtpSent && (
                                                <button onClick={handleSendEmailOtp} className="px-6 bg-gold text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-dark transition-all">Send OTP</button>
                                            )}
                                            {isEmailVerified && (
                                                <div className="px-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500"><Check size={14} /> Verified</div>
                                            )}
                                        </div>
                                        {isOtpSent && !isEmailVerified && (
                                            <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="relative group flex-1">
                                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" size={18} />
                                                    <input type="text" maxLength={6} placeholder="Enter 6-digit Email OTP" value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} className="w-full bg-gold/5 border border-gold/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:ring-gold" />
                                                </div>
                                                <button onClick={handleVerifyEmailOtp} className="px-8 bg-gold text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-dark">Verify</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Google Option (RHS) */}
                                    <div className="pt-2">
                                        <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div><span className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 bg-[#0A0A0B] px-4">Social Connect</span></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center text-[10px] text-gray-500 font-bold italic leading-tight">Link your Google account for faster one-tap access.</div>
                                            <button onClick={handleGoogleLogin} className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${authMethod === 'google' ? 'bg-gold/10 border-gold text-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'}`}>
                                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4" alt="G" /> Continue with Google
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Number (Upcoming) */}
                                    <div className="relative group opacity-50">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                        <input type="tel" disabled placeholder="Mobile Number" className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-[8px] font-black uppercase px-2 py-1 rounded tracking-tighter flex items-center gap-1"><Zap size={8} /> Upcoming</span>
                                    </div>
                                </div>
                                <button onClick={nextStep} disabled={!isEmailVerified} className={`w-full font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl mt-10 transition-all shadow-2xl flex items-center justify-center gap-4 ${!isEmailVerified ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gold text-white hover:bg-gold-dark'}`}>Proceed to Confirm <ChevronRight size={16} /></button>
                            </div>
                        )}

                        {/* STEP 4: DETAILS */}
                        {step === 'details' && (
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <h1 className="text-3xl font-black italic mb-8">Final Setup.</h1>
                                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                                    {role === 'buyer' ? (
                                        <div className="space-y-8 py-4">
                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center"><CheckCircle2 size={48} className="text-gold mx-auto mb-6" /><h3 className="text-xl font-black mb-2">Verified Identity</h3><p className="text-sm text-gray-500 font-medium">Your account is ready. Select your preferred localities to customize your feed.</p></div>
                                            <div className="flex flex-wrap gap-2">
                                                {['Mira Road East', 'Bhayandar West', 'Kanakia', 'Beverly Park'].map(l => (
                                                    <button key={l} onClick={() => setFormData({ ...formData, localities: formData.localities.includes(l) ? formData.localities.filter(x => x !== l) : [...formData.localities, l] })} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.localities.includes(l) ? 'bg-gold border-gold text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 py-2">
                                            <div className="relative group/input"><Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} /><input type="text" placeholder="Agency or Business Name*" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-gold/30" /></div>
                                            <div className="relative group/input"><ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} /><input type="text" placeholder="MAHARERA Number*" value={formData.reraNumber} onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })} className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-gold/30" /></div>
                                            <textarea placeholder="Office Address*" value={formData.officeAddress} onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })} className="w-full bg-white/5 border-none rounded-3xl py-6 px-8 text-sm font-bold h-32 resize-none" />
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleFinalSubmit} disabled={loading} className="w-full bg-gold text-white font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl mt-12 hover:bg-gold-dark transition-all disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <Rocket size={18} fill="currentColor" />} Go Live on BidMetric</button>
                            </div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 'success' && (
                            <div className="animate-in fade-in zoom-in duration-1000 text-center py-10">
                                <div className="w-28 h-28 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-10"><Rocket size={56} className="animate-bounce" /></div>
                                <h1 className="text-5xl font-black mb-4 italic tracking-tighter uppercase tracking-[0.1em]">Verified.</h1>
                                <p className="text-gray-400 mb-12 font-medium max-w-sm mx-auto leading-relaxed">Welcome to BidMetric. Your secure profile for Mira Road deals is active.</p>
                                <button onClick={() => router.push(role === 'buyer' ? '/buyer/home' : '/dashboard')} className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl hover:bg-gold hover:text-white transition-all shadow-2xl">Enter Dashboard</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center"><Loader2 className="w-12 h-12 text-gold animate-spin" /></div>}>
            <RegisterContent />
        </Suspense>
    );
}
