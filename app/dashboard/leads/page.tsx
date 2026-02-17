'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, TrendingUp, Sparkles, Filter, Search,
    MessageSquare, Phone, MapPin, Calendar,
    ChevronRight, BadgeInfo, CheckCircle2,
    AlertCircle, DollarSign, Wallet
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ListerLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchLeadsAndWallet();
    }, []);

    const fetchLeadsAndWallet = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Agent ID first
            const { data: agent } = await supabase
                .from('agents')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!agent) return;

            // 1. Fetch Wallet
            const { data: walletData } = await supabase
                .from('agent_wallets')
                .select('*')
                .eq('agent_id', agent.id)
                .single();
            setWallet(walletData);

            // 2. Fetch Leads
            const { data: leadsData } = await supabase
                .from('leads')
                .select(`
          *,
          property:agent_listings(title, location, price)
        `)
                .eq('lister_id', agent.id)
                .order('created_at', { ascending: false });

            setLeads(leadsData || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (leadId: string, status: string) => {
        const { error } = await supabase
            .from('leads')
            .update({ brokerage_status: status })
            .eq('id', leadId);

        if (!error) {
            setLeads(leads.map(l => l.id === leadId ? { ...l, brokerage_status: status } : l));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <nav className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-lg shadow-gray-200">
                        <Users size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-gray-900">Lead Center</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Manage your pipeline</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Wallet Balance</span>
                        <div className="flex items-center gap-1.5 text-gold">
                            <Wallet size={14} />
                            <span className="text-lg font-black tracking-tight leading-none italic">₹{wallet?.balance_credits || 0}</span>
                        </div>
                    </div>
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                        Recharge
                    </button>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto p-10">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Leads', val: leads.length, icon: Users, color: 'text-blue-500' },
                        { label: 'Hot Leads', val: leads.filter(l => l.lead_score >= 15).length, icon: Sparkles, color: 'text-gold' },
                        { label: 'Closed Deals', val: leads.filter(l => l.brokerage_status === 'closed').length, icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Free Credits', val: wallet?.free_leads_remaining || 0, icon: TrendingUp, color: 'text-purple-500' }
                    ].map(stat => (
                        <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                            <div className={`p-4 rounded-2xl bg-gray-50 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-black italic tracking-tighter text-gray-900">{stat.val}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and List */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Active Pipeline</h2>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search Buyers..."
                                className="bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-0 focus:border-gold transition-all"
                            />
                        </div>
                        <button className="bg-white border border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-all text-gray-400">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leads.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 italic">Waiting for Magic</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No leads have been generated yet. Boost your listings to get visibility!</p>
                            </div>
                        ) : (
                            leads.map(lead => (
                                <div key={lead.id} className={`bg-white rounded-[2.5rem] border p-10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-10 group overflow-hidden relative ${lead.lead_score >= 15 ? 'border-gold/30 ring-1 ring-gold/5' : 'border-gray-100'}`}>

                                    {lead.lead_score >= 15 && (
                                        <div className="absolute top-0 right-0 bg-gold text-white text-[8px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                                            <Sparkles size={10} fill="currentColor" /> High Quality Lead
                                        </div>
                                    )}

                                    <div className="shrink-0 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gray-900 text-white rounded-[1.8rem] flex items-center justify-center mb-4 text-2xl font-black italic border-4 border-gray-50 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                            {lead.buyer_name.charAt(0)}
                                        </div>
                                        <div className="bg-gray-100 text-[10px] font-bold text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest mb-2">Score</div>
                                        <div className={`text-xl font-black italic ${lead.lead_score >= 15 ? 'text-gold' : 'text-gray-900'}`}>{lead.lead_score}</div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none italic">{lead.buyer_name}</h3>
                                            <div className="h-4 w-px bg-gray-100" />
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <Calendar size={14} className="text-gold" /> {new Date(lead.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 py-6 border-y border-gray-50">
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Intent</div>
                                                <div className="text-xs font-black text-gray-900">{lead.intent_reason}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timeline</div>
                                                <div className="text-xs font-black text-gray-900">{lead.timeline}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loan Interest</div>
                                                <div className="text-xs font-black text-gray-900">{lead.home_loan_interest ? 'Yes' : 'No'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Site Visit</div>
                                                <div className="text-xs font-black text-gray-900">{lead.site_visit_interest ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                                            <MapPin size={14} className="text-gold" />
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                Enquired for: <span className="text-gray-900 font-black">{lead.property?.title}</span> • ₹{(lead.property?.price / 100000).toFixed(1)}L
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <button className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                                                <Phone size={14} /> Call {lead.buyer_phone}
                                            </button>
                                            <button className="flex items-center gap-3 bg-white border border-gray-100 text-gray-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                                                <MessageSquare size={14} /> Send PDF
                                            </button>
                                            <div className="h-8 w-px bg-gray-100 mx-2" />
                                            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                                <button
                                                    onClick={() => updateStatus(lead.id, 'contacted')}
                                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lead.brokerage_status === 'contacted' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                                >Contacted</button>
                                                <button
                                                    onClick={() => updateStatus(lead.id, 'closed')}
                                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lead.brokerage_status === 'closed' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-gray-600'}`}
                                                >Closed Deal</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Lead Billing Protection */}
                <div className="mt-20 p-10 bg-gray-900 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px] -ml-20 -mt-20" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gold">
                                <DollarSign size={20} />
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tight">Billing Transparency</h4>
                        </div>
                        <p className="text-gray-400 text-xs font-medium max-w-md leading-relaxed">
                            You are currently on the <span className="text-white font-black italic uppercase">Pay Per Lead</span> plan.
                            Each unique lead deducts ₹250 from your balance. High score leads are highlighted automatically.
                        </p>
                    </div>
                    <div className="relative z-10 flex gap-4">
                        <button className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3">
                            <BadgeInfo size={16} /> Billing History
                        </button>
                        <button className="bg-gold text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
