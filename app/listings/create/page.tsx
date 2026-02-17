
'use client'


import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2, MapPin, DollarSign, PenTool, Layout } from 'lucide-react'

export default function CreateListingPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        sqft: '',
        type: 'Apartment',
        bedrooms: '',
        bathrooms: '',
        image_url: 'https://images.unsplash.com/photo-1600596542815-22b8c80b43bd?q=80&w=2670&auto=format&fit=crop' // Default placeholder
    })

    const supabase = createClient()
    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Please log in to list a property')
                router.push('/login')
                return
            }

            // 2. Insert into 'properties' table
            const { error } = await supabase
                .from('properties')
                .insert([
                    {
                        title: formData.title,
                        description: formData.description,
                        price: parseFloat(formData.price), // Store as numeric without commas
                        location: formData.location,
                        sqft: parseInt(formData.sqft),
                        type: formData.type,
                        bedrooms: parseInt(formData.bedrooms),
                        bathrooms: parseInt(formData.bathrooms),
                        image_url: formData.image_url,
                        owner_id: session.user.id,
                        status: 'active'
                    }
                ])
                .select()

            if (error) throw error

            toast.success('Property listed successfully!')
            router.push('/dashboard/seller') // Redirect to seller dashboard to see it
        } catch (error: unknown) {
            console.error('Error creating listing:', error)
            const message = error instanceof Error ? error.message : 'Failed to create listing'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl mx-auto glass-dark p-8 rounded-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 neon-text text-center">List New Property</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Property Title</label>
                        <div className="relative">
                            <PenTool className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Luxury 3BHK in Bandra West"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe main features, view, amenities..."
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Asking Price (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 15000000"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Location/Area</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Mira Road, Thane"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Specs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Sqft</label>
                            <input
                                type="number"
                                name="sqft"
                                required
                                value={formData.sqft}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                required
                                value={formData.bedrooms}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                required
                                value={formData.bathrooms}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            >
                                <option value="Apartment">Apartment</option>
                                <option value="Villa">Villa</option>
                                <option value="Penthouse">Penthouse</option>
                                <option value="Studio">Studio</option>
                            </select>
                        </div>
                    </div>

                    {/* Image URL (Simple for MVP) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
                        <div className="relative">
                            <Layout className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="url"
                                name="image_url"
                                required
                                value={formData.image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hosting on Unsplash or similar recommended for MVP.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Publish Listing'}
                    </button>

                </form>
            </div>
        </div>
    )
}
