'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Check, X, Eye, FileText,
    Search, Filter, ExternalLink, Loader2,
    AlertCircle, Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminVerificationPage() {
    const [pendingSellers, setPendingSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        // Mocking fetching pending profiles
        setLoading(true);
        // In real app: fetch from /api/profiles?status=pending&role=rera_seller
        setTimeout(() => {
            setPendingSellers([
                {
                    id: '1',
                    full_name: 'Rajesh Khanna',
                    business_name: 'Khanna Realty Mira',
                    rera_number: 'A51700012345',
                    pincode: '401107',
                    created_at: '2026-02-18T05:00:00Z'
                },
                {
                    id: '2',
                    full_name: 'Suresh Raina',
                    business_name: 'Blue Star Homes',
                    rera_number: 'A51700098765',
                    pincode: '401105',
                    created_at: '2026-02-18T06:30:00Z'
                }
            ]);
            setLoading(false);
        }, 800);
    };

    const handleAction = async (id: string, status: 'verified' | 'rejected') => {
        try {
            const res = await fetch('/api/admin/verify/rera', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_id: id, status, comments: 'Approved via Admin Queue' })
            });
            if (res.ok) {
                toast.success(`Seller ${status === 'verified' ? 'Approved' : 'Rejected'}`);
                setPendingSellers(prev => prev.filter(s => s.id !== id));
            }
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 text-white p-2 rounded-xl">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-gray-900">Admin Control</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">RERA Verification Queue</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="h-4 w-px bg-gray-100" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Growth Admin</span>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto p-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Pending Verifications</h2>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search Sellers..."
                                className="bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-0 focus:border-gold transition-all"
                            />
                        </div>
                        <button className="bg-white border border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-all">
                            <Filter size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <Loader2 className="animate-spin text-gold" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingSellers.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Universe is Balanced</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No pending RERA verifications at the moment.</p>
                            </div>
                        ) : (
                            pendingSellers.map(seller => (
                                <div key={seller.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8 group">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                                        <Building2 size={24} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-gray-900 leading-none">{seller.business_name}</h3>
                                            <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Pending Review</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Proprietor: {seller.full_name}</span>
                                            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500" /> {seller.rera_number}</span>
                                            <span>Locality: {seller.pincode}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                            <FileText size={14} /> View Document <ExternalLink size={12} />
                                        </button>
                                        <div className="h-8 w-px bg-gray-100 mx-2" />
                                        <button
                                            onClick={() => handleAction(seller.id, 'verified')}
                                            className="bg-green-500 text-white p-4 rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(seller.id, 'rejected')}
                                            className="bg-red-500 text-white p-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Audit / Help Note */}
                <div className="mt-20 p-8 bg-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -ml-20 -mt-20" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black italic uppercase leading-none mb-1">Security Alert</h4>
                            <p className="text-xs text-gray-400 font-medium">Always verify the RERA number against the official MahaRERA portal before approving.</p>
                        </div>
                    </div>
                    <button className="relative z-10 bg-gold text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
                        MahaRERA Portal
                    </button>
                </div>
            </main>
        </div>
    );
}
