'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function WishlistButton({ listingId }: { listingId: string }) {
    const { data: session } = useSession()
    const [isStarred, setIsStarred] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (session) {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then(data => {
                    if (data.wishlist) {
                        setIsStarred(data.wishlist.includes(listingId))
                    }
                })
        }
    }, [session, listingId])

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!session) {
            alert('Please login to star properties')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId })
            })
            const data = await res.json()
            if (data.status === 'added') setIsStarred(true)
            if (data.status === 'removed') setIsStarred(false)
        } catch (error) {
            console.error('Wishlist toggle error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isStarred
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                }`}
        >
            <span className="text-xl leading-none">{isStarred ? '★' : '☆'}</span>
        </button>
    )
}
