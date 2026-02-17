'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    User, ShieldCheck, Briefcase, ChevronRight, ArrowLeft,
    MapPin, Phone, Mail, Lock, Building2, FileText,
    CheckCircle2, Upload, Info, Loader2, Rocket,
    Key, MailWarning, Globe, Sparkles, Check, Send
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
    const [verifyPhoneNow, setVerifyPhoneNow] = useState(true);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '', // For email auth
        pincode: '',
        otp: '',
        // Role specific (For Golden Page)
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

    // Handle OAuth Callback Redirects
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && step === 'role') {
                // If user came back from Google, move them to details
                setAuthMethod('google');
                setFormData(prev => ({
                    ...prev,
                    email: session.user.email || '',
                    fullName: session.user.user_metadata.full_name || prev.fullName
                }));
                // For buyers, we still need phone if they didn't do it yet
                // But usually social auth is the first thing. 
                // Given the new rule: Phone first for buyers.
                setStep('identity');
            }
        };
        checkSession();
    }, [supabase, step]);

    // OTP Logic
    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            toast.error('Valid 10-digit phone number required');
            return;
        }
        setLoading(true);
        // Using +91 as default based on Mira Road context
        const { error } = await supabase.auth.signInWithOtp({
            phone: `+91${formData.phone}`,
        });
        if (error) {
            toast.error(error.message);
        } else {
            setIsOtpSent(true);
            toast.success('OTP sent successfully');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp || formData.otp.length < 4) {
            toast.error('Valid OTP required');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            phone: `+91${formData.phone}`,
            token: formData.otp,
            type: 'sms'
        });
        if (error) {
            toast.error(error.message);
        } else {
            setIsPhoneVerified(true);
            toast.success('Phone verified successfully');
        }
        setLoading(false);
    };

    // Navigation Logic
    const nextStep = () => {
        if (step === 'role') setStep('identity');
        else if (step === 'identity') {
            if (role === 'buyer') {
                if (!isPhoneVerified) {
                    toast.error('Phone verification is mandatory for Buyers');
                    return;
                }
                setStep('details');
            } else {
                // Seller/CP
                if (authMethod === 'none') {
                    toast.error('Mandatory: Please use Google or Email to continue');
                    return;
                }
                if (formData.phone && verifyPhoneNow && !isPhoneVerified) {
                    setStep('verification');
                } else {
                    setStep('details');
                }
            }
        }
        else if (step === 'verification') setStep('details');
    };

    const prevStep = () => {
        if (step === 'identity') setStep('role');
        else if (step === 'verification') setStep('identity');
        else if (step === 'details') {
            setStep('identity');
        }
    };

    const handleGoogleLogin = async () => {
        if (role === 'buyer' && !isPhoneVerified) {
            toast.error('Verify phone number first');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/register`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
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
            toast.success('Onboarding Successful!');
        } catch (err) {
            toast.error('Failed to complete setup. Please try again.');
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

                    {/* Header Progress */}
                    {step !== 'success' && (
                        <div className="mb-12 flex items-center justify-between px-2">
                            <div className="flex gap-2">
                                {['role', 'identity', 'verification', 'details'].map((s, idx) => {
                                    const steps = ['role', 'identity', 'verification', 'details'];
                                    const currentIdx = steps.indexOf(step);
                                    if (role === 'buyer' && s === 'verification') return null; // Skip separate verification step for buyer
                                    return (
                                        <div
                                            key={s}
                                            className={`h-1.5 rounded-full transition-all duration-700 ${currentIdx >= idx ? 'w-12 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'w-6 bg-white/10'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">{step}</span>
                        </div>
                    )}

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">

                        {/* STEP 1: ROLE SELECTION */}
                        {step === 'role' && (
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="mb-10">
                                    <h1 className="text-4xl font-black mb-3 tracking-tighter italic">Identify Yourself.</h1>
                                    <p className="text-gray-400 font-medium tracking-tight">Select your professional standing to access the platform.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'buyer', title: 'Home Buyer / Renter', icon: User, desc: 'Browse analytics, bid for properties and manage site visits.', badge: 'Free Forever' },
                                        { id: 'rera_seller', title: 'Authorized RERA Seller', icon: ShieldCheck, desc: 'Professional agent with full Golden Page features and lead capture.', badge: 'RERA Req.' },
                                        { id: 'channel_partner', title: 'Developer / CP', icon: Briefcase, desc: 'High-volume relationship manager with secondary market focus.', badge: 'Enterprise' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setRole(item.id as Role)}
                                            className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all group/btn text-left relative ${role === item.id ? 'bg-gold/10 border-gold shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${role === item.id ? 'bg-gold text-white rotate-6' : 'bg-white/5 text-gray-500 group-hover/btn:text-gray-300'
                                                }`}>
                                                <item.icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-black text-xl tracking-tight">{item.title}</h3>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${role === item.id ? 'bg-gold text-white' : 'bg-white/10 text-gray-400'
                                                        }`}>{item.badge}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                            <ChevronRight className={`transition-all duration-500 ${role === item.id ? 'text-gold translate-x-2' : 'text-white/5'}`} />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl mt-12 hover:bg-gold hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98]"
                                >
                                    Define Persona <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: IDENTITY SETUP */}
                        {step === 'identity' && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                <button onClick={prevStep} className="group text-gray-500 hover:text-gold flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-10 transition-all">
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Step back
                                </button>

                                <h1 className="text-3xl font-black mb-2 italic">How should we recognize you?</h1>
                                <p className="text-gray-400 mb-10 font-medium">
                                    {role === 'buyer'
                                        ? "Phone is mandatory. Google or Email is optional but recommended."
                                        : "Google or Email authentication is mandatory for professional accounts."}
                                </p>

                                <div className="space-y-6">
                                    {/* Traditional Inputs Section */}
                                    <div className="space-y-5">
                                        {/* Name & Pincode */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Pincode"
                                                    value={formData.pincode}
                                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Mobile Section (Mandatory for Buyer) */}
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="relative group flex-1">
                                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                                    <input
                                                        type="tel"
                                                        disabled={isPhoneVerified}
                                                        placeholder={role === 'buyer' ? "Mobile Number (Mandatory)*" : "Mobile Number (Optional)"}
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600 disabled:opacity-50"
                                                    />
                                                </div>
                                                {role === 'buyer' && !isPhoneVerified && !isOtpSent && (
                                                    <button
                                                        onClick={handleSendOtp}
                                                        className="px-6 bg-gold/10 border border-gold/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all whitespace-nowrap"
                                                    >
                                                        Send OTP
                                                    </button>
                                                )}
                                                {isPhoneVerified && (
                                                    <div className="px-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                                        <Check size={14} /> Verified
                                                    </div>
                                                )}
                                            </div>

                                            {/* OTP Input for Buyer */}
                                            {role === 'buyer' && isOtpSent && !isPhoneVerified && (
                                                <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="relative group flex-1">
                                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gold transition-colors" size={18} />
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            placeholder="Enter 6-digit OTP"
                                                            value={formData.otp}
                                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                                            className="w-full bg-gold/5 border border-gold/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleVerifyOtp}
                                                        className="px-8 bg-gold text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-dark transition-all"
                                                    >
                                                        Verify
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                            <span className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 bg-[#0A0A0B]/80 px-4 italic">Optional Identity Linking</span>
                                        </div>

                                        {/* Email & Google Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Email Input */}
                                            <div className={`relative group transition-all ${(role === 'buyer' && authMethod !== 'email') ? 'opacity-80' : ''}`}>
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder={role === 'buyer' ? "Email (Optional)" : "Email (Mandatory)*"}
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, email: e.target.value });
                                                        if (e.target.value) setAuthMethod('email');
                                                    }}
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                />
                                            </div>

                                            {/* Google Button (RHS of Email) */}
                                            <button
                                                onClick={handleGoogleLogin}
                                                disabled={role === 'buyer' && !isPhoneVerified}
                                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest relative overflow-hidden group/g ${authMethod === 'google'
                                                        ? 'bg-gold/10 border-gold text-white'
                                                        : (role === 'buyer' && !isPhoneVerified)
                                                            ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed grayscale'
                                                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                                                    }`}
                                            >
                                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-4 h-4" alt="G" />
                                                Continue with Google
                                                {role === 'buyer' && !isPhoneVerified && <Lock size={12} className="opacity-50" />}
                                            </button>
                                        </div>

                                        {/* Phone Verification Toggle for Professional Roles */}
                                        {role !== 'buyer' && formData.phone && (
                                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <input
                                                    type="checkbox"
                                                    id="verifyPhoneNow"
                                                    checked={verifyPhoneNow}
                                                    onChange={(e) => setVerifyPhoneNow(e.target.checked)}
                                                    className="w-5 h-5 rounded border-white/20 text-gold bg-transparent focus:ring-gold"
                                                />
                                                <label htmlFor="verifyPhoneNow" className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer">
                                                    Verify mobile number now via OTP (Optional)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={nextStep}
                                    disabled={role === 'buyer' && !isPhoneVerified}
                                    className={`w-full font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl mt-10 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] ${(role === 'buyer' && !isPhoneVerified)
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : 'bg-gold text-white hover:bg-gold-dark'
                                        }`}
                                >
                                    Proceed to Confirm <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STEP 3: VERIFICATION (FOR PROFESSIONAL ROLES) */}
                        {step === 'verification' && (
                            <div className="animate-in fade-in zoom-in duration-700 text-center">
                                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative">
                                    <Key size={40} className="animate-pulse" />
                                    <div className="absolute inset-0 rounded-full border border-gold/30 animate-ping opacity-20" />
                                </div>
                                <h1 className="text-4xl font-black mb-3 italic tracking-tight">Security Check.</h1>
                                <p className="text-gray-400 mb-12 font-medium">Verify code sent to <span className="text-gold font-black">+91 {formData.phone}</span></p>

                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="• • • • • •"
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-8 text-center text-5xl font-black tracking-[0.5em] focus:border-gold/50 focus:ring-0 transition-all mb-10 text-white selection:bg-transparent"
                                    value={formData.otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, otp: val });
                                        if (val.length === 6) {
                                            handleVerifyOtp().then(() => setStep('details'));
                                        }
                                    }}
                                />

                                <div className="flex flex-col gap-3">
                                    <button onClick={handleSendOtp} className="text-gold text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Resend Code</button>
                                    <button onClick={() => setStep('details')} className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Skip for Now</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: PROFESSIONAL DETAILS (FOR GOLDEN PAGE) */}
                        {step === 'details' && (
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h1 className="text-3xl font-black italic tracking-tighter">
                                            {role === 'buyer' ? 'Final Preferences.' : 'Golden Page Setup.'}
                                        </h1>
                                        <p className="text-gray-400 font-medium tracking-tight">
                                            {role === 'buyer' ? 'Almost ready to start bidding.' : 'Establishing your professional digital presence.'}
                                        </p>
                                    </div>
                                    <div className="bg-gold/10 p-4 rounded-3xl border border-gold/20 flex flex-col items-center">
                                        <Globe className="text-gold mb-1" size={20} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gold text-center">Public <br /> Profile</span>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                                    {role === 'buyer' ? (
                                        <div className="space-y-8 py-4">
                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center">
                                                <CheckCircle2 size={48} className="text-gold mx-auto mb-6" />
                                                <h3 className="text-xl font-black mb-2">Verified Identity</h3>
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                    Your mobile <span className="text-white">+91 {formData.phone}</span> is now linked.
                                                    {authMethod === 'google' ? ' Google profile linked successfully.' : ' You can optionally link Google for easier login later.'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                    <MapPin size={12} className="text-gold" /> Favorite Localities (Optional)
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Mira Road East', 'Bhayandar West', 'Kanakia', 'Beverly Park', 'Shanti Park', 'Delta Gardens'].map(l => (
                                                        <button
                                                            key={l}
                                                            onClick={() => {
                                                                const exists = formData.localities.includes(l);
                                                                setFormData({
                                                                    ...formData,
                                                                    localities: exists ? formData.localities.filter(x => x !== l) : [...formData.localities, l]
                                                                });
                                                            }}
                                                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.localities.includes(l) ? 'bg-gold border-gold text-white shadow-xl shadow-gold/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                                                }`}
                                                        >
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 py-2">
                                            {/* Business Identity */}
                                            <div className="space-y-5">
                                                <div className="relative group/input">
                                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 transition-colors" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="Agency or Business Name*"
                                                        value={formData.businessName}
                                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                        className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                    />
                                                </div>
                                                <div className="relative group/input">
                                                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 transition-colors" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="MAHARERA Registration Number*"
                                                        value={formData.reraNumber}
                                                        onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                                                        className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600"
                                                    />
                                                </div>
                                                <div className="relative group/input">
                                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 transition-colors" size={20} />
                                                    <textarea
                                                        placeholder="Full Office Address (Street, City, Pincode)*"
                                                        value={formData.officeAddress}
                                                        onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                                                        className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600 h-32 resize-none"
                                                    />
                                                </div>
                                                <div className="relative group/input">
                                                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 transition-colors" size={20} />
                                                    <textarea
                                                        placeholder="Agent Bio / Agency Tagline (Example: Mira Road's most trusted luxury realtor for 10 years.)*"
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        className="w-full bg-white/5 border-none rounded-3xl py-6 pl-16 pr-6 text-sm font-bold focus:ring-1 focus:ring-gold/30 placeholder:text-gray-600 h-24 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Media Upload */}
                                            <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center hover:border-gold/30 transition-all bg-white/[0.01] group/logo">
                                                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-gray-500 group-hover/logo:bg-gold/10 group-hover/logo:text-gold transition-all duration-500">
                                                    <FileText size={24} />
                                                </div>
                                                <h4 className="text-lg font-black tracking-tight mb-2 italic">Upload Company Logo</h4>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] max-w-xs mx-auto">SVG, PNG or JPG (Min 200x200px). This will appear on all your listings.</p>
                                                <button className="mt-8 text-gold text-[10px] font-black uppercase tracking-[0.3em] bg-gold/5 px-6 py-3 rounded-xl border border-gold/10 hover:bg-gold hover:text-white transition-all">Select File</button>
                                            </div>

                                            {/* Partner Specifics */}
                                            {role === 'channel_partner' && (
                                                <div className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                            <Briefcase size={12} /> Partner Classification
                                                        </label>
                                                        <select
                                                            className="w-full bg-[#0A0A0B] border-none rounded-2xl py-4 px-6 text-sm font-black appearance-none focus:ring-1 focus:ring-gold/30"
                                                            value={formData.partnerType}
                                                            onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                                                        >
                                                            <option>Referral Partner</option>
                                                            <option>Exclusive Mandate Partner</option>
                                                            <option>Developer Direct Team</option>
                                                            <option>Institutional Broker</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12">
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading}
                                        className="w-full bg-gold text-white font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl hover:bg-gold-dark transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Rocket size={18} fill="currentColor" />}
                                        Initialize My Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: SUCCESS & WELCOME */}
                        {step === 'success' && (
                            <div className="animate-in fade-in zoom-in duration-1000 text-center py-10">
                                <div className="w-28 h-28 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-10 shadow-[0_0_80px_rgba(212,175,55,0.2)]">
                                    <Rocket size={56} className="animate-bounce" />
                                </div>
                                <h1 className="text-5xl font-black mb-4 italic tracking-tighter uppercase tracking-[0.1em]">Authenticated.</h1>
                                <p className="text-gray-400 mb-12 font-medium max-w-sm mx-auto leading-relaxed">
                                    {role === 'buyer'
                                        ? "Welcome to BidMetric. Your secure buyer profile is active and ready for Mira Road property deals."
                                        : "Your professional Golden Page is now public. You can start capturing quality leads and managing listings immediately."}
                                </p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => router.push(role === 'buyer' ? '/buyer/home' : '/dashboard')}
                                        className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-3xl hover:bg-gold hover:text-white transition-all shadow-2xl"
                                    >
                                        Enter Dashboard
                                    </button>
                                    <button className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-gold transition-colors">
                                        Take a Feature Tour
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Branding */}
                    {step !== 'success' && (
                        <div className="mt-12 flex items-center justify-between opacity-30 animated-in duration-1000 slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by BidMetric AI</span>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role.replace('_', ' ')} path</span>
                            </div>
                            <img src="/logo-mini.png" className="h-6 grayscale" alt="" />
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.15);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.4);
                }
            `}</style>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-gold animate-spin" />
                    <p className="text-gold font-black uppercase tracking-widest text-[10px]">Initializing Secure Flow...</p>
                </div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
