'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new role-aware registration flow
        router.replace('/register');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
