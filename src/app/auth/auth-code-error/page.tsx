'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const errorMsg = searchParams.get('error') || 'We couldn\'t exchange the login code for a valid session.';

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <ShieldAlert size={40} />
                </div>

                <h1 className="text-3xl font-black mb-4 tracking-tight uppercase italic">Authentication Failed</h1>
                <p className="text-gray-400 mb-10 font-medium leading-relaxed">
                    {errorMsg}
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/login"
                        className="w-full bg-gold text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                            Check if <span className="text-white">NEXT_PUBLIC_SUPABASE_URL</span> and <span className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> are set in your .env.local file.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
