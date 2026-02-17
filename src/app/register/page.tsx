'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, ShieldCheck, Briefcase, ChevronRight, ArrowLeft,
    MapPin, Phone, Mail, Lock, Building2, FileText,
    CheckCircle2, Upload, Info, Loader2, Rocket
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Role = 'buyer' | 'rera_seller' | 'channel_partner';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'role' | 'basic' | 'otp' | 'details' | 'success'>('role');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<Role>('buyer');

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        pincode: '',
        otp: '',
        // Role specific
        businessName: '',
        reraNumber: '',
        officeAddress: '',
        partnerType: 'Referral Partner',
        territory: [] as string[],
        localities: [] as string[],
        commission: '',
    });

    const handleNext = () => {
        if (step === 'role') setStep('basic');
        else if (step === 'basic') {
            if (!formData.fullName || !formData.phone || !formData.pincode) {
                toast.error('Please fill all required fields');
                return;
            }
            setStep('otp');
        }
        else if (step === 'otp') setStep('details');
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            // Simulate API call
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role }),
            });

            if (!res.ok) throw new Error('Registration failed');

            const data = await res.json();
            setStep('success');
            toast.success('Registration Complete!');
        } catch (err) {
            toast.error('Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans selection:bg-gold/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-xl">

                    {/* Progress Indicator */}
                    {step !== 'success' && (
                        <div className="mb-12 flex justify-center gap-2">
                            {['role', 'basic', 'otp', 'details'].map((s, idx) => (
                                <div
                                    key={s}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${['role', 'basic', 'otp', 'details'].indexOf(step) >= idx
                                        ? 'w-12 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                        : 'w-6 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Stepper Content */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">

                        {/* 1. Role Selection */}
                        {step === 'role' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-4xl font-black mb-2 tracking-tight">Register As</h1>
                                <p className="text-gray-400 mb-8 font-medium">Select a role to get started.</p>

                                <button
                                    onClick={async () => {
                                        const supabase = (await import('@/lib/supabase/client')).createClient();
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: `${window.location.origin}/auth/callback?next=/register` }
                                        });
                                    }}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-bold text-white text-sm mb-8 shadow-xl"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21h-.19z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Quick Register with Google
                                </button>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-gray-500"><span className="px-4 bg-[#0A0A0B]">Or Manual Path</span></div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'buyer', title: 'Buyer', icon: User, desc: 'Browse properties & send visit requests.' },
                                        { id: 'rera_seller', title: 'Authorized RERA Seller', icon: ShieldCheck, desc: 'List properties & get a verified Golden Page.' },
                                        { id: 'channel_partner', title: 'Channel Partner', icon: Briefcase, desc: 'Partner with projects & manage leads.' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setRole(item.id as Role)}
                                            className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all group/btn text-left ${role === item.id
                                                ? 'bg-gold/10 border-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${role === item.id ? 'bg-gold text-white' : 'bg-white/5 text-gray-400'
                                                }`}>
                                                <item.icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-lg">{item.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                            </div>
                                            <ChevronRight className={`transition-transform ${role === item.id ? 'text-gold translate-x-1' : 'text-white/10'}`} />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl mt-10 hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* 2. Basic Details */}
                        {step === 'basic' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <button onClick={() => setStep('role')} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <h1 className="text-3xl font-black mb-8 tracking-tight">Tell us about yourself</h1>

                                <div className="space-y-5">
                                    <div className="relative group/input">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-gold transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-gold transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            placeholder="Primary Phone (OTP)"
                                            className="w-full bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group/input">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-gold transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Pincode (e.g. 400050)"
                                            className="w-full bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-col gap-4">
                                    <button
                                        onClick={handleNext}
                                        className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        Verify via OTP <ChevronRight size={16} />
                                    </button>
                                    <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        By continuing, you agree to our Terms & Privacy Policy.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 3. OTP Verification */}
                        {step === 'otp' && (
                            <div className="animate-in fade-in zoom-in duration-500 text-center">
                                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8">
                                    <CheckCircle2 size={40} className="animate-pulse" />
                                </div>
                                <h1 className="text-3xl font-black mb-2 tracking-tight italic uppercase">Verify Phone</h1>
                                <p className="text-gray-400 mb-10 font-medium">OTP sent to <span className="text-white">+91 {formData.phone}</span></p>

                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="• • • •"
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] focus:border-gold/50 focus:ring-0 transition-all mb-8"
                                    value={formData.otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, otp: val });
                                        if (val.length === 4) handleNext();
                                    }}
                                />

                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    Didn't receive code? <button className="text-gold hover:underline">Resend OTP</button>
                                </p>
                            </div>
                        )}

                        {/* 4. Role-Specific Details */}
                        {step === 'details' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-3xl font-black mb-2 tracking-tight">Final Details</h1>
                                <p className="text-gray-400 mb-8 font-medium">Help us personalize your Experience.</p>

                                <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">

                                    {role === 'buyer' && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Preferred Localities</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Mira Road East', 'Bhayandar East', 'Kanakia', 'Beverly Park'].map(l => (
                                                        <button
                                                            key={l}
                                                            onClick={() => {
                                                                const exists = formData.localities.includes(l);
                                                                setFormData({
                                                                    ...formData,
                                                                    localities: exists ? formData.localities.filter(x => x !== l) : [...formData.localities, l]
                                                                });
                                                            }}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formData.localities.includes(l) ? 'bg-gold border-gold text-white' : 'bg-white/5 border-white/5 text-gray-400'
                                                                }`}
                                                        >
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'rera_seller' && (
                                        <div className="space-y-6">
                                            <div className="relative group/input">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Agency / Business Name*"
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 font-medium"
                                                    value={formData.businessName}
                                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative group/input">
                                                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="RERA Number (e.g. A517...)*"
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 font-medium"
                                                    value={formData.reraNumber}
                                                    onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl text-center group/upload hover:border-gold/50 cursor-pointer transition-all">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover/upload:bg-gold/10 group-hover/upload:text-gold transition-all">
                                                    <Upload size={20} />
                                                </div>
                                                <h4 className="text-sm font-black tracking-tight mb-1">Upload RERA Certificate</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">PDF or JPG (Max 10MB). We'll verify and add a "RERA Verified" badge.</p>
                                            </div>
                                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl">
                                                <div className="mt-1">
                                                    <input type="checkbox" className="w-5 h-5 rounded border-white/10 text-gold bg-transparent focus:ring-gold" id="authorize" />
                                                </div>
                                                <label htmlFor="authorize" className="text-[11px] text-gray-400 font-medium leading-relaxed uppercase tracking-tighter cursor-pointer">
                                                    I authorize Boli to show my agency as “Authorized RERA Seller” and display my credentials.
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'channel_partner' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Partner Type</label>
                                                <select
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold/50 font-medium appearance-none"
                                                    value={formData.partnerType}
                                                    onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                                                >
                                                    <option>Referral Partner</option>
                                                    <option>Builder Relationship Manager</option>
                                                    <option>Contractor / Broker Assoc</option>
                                                    <option>Loan Advisor</option>
                                                </select>
                                            </div>
                                            <div className="relative group/input">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Organization Name*"
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 font-medium"
                                                    value={formData.businessName}
                                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative group/input">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Office Address (Pincode, City)*"
                                                    className="w-full bg-white/5 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-gold/50 font-medium"
                                                    value={formData.officeAddress}
                                                    onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="mt-10">
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading}
                                        className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Rocket size={16} />}
                                        Complete Registration
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 5. Success Screen */}
                        {step === 'success' && (
                            <div className="animate-in fade-in zoom-in duration-700 text-center">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                                    <CheckCircle2 size={48} className="animate-bounce" />
                                </div>
                                <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Welcome to Boli</h1>
                                <p className="text-gray-400 mb-12 font-medium leading-relaxed">
                                    {role === 'buyer'
                                        ? "Start browsing Mira Road properties and book your first site visit today!"
                                        : "Your Golden Page has been auto-created. List your first property to appear at the top of buyer searches."}
                                </p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => router.push(role === 'buyer' ? '/buyer/home' : '/dashboard')}
                                        className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-[0.98]"
                                    >
                                        Go to {role === 'buyer' ? 'Home' : 'Dashboard'}
                                    </button>
                                    {role !== 'buyer' && (
                                        <button className="text-gold text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                            View your Golden Page
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Micro-Interaction Highlight */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[60px] translate-x-16 -translate-y-16 transition-opacity duration-700 ${step === 'success' ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    {/* Bottom Help */}
                    {step !== 'success' && (
                        <div className="mt-8 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-gold" /> SSL Secure
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <Info size={14} className="text-gold" /> Help Center
                            </div>
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
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}</style>
        </div>
    );
}
