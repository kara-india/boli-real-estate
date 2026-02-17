'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ShieldCheck, MapPin, Phone, MessageSquare,
    Clock, Share2, Star, Building2, BadgeCheck,
    CheckCircle2, Info, ArrowLeft, Plus, ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function GoldenPage() {
    const { slug } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [lister, setLister] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBuyer, setIsBuyer] = useState(false);

    useEffect(() => {
        checkAccessAndFetch();
    }, [slug]);

    const checkAccessAndFetch = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Not authenticated
                setLoading(false);
                return;
            }

            // Check if user is a Buyer
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'buyer') {
                setIsBuyer(true);
            }

            // Fetch Golden Page details
            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select('*')
                .eq('slug', slug)
                .single();

            if (agentError) throw agentError;
            setLister(agentData);

            // Fetch their listings
            const { data: propData } = await supabase
                .from('agent_listings')
                .select('*')
                .eq('agent_id', agentData.id)
                .eq('status', 'active');

            setListings(propData || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!isBuyer) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gold mb-8">
                <LockIcon size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tight italic uppercase">Exclusive Access</h1>
            <p className="text-gray-400 max-w-md mb-10 font-medium">This Golden Page is currently visible to logged-in Buyers only. Please sign in as a Buyer to view this profile and its listings.</p>
            <button
                onClick={() => router.push('/login')}
                className="bg-gold text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gold-dark transition-all shadow-xl shadow-gold/20"
            >
                Sign in as Buyer
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Brand Cover */}
            <header className="bg-gray-900 text-white pt-24 pb-40 relative px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -mr-20 -mt-20" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-12 transition-colors">
                        <ArrowLeft size={14} /> Back to Search
                    </button>

                    <div className="flex flex-col md:flex-row items-end gap-10">
                        <div className="w-40 h-40 bg-gray-100 rounded-[3rem] p-1 shadow-2xl relative shrink-0">
                            <img
                                src={lister?.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400'}
                                className="w-full h-full object-cover rounded-[2.8rem]"
                            />
                            {lister?.rera_verified && (
                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center border-4 border-gray-900 shadow-xl" title="RERA Verified">
                                    <ShieldCheck size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic">{lister?.name}</h1>
                                <div className="bg-gold text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                                    <BadgeCheck size={14} /> {lister?.partner_type || 'Authorized Seller'}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-gray-400 font-bold text-sm tracking-tight">
                                <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gold" /> {lister?.location}</div>
                                <div className="flex items-center gap-1.5"><Clock size={16} className="text-gold" /> Response: Under 1 hour</div>
                                <div className="flex items-center gap-1.5"><Star size={16} className="text-gold fill-gold" /> 4.9 (124 reviews)</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="bg-white/10 hover:bg-white/20 p-5 rounded-3xl backdrop-blur-md transition-all">
                                <Share2 size={24} />
                            </button>
                            <button className="bg-gold text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <MessageSquare size={20} /> Message
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side: Info */}
                <div className="lg:col-span-8 space-y-8 text-gray-900">

                    {/* Bio & Services */}
                    <section className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-black mb-6 tracking-tight italic uppercase">About Agency</h2>
                        <p className="text-gray-600 leading-relaxed font-medium mb-10">{lister?.bio}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Primary Service Areas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Mira Road East', 'Bhayandar', 'Kanakia', 'Beverly Park'].map(area => (
                                        <span key={area} className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-xs font-bold border border-gray-100">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Certifications</h4>
                                <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-widest">
                                    <ShieldCheck size={16} /> RERA Registration: {lister?.rera_number || 'Applied'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Listings Feed */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight italic uppercase">Active Listings ({listings.length})</h2>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border border-gray-100">
                                Sorted by Boosted
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {listings.map(prop => (
                                <div key={prop.id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img src={prop.primary_image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        {prop.is_boosted && (
                                            <div className="absolute top-5 left-5 bg-gold text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Boosted</div>
                                        )}
                                    </div>
                                    <div className="p-8">
                                        <h4 className="text-lg font-black mb-1">{prop.title}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-4">{prop.location}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-black text-gold">₹{(prop.price / 100000).toFixed(1)}L</span>
                                            <button className="text-gray-900 hover:text-gold transition-colors"><ArrowRight size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {listings.length === 0 && (
                                <div className="col-span-full bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem] py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                                        <Plus size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No active listings yet</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">This lister is currently updating their portfolio.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* Right Side: Quick Contact Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-10 space-y-8">
                        <div className="bg-gray-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h3 className="text-xl font-black mb-2 tracking-tight">Direct Contact</h3>
                            <p className="text-gray-400 text-xs font-medium leading-relaxed mb-10">Get priority response for your property enquiries.</p>

                            <div className="space-y-4 mb-10">
                                <button className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gold-dark transition-all shadow-xl shadow-gold/20">
                                    <Phone size={16} /> Call Representative
                                </button>
                                <button className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                    <CheckCircle2 size={16} /> Request Callback
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-normal">
                                    Identity & Credentials <br />
                                    <span className="text-white">Verified by Platform</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Note (Requirement UI) */}
                        <div className="p-8 bg-gold/5 rounded-[2rem] border border-gold/10">
                            <div className="flex gap-3 text-gold">
                                <Info size={18} className="shrink-0 mt-1" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    Visible to logged-in Buyers — login to message this lister or see phone numbers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function LockIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );
}
