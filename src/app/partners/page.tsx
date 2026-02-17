'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Users, BadgeCheck, ShieldCheck, MapPin,
    MessageSquare, Phone, Sparkles, Star,
    Search, Filter, ChevronRight, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PartnersPage() {
    const [listers, setListers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('status', 'active')
                .order('is_boosted', { ascending: false })
                .order('verified', { ascending: false })
                .order('total_listings', { ascending: false });

            if (error) throw error;
            setListers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-gold/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-[10px] font-bold uppercase tracking-widest mb-3 border border-gold/20">
                            <Zap size={12} fill="currentColor" />
                            Premium Network
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            Smart <span className="text-gold-dark">Partners</span>
                        </h1>
                        <p className="text-gray-500 font-light max-w-xl">
                            Verified RERA authorized sellers and channel partners in Mira Road. Connect directly with the region&apos;s most active brokers.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or area..."
                                className="bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-0 focus:border-gold transition-all w-[300px]"
                            />
                        </div>
                        <button className="bg-white border border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-all text-gray-400">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {listers.map((lister) => (
                            <div
                                key={lister.id}
                                className={`group bg-white rounded-[2.5rem] border p-8 hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-8 relative overflow-hidden ${lister.is_boosted ? 'border-gold ring-1 ring-gold/20 shadow-xl shadow-gold/5' : 'border-gray-100'}`}
                            >
                                {lister.is_boosted && (
                                    <div className="absolute top-0 right-0 bg-gold text-white text-[8px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-[0.2em] flex items-center gap-1 shadow-xl">
                                        <Sparkles size={10} fill="currentColor" /> Boosted Partner
                                    </div>
                                )}

                                <div className="w-32 h-32 bg-gray-50 rounded-[2rem] overflow-hidden relative border-4 border-white shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={lister.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lister.name)}&background=212529&color=fff&size=128`}
                                        className="w-full h-full object-cover"
                                        alt={lister.name}
                                    />
                                    {lister.rera_verified && (
                                        <div className="absolute top-2 right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg" title="RERA Verified">
                                            <ShieldCheck size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">{lister.name}</h3>
                                                <div className="bg-gray-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                                    {lister.partner_type?.replace('_', ' ') || 'Authorized'}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4 leading-relaxed">{lister.bio}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gold flex items-center gap-1 justify-end">
                                                <Star size={16} fill="currentColor" /> {lister.rating || '4.0'}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-gray-900">{lister.total_listings || 0}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listings</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-gray-900">{lister.response_rate_percent || 90}%</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gold">
                                            <MapPin size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{lister.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => router.push(`/golden/${lister.slug}`)}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200"
                                        >
                                            View Golden Page
                                        </button>
                                        <button className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all">
                                            <MessageSquare size={18} />
                                        </button>
                                        <button className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all">
                                            <Phone size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Invite CTA */}
                <div className="mt-20 bg-gray-900 rounded-[4rem] p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px] -mr-20 -mt-20" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Users size={48} className="mx-auto text-gold mb-8" />
                        <h2 className="text-4xl font-extrabold mb-6 italic">Are you a Professional?</h2>
                        <p className="text-gray-400 mb-10 text-lg font-light leading-relaxed">
                            Join 1,200+ top brokers in MMR. Get your own Golden Page, boost your listings, and manage quality leads with ease.
                        </p>
                        <button
                            onClick={() => router.push('/register')}
                            className="bg-gold text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gold-dark hover:scale-105 transition-all shadow-2xl shadow-gold/20"
                        >
                            Establish Partnership
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
