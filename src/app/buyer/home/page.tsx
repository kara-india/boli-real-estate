'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, ArrowRight, BadgeCheck, Building2, CheckCircle2, ChevronRight, Clock, Filter, Heart, Home, Info, MapPin, MessageSquare, Navigation, Phone, Plus, Search, Share2, ShieldCheck, Sparkles, Star, TrendingUp, Users, Zap
} from 'lucide-react';
import ContactGatedModal from '@/components/leads/ContactGatedModal';
import { useRouter } from 'next/navigation';

export default function BuyerHomePage() {
    const [activeTab, setActiveTab] = useState<'properties' | 'listers'>('properties');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [locality, setLocality] = useState('Mira Road East');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const router = useRouter();

    const openContactModal = (prop: any) => {
        setSelectedProperty(prop);
        setIsContactModalOpen(true);
    };

    useEffect(() => {
        fetchData();
        // Requirement Event: buyer_home_view
        console.log(`[EVENT] buyer_home_view: ${activeTab}, locality: ${locality}`);
    }, [activeTab, locality]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/buyer/home?tab=${activeTab}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Search Section */}
            <section className="bg-gray-900 text-white pt-32 pb-20 px-6 rounded-b-[4rem] relative overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] -mr-20 -mt-20" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-[0.2em] mb-4">
                                <Navigation size={14} /> Mira Road • Staging
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none">
                                {activeTab === 'properties' ? 'FIND YOUR' : 'TOP RATED'} <br />
                                <span className="text-gold">{activeTab === 'properties' ? 'DREAM HOME' : 'LISTERS'}</span>
                            </h1>
                        </div>

                        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-3xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('properties')}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Home size={16} /> Properties
                            </button>
                            <button
                                onClick={() => setActiveTab('listers')}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'listers' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Users size={16} /> Listers
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-4xl bg-white rounded-[2.5rem] p-3 shadow-2xl flex flex-col md:flex-row items-center gap-3">
                        <div className="flex-1 w-full flex items-center gap-4 px-6 border-r border-gray-100">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search localities, buildings..."
                                className="w-full py-4 text-gray-900 font-bold border-none focus:ring-0 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="w-full md:w-auto flex items-center gap-4 px-6">
                            <MapPin className="text-gold" size={20} />
                            <select
                                className="bg-transparent text-gray-900 font-black text-xs uppercase tracking-widest border-none focus:ring-0 appearance-none cursor-pointer"
                                value={locality}
                                onChange={(e) => setLocality(e.target.value)}
                            >
                                <option>Mira Road East</option>
                                <option>Bhayandar East</option>
                                <option>Kashimira</option>
                                <option>Shanti Park</option>
                            </select>
                        </div>
                        <button className="w-full md:w-auto bg-gray-900 text-white p-5 rounded-[1.8rem] hover:bg-black transition-all">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Feed */}
            <main className="max-w-7xl mx-auto px-6 py-20">

                {activeTab === 'properties' ? (
                    <div className="space-y-20">
                        {/* Boosted Section */}
                        <div>
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Boosted Listings</h2>
                                </div>
                                <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gold flex items-center gap-2 transition-colors">
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data?.properties?.filter((p: any) => p.is_boosted).slice(0, 3).map((prop: any) => (
                                    <PropertyCard key={prop.id} property={prop} boosted onContact={openContactModal} />
                                ))}
                            </div>
                        </div>

                        {/* General Feed */}
                        <div>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                                    <TrendingUp size={20} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Explore {locality}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data?.properties?.filter((p: any) => !p.is_boosted).map((prop: any) => (
                                    <PropertyCard key={prop.id} property={prop} onContact={openContactModal} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* Listers Section */}
                        <div>
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                        <BadgeCheck size={20} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Verified Listers</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data?.listers?.map((lister: any) => (
                                    <ListerCard
                                        key={lister.id}
                                        lister={lister}
                                        onContact={() => openContactModal({
                                            id: lister.id,
                                            title: `Agent: ${lister.name}`,
                                            price: 0,
                                            location: lister.location,
                                            lister_id: lister.id,
                                            lister_name: lister.name,
                                            lister_phone: lister.phone || '+91 9999900000'
                                        })}
                                        onViewPage={() => router.push(`/golden/${lister.slug}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {selectedProperty && (
                <ContactGatedModal
                    isOpen={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    property={{
                        id: selectedProperty.id,
                        title: selectedProperty.title,
                        price: selectedProperty.price,
                        location: selectedProperty.location,
                        lister_id: selectedProperty.agent_id || selectedProperty.lister_id,
                        lister_name: selectedProperty.agent?.name || selectedProperty.name,
                        lister_phone: selectedProperty.agent?.phone || selectedProperty.phone || '+91 9999900000'
                    }}
                />
            )}
        </div>
    );
}

function PropertyCard({ property, boosted, onContact }: { property: any, boosted?: boolean, onContact?: (p: any) => void }) {
    return (
        <div className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${boosted ? 'border-gold shadow-2xl shadow-gold/5 ring-1 ring-gold/20' : 'border-gray-100 hover:shadow-xl'}`}>
            <div className="aspect-[4/3] relative overflow-hidden">
                <img
                    src={property.primary_image}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {boosted && (
                    <div className="absolute top-6 left-6 bg-gold text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Zap size={12} fill="currentColor" /> Boosted
                    </div>
                )}
                <button className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                    <Heart size={20} />
                </button>
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-1">{property.title}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-tight">
                            <MapPin size={12} /> {property.location}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-gray-900">₹{(property.price / 100000).toFixed(1)}L</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Price</div>
                    </div>
                </div>

                <div className="flex items-center gap-6 py-6 border-y border-gray-50 mb-8">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-900">{property.attrs?.beds}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BHK</span>
                    </div>
                    <div className="w-px h-8 bg-gray-50" />
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-900">{property.attrs?.area}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sqft</span>
                    </div>
                    <div className="w-px h-8 bg-gray-50" />
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-900">Ready</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={property.agent?.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-xs font-black text-gray-900 flex items-center gap-1">
                                {property.agent?.name} {property.agent?.verified && <ShieldCheck size={12} className="text-blue-500" />}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lister</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onContact?.(property)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                        See Details
                    </button>
                </div>
            </div>
        </div>
    );
}

function ListerCard({ lister, onContact, onViewPage }: { lister: any, onContact?: () => void, onViewPage?: () => void }) {
    return (
        <div className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:border-gold/20 transition-all duration-500 flex flex-col md:flex-row gap-8">
            <div className="w-32 h-32 bg-gray-50 rounded-[2rem] overflow-hidden relative border-4 border-white shadow-lg shrink-0">
                <img
                    src={lister.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400'}
                    className="w-full h-full object-cover"
                />
                {lister.rera_verified && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <ShieldCheck size={14} />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{lister.name}</h3>
                            <div className="bg-gold/10 text-gold text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                {lister.partner_type || 'Agent'}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4 leading-relaxed">{lister.bio}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-gold flex items-center gap-1 justify-end">
                            <Sparkles size={16} fill="currentColor" /> {lister.rating || '4.0'}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</div>
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900">{lister.total_listings}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listings</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 flex items-center gap-1">
                            <Clock size={12} className="text-gold" /> {lister.response_rate_percent}%
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-black text-gray-900 flex items-center gap-1">
                            <MapPin size={12} className="text-gold" /> 2.4km
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nearby</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onViewPage}
                        className="flex-1 bg-gold text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-dark transition-all shadow-lg shadow-gold/10"
                    >
                        View Golden Page
                    </button>
                    <button onClick={onContact} className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all">
                        <MessageSquare size={18} />
                    </button>
                    <button onClick={onContact} className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all">
                        <Phone size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
