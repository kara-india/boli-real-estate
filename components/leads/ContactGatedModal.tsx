'use client';

import React, { useState, useEffect } from 'react';
import {
    X, ShieldCheck, Phone, Mail, CheckCircle2,
    ChevronRight, Lock, Loader2, Zap,
    AlertCircle, Building2, MapPin, BadgeCheck,
    Clock, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        id: string;
        title: string;
        price: number;
        location: string;
        lister_id: string;
        lister_name: string;
        lister_phone: string; // Masked on server usually
    };
}

export default function ContactGatedModal({ isOpen, onClose, property }: ContactModalProps) {
    const [step, setStep] = useState<'info' | 'otp' | 'qualification' | 'result'>('info');
    const [loading, setLoading] = useState(false);
    const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        reason: 'Self Use',
        isDealer: false,
        loanInterest: false,
        siteVisit: false,
        timeline: 'Within 3 months',
        otp: ''
    });

    if (!isOpen) return null;

    const handleSubmitInfo = () => {
        if (!formData.name || !formData.phone) {
            toast.error('Please fill name and phone');
            return;
        }
        setStep('otp');
    };

    const handleVerifyOTP = () => {
        if (formData.otp.length === 4) {
            setStep('qualification');
        } else {
            toast.error('Enter 4-digit OTP');
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: property.id,
                    lister_id: property.lister_id,
                    buyer_name: formData.name,
                    buyer_phone: formData.phone,
                    buyer_email: formData.email,
                    intent_reason: formData.reason,
                    timeline: formData.timeline,
                    is_dealer: formData.isDealer,
                    home_loan_interest: formData.loanInterest,
                    site_visit_interest: formData.siteVisit,
                    otp: formData.otp
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.is_revealed) {
                // Now reveal actual number
                const revealRes = await fetch(`/api/reveal-number?lead_id=${data.lead_id}`);
                const revealData = await revealRes.json();
                setRevealedPhone(revealData.phone);
            }

            setStep('result');
            toast.success('Lead submitted successfully');
        } catch (err: any) {
            toast.error(err.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">

                {/* Header Section */}
                <div className="bg-gray-900 text-white p-8 md:p-10 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-center text-gold shrink-0">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-black italic tracking-tight">{property.lister_name}</h2>
                                <BadgeCheck size={16} className="text-blue-400" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                                {property.lister_phone.substring(0, 6)}****{property.lister_phone.substring(10)}
                            </p>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <MapPin size={12} className="text-gold" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight line-clamp-1">{property.title}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {step === 'info' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight uppercase italic">Secure Contact</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name*"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold text-sm focus:ring-2 focus:ring-gold/20"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Mobile Number (OTP required)*"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold text-sm focus:ring-2 focus:ring-gold/20"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Purpose</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-xs appearance-none"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        >
                                            <option>Self Use</option>
                                            <option>Investment</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Are you a Dealer?</label>
                                        <div className="flex bg-gray-50 rounded-2xl p-1">
                                            <button
                                                onClick={() => setFormData({ ...formData, isDealer: false })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isDealer ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                                            >No</button>
                                            <button
                                                onClick={() => setFormData({ ...formData, isDealer: true })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isDealer ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                                            >Yes</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmitInfo}
                                className="w-full bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl mt-8 hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                Continue <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="animate-in fade-in zoom-in duration-500 text-center">
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 italic">Verification</h3>
                            <p className="text-gray-400 text-xs font-medium mb-8">Enter 4-digit code sent to +91 {formData.phone}</p>

                            <input
                                type="text"
                                maxLength={4}
                                placeholder="0 0 0 0"
                                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-6 text-center text-3xl font-black tracking-[0.5em] focus:border-gold/30 transition-all mb-8"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            />

                            <button
                                onClick={handleVerifyOTP}
                                className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gold-dark transition-all flex items-center justify-center gap-3"
                            >
                                Verify OTP <CheckCircle2 size={16} />
                            </button>
                        </div>
                    )}

                    {step === 'qualification' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight italic uppercase">Help us help you</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">When are you planning to buy?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Within 3 months', '3-6 months', '6+ months'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setFormData({ ...formData, timeline: t })}
                                                className={`px-6 py-3 rounded-xl text-[10px] font-black border transition-all ${formData.timeline === t ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-400'}`}
                                            >{t}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { id: 'siteVisit', label: 'Interested in Site Visit', icon: MapPin },
                                        { id: 'loanInterest', label: 'Interested in Home Loan', icon: Zap }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFormData({ ...formData, [item.id]: !((formData as any)[item.id]) })}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${(formData as any)[item.id] ? 'bg-gold/5 border-gold/30 text-gold' : 'bg-gray-50 border-transparent text-gray-400'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} />
                                                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(formData as any)[item.id] ? 'border-gold bg-gold text-white' : 'border-gray-200'}`}>
                                                {(formData as any)[item.id] && <CheckCircle2 size={12} />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="mt-1">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-200 text-gold" />
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        I agree to the Terms & Privacy Policy and understand that the broker may contact me regarding this property.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="w-full bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl mt-8 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
                                Reveal Advertiser Details
                            </button>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="animate-in fade-in scale-95 duration-700 text-center py-6">
                            {revealedPhone ? (
                                <>
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8">
                                        <Phone size={40} className="animate-bounce" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 italic">Advertiser Details</h3>
                                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-8 inline-block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">Phone Number</p>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter select-none">{revealedPhone}</p>
                                        <p className="text-[10px] font-bold text-gold uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                                            <Clock size={12} /> Visible for 5 minutes
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl shadow-xl shadow-gray-200" onClick={() => window.location.href = `tel:${revealedPhone}`}>
                                            Call Now
                                        </button>
                                        <button className="bg-green-500 text-white px-8 rounded-2xl" onClick={() => window.open(`https://wa.me/${revealedPhone}`)}>
                                            <MessageSquare size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tighter uppercase">Request Sent</h3>
                                    <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">Your details have been shared. {property.lister_name} will contact you shortly regarding the site visit.</p>
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl"
                                    >
                                        Back to Listings
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Protection Note */}
                <div className="bg-gray-50 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                    <AlertCircle size={14} className="text-gold" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Your data is secured with high-level encryption</p>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
