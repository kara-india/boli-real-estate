import React from 'react';

export default function BuyerDashboard() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BidMetric <span className="text-yellow-500">Buyer</span></h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Karan Jha</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">My Site Visits</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your scheduled property tours and cab logistics.</p>
                </div>

                {/* Active Visit Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

                    {/* Status Banner */}
                    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        <span className="text-yellow-700 font-semibold text-sm uppercase tracking-wider">Cab Confirmed & En Route</span>
                    </div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Property & Timing Details */}
                        <div className="space-y-6">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Destination</span>
                                <h3 className="text-2xl font-bold text-slate-900">Rustomjee Elements</h3>
                                <p className="text-slate-500 mt-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Andheri West, Mumbai (3BHK Tour)
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Time</span>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Tomorrow, 2:00 PM
                                    </div>
                                </div>

                                {/* Check-In OTP Block */}
                                <div className="bg-yellow-500 rounded-xl p-4 text-white flex-1 relative overflow-hidden shadow-lg shadow-yellow-500/30">
                                    <div className="absolute -right-4 -top-4 opacity-20 w-16 h-16 rounded-full bg-white blur-xl"></div>
                                    <span className="text-xs font-bold text-yellow-100 uppercase block mb-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        Check-in OTP
                                    </span>
                                    <div className="text-3xl font-mono font-bold tracking-[0.2em]">4592</div>
                                    <p className="text-[10px] text-yellow-100 mt-1 leading-tight">Share this at the site for biometric check-in.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Cab Logistics Component */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                            {/* Map Placeholder Graphic */}
                            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                        Cab Logistics
                                    </h4>
                                    <span className="text-xs bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm font-medium text-slate-600">Pick-up at 1:15 PM</span>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                                        👨🏽‍✈️
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Ramesh K.</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="text-yellow-500">★</span> 4.9 • Swift Dzire
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-slate-100 text-slate-900 font-mono text-sm px-2 py-1 rounded border border-slate-200 tracking-wider">
                                            MH 04 AB 1234
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-white border text-center border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-all shadow-sm">
                                        Contact Driver
                                    </button>
                                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer">
                                        Reschedule Visit
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
