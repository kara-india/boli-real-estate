'use client'

import { SupabaseProvider } from '@/context/SupabaseContext'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SupabaseProvider>
            {children}
            <Toaster />
        </SupabaseProvider>
    )
}
