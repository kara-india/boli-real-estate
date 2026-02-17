
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Upload, MapPin, Ruler, BedDouble, Bath, Car,
    ArrowUp, Rocket, Save, CheckCircle, AlertCircle,
    Loader2, Share2, MessageCircle, Info, ChevronRight,
    Eye, Building2, Landmark, Clock, Phone, DollarSign, MessageSquare, User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

// Types derived from schema
type ListingFormData = {
    title: string;
    property_type: string;
    transaction_type: string;
    price: number;
    negotiable: boolean;
    pincode: string;
    city: string;
    district: string;
    area: string;
    address: string;
    sqft: number;
    carpet_area?: number;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    floor: string;
    total_floors?: number;
    age_of_property?: number;
    short_description: string;
    full_description: string;
    amenities: string[];
    image_urls: string[];
    contact_person: string;
    show_phone_public: boolean;
    available_from: string;
};

const PROPERTY_TYPES = ['Apartment', 'Independent House', 'Plot', 'Commercial', 'Office', 'Shop', 'Other'];
const AMENITIES_LIST = ['Lift', 'Power Backup', 'Gym', 'Security', 'Park', 'Swimming Pool', 'Clubhouse', 'Intercom'];

export default function CreateListingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeoLoading, setIsGeoLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [geoData, setGeoData] = useState<{ cities: string[], district: string[], areas: string[] } | null>(null);
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);

    const [formData, setFormData] = useState<ListingFormData>({
        title: '',
        property_type: 'Apartment',
        transaction_type: 'Sale',
        price: 0,
        negotiable: false,
        pincode: '',
        city: '',
        district: '',
        area: '',
        address: '',
        sqft: 0,
        bedrooms: 2,
        bathrooms: 2,
        parking: 1,
        floor: '',
        short_description: '',
        full_description: '',
        amenities: [],
        image_urls: [],
        contact_person: '',
        show_phone_public: false,
        available_from: ''
    });

    // Calculate progress
    const requiredFields: (keyof ListingFormData)[] = ['title', 'property_type', 'transaction_type', 'price', 'pincode', 'city', 'area', 'sqft'];
    const completedRequired = requiredFields.filter(f => !!formData[f]).length;
    const progressPercent = Math.round((completedRequired / requiredFields.length) * 100);

    // Geo Lookup Logic
    useEffect(() => {
        if (formData.pincode.length === 6 && /^[1-9][0-9]{5}$/.test(formData.pincode)) {
            handleGeoLookup(formData.pincode);
        } else {
            setGeoData(null);
        }
    }, [formData.pincode]);

    const handleGeoLookup = async (pin: string) => {
        setIsGeoLoading(true);
        try {
            const res = await fetch(`/api/geo/lookup?pincode=${pin}`);
            const data = await res.json();
            if (!data.notFound) {
                setGeoData(data);
                setFormData(prev => ({
                    ...prev,
                    city: data.cities[0] || '',
                    district: data.district[0] || '',
                }));
                setIsManualLocation(false);
            } else {
                setGeoData(null);
                toast.error('Pincode not found in mapping.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeoLoading(false);
        }
    };

    // Autosave Logic
    const saveDraft = useCallback(async (data: ListingFormData) => {
        setIsSavingDraft(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const payload = {
                agent_id: user.id,
                content: data,
                percent_complete: progressPercent,
                last_saved_at: new Date().toISOString()
            };

            if (draftId) {
                await supabase.from('listing_drafts').update(payload).eq('id', draftId);
            } else {
                const { data: newDraft } = await supabase.from('listing_drafts').insert(payload).select().single();
                if (newDraft) setDraftId(newDraft.id);
            }
        } catch (err) {
            console.error('Draft save failed:', err);
        } finally {
            setIsSavingDraft(false);
        }
    }, [draftId, progressPercent]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.title) saveDraft(formData);
        }, 10000); // 10s debounce
        return () => clearTimeout(timer);
    }, [formData, saveDraft]);

    const handleWhatsAppShare = () => {
        const text = `Hi — I just listed a property on my Golden Page: ${window.location.origin}/listings/${publishedUrl}. See photos, price and send visit requests directly. Boost this listing for ₹1 today (limited). — ${formData.contact_person || 'Agent'}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handlePublish = async () => {
        if (progressPercent < 100) {
            toast.error('Please fill all required fields before publishing.');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const slug = `${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${formData.pincode}-${Date.now().toString().slice(-4)}`;

            const { data: newListing, error } = await supabase.from('properties').insert([{
                ...formData,
                owner_id: user.id,
                slug,
                location: `${formData.area}, ${formData.city}`,
                image_url: formData.image_urls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070'
            }]).select().single();

            if (error) throw error;

            setPublishedUrl(newListing.id);
            setShowSuccessModal(true);
            toast.success('Listing Published Successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Publish failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header & Progress */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Listing</h1>
                        <p className="text-gray-500 mt-1">Make it conversion-ready with accurate details.</p>
                    </div>
                    <div className="w-full md:w-64">
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-gray-500">
                            <span>{progressPercent < 80 ? 'Building Accuracy' : 'Boost-Ready'}</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gold transition-all duration-500 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        {progressPercent < 80 && (
                            <p className="text-[10px] text-gold-dark mt-2 font-bold uppercase tracking-tight">
                                Boost-ready: complete 80% to increase enquiries by 3x
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Form */}
                    <div className="flex-1 space-y-8">

                        {/* A. Basic Info */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <Plus size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Basic Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Listing Title*</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2BHK Sea View Apartment — Bandra West"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">8–120 characters needed for professional appeal.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Property Type*</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium appearance-none"
                                        value={formData.property_type}
                                        onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                                    >
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction*</label>
                                    <div className="flex gap-2">
                                        {['Sale', 'Rent'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setFormData({ ...formData, transaction_type: t })}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.transaction_type === t ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Asking Price (INR)*</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            placeholder="85,00,000"
                                            className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="negotiable"
                                            className="w-5 h-5 rounded-md text-gold focus:ring-gold"
                                            checked={formData.negotiable}
                                            onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                                        />
                                        <label htmlFor="negotiable" className="text-sm font-bold text-gray-700">Negotiable</label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* B. Location Logic */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <MapPin size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Location Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode*</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="400050"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        />
                                        {isGeoLoading && <Loader2 className="absolute right-4 top-4 animate-spin text-gold" size={20} />}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Enter the property&apos;s 6-digit pincode — this unlocks City, District & Area to improve search visibility.</p>
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                                    <select
                                        disabled={!geoData && !isManualLocation}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium appearance-none disabled:opacity-50"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    >
                                        {!formData.city && <option value="">Select City</option>}
                                        {geoData?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        {isManualLocation && <option value={formData.city}>{formData.city || 'Choose City'}</option>}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Area / Locality*</label>
                                    <select
                                        disabled={!geoData && !isManualLocation}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium appearance-none disabled:opacity-50"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    >
                                        <option value="">Select Area</option>
                                        {geoData?.areas.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-3">
                                    <button
                                        onClick={() => setIsManualLocation(true)}
                                        className="text-[10px] font-black text-gold border-b border-gold/50 uppercase tracking-widest hover:text-gold-dark"
                                    >
                                        Location incorrect? Add manually
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* C. Specs */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <Ruler size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Specifications</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Built-up sqft*</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 font-medium"
                                        value={formData.sqft || ''}
                                        onChange={(e) => setFormData({ ...formData, sqft: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bedrooms</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 font-medium appearance-none"
                                        value={formData.bedrooms}
                                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bathrooms</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium"
                                        value={formData.bathrooms}
                                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Parking</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium"
                                        value={formData.parking}
                                        onChange={(e) => setFormData({ ...formData, parking: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* D. Media */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <Upload size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Media Assets</h2>
                            </div>
                            <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                                <Info size={12} /> Add 8+ images to show every angle — listings with 8+ photos get 3× more messages.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button className="aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-100 transition-all">
                                    <Plus size={24} />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Add Image</span>
                                </button>
                                {/* Mock image thumbnails would go here */}
                            </div>
                        </section>

                        {/* E. Enrichment & Notes */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <MessageSquare size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Enrichment & Notes</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Short Description (140-300 chars)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Briefly highlight the best features of this property..."
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium resize-none"
                                        value={formData.short_description}
                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Public Description</label>
                                    <textarea
                                        rows={6}
                                        placeholder="Describe the property in detail. Mention repairs, occupancy status, and local advantages."
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-gold/50 transition-all font-medium resize-none"
                                        value={formData.full_description}
                                        onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 italic flex items-center gap-1.5 leading-relaxed">
                                        <Info size={12} /> Add recent repairs, occupancy status, and any broker offers — buyers trust details.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Key Amenities</label>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {AMENITIES_LIST.map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    const current = formData.amenities;
                                                    setFormData({
                                                        ...formData,
                                                        amenities: current.includes(item) ? current.filter(i => i !== item) : [...current, item]
                                                    });
                                                }}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.amenities.includes(item) ? 'bg-gold text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* F. Availability & Contact */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                    <User size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Availability & Contact</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available From</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium"
                                        onChange={(e) => setFormData({ ...formData, available_from: e.target.value as any })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Person Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium"
                                        placeholder="e.g. Rajesh Kumar"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            id="show_phone"
                                            className="w-5 h-5 rounded text-gold focus:ring-gold"
                                            checked={formData.show_phone_public}
                                            onChange={(e) => setFormData({ ...formData, show_phone_public: e.target.checked })}
                                        />
                                        <label htmlFor="show_phone" className="text-sm font-bold text-gray-700">Display my phone number publicly on this listing</label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Final Publish Actions */}
                        <div className="flex items-center justify-between pt-6">
                            <div className="flex items-center gap-3">
                                {isSavingDraft ? (
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Loader2 size={12} className="animate-spin" /> Saving Draft...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                        <CheckCircle size={12} /> Changes Saved
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handlePublish}
                                disabled={isLoading || progressPercent < 100}
                                className="bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-xs py-5 px-12 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 flex flex-col items-center gap-1"
                            >
                                <div className="flex items-center gap-3">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Rocket size={16} />}
                                    Publish & Share
                                </div>
                                <span className="text-[8px] font-bold text-gray-400 normal-case tracking-tight">Get buyer requests</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Live Preview (Sticky) */}
                    <div className="w-full lg:w-[450px]">
                        <div className="sticky top-28 space-y-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 flex justify-between items-center">
                                <span>Live Preview</span>
                                <Eye size={14} />
                            </div>

                            {/* Preview Card Mock */}
                            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative group">
                                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                    {formData.image_urls[0] ? (
                                        <img src={formData.image_urls[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Building2 size={64} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                                        {formData.property_type}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">
                                                {formData.title || 'Property Title Here'}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 uppercase font-bold tracking-tight">
                                                <MapPin size={12} /> {formData.area || 'Locality'}, {formData.city || 'City'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gold">
                                                ₹{(formData.price / 100000).toFixed(2)} L
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {formData.transaction_type}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-y border-gray-50 py-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-sm font-black text-gray-900">{formData.bedrooms}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rooms</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black text-gray-900">{formData.sqft}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sqft</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black text-gray-900">{formData.bathrooms}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Baths</div>
                                        </div>
                                    </div>

                                    <button className="w-full bg-gray-50 text-gray-400 border border-gray-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                                        Preview Mode Only
                                    </button>
                                </div>
                            </div>

                            {/* Growth Hack: Boost CTA */}
                            <div className="bg-black rounded-[2rem] p-6 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-gold text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Launch Offer</div>
                                        <span className="text-xs font-bold text-gray-400">Flash Boost</span>
                                    </div>
                                    <h4 className="text-lg font-black mb-2">Boost this for ₹1</h4>
                                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                                        Places your listing at the top for 24 hrs. Standard price ₹1000. Verified agents only.
                                    </p>
                                    <button className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl hover:bg-gold-dark transition-all">
                                        Promote Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
                    <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 sm:p-12 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                                <Rocket size={40} className="animate-bounce" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2 italic uppercase">Listing Live!</h3>
                            <p className="text-gray-500 mb-10 font-medium">Your property is now broadcasted to thousands of active bidders.</p>

                            <div className="bg-gray-50 rounded-3xl p-6 mb-10">
                                <div className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4">Share now to unlock a FREE Boost</div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleWhatsAppShare}
                                        className="w-full bg-[#25D366] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-green-200"
                                    >
                                        <MessageCircle size={20} />
                                        Share on WhatsApp
                                    </button>
                                    <button className="w-full bg-white border border-gray-100 text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                                        <Share2 size={18} />
                                        Copy Listing Link
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => router.push('/dashboard/seller')}
                                    className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>

                        {/* Boost Promo Footer */}
                        <div className="bg-gray-900 p-8 text-white flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Onboarding Offer</div>
                                <div className="text-lg font-black">Boost for ₹1</div>
                            </div>
                            <button className="bg-gold text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gold/20">
                                Promote Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Save Draft (Mobile Only) */}
            <button
                onClick={() => saveDraft(formData)}
                className="md:hidden fixed bottom-6 right-6 bg-white shadow-2xl border border-gray-100 rounded-full p-4 text-gold hover:scale-110 active:scale-95 transition-all z-50"
            >
                <Save size={24} />
            </button>
        </div>
    );
}
