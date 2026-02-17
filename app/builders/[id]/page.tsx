'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Building2, CheckCircle, TrendingUp, Star, MapPin } from 'lucide-react'

export default function BuilderPage() {
    const { id } = useParams()

    // Mock builder data - in production, fetch from database
    const builder = {
        name: id?.toString().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Builder',
        logo: 'https://via.placeholder.com/150?text=Logo',
        reraRegistered: true,
        reraNumber: 'P51800000001',
        onTimeDelivery: 85,
        totalProjects: 25,
        completedProjects: 20,
        avgRating: 4.2,
        description: 'Leading real estate developer with a proven track record of delivering quality projects on time.',
        recentNews: [
            { title: 'New luxury project launched in Mira Road', date: '2026-02-10' },
            { title: 'Received RERA compliance certification', date: '2026-01-15' },
            { title: 'Completed 500+ units ahead of schedule', date: '2025-12-20' }
        ],
        projects: [
            { name: 'Skyline Towers', location: 'Mira Road', status: 'Completed', units: 200 },
            { name: 'Green Valley', location: 'Bhayandar', status: 'Ongoing', units: 150 },
            { name: 'Ocean View', location: 'Thane', status: 'Planning', units: 300 }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glass-dark p-8 rounded-2xl border border-white/10 mb-8">
                    <div className="flex items-start gap-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={builder.logo}
                            alt={builder.name}
                            className="w-24 h-24 rounded-xl border border-white/20"
                        />
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2 neon-text">{builder.name}</h1>
                            <p className="text-gray-400 mb-4">{builder.description}</p>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">RERA: {builder.reraNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <span className="text-sm">{builder.avgRating}/5.0 Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm">{builder.onTimeDelivery}% On-Time Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Projects */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Building2 className="text-blue-400" />
                                Projects
                            </h2>

                            <div className="space-y-4">
                                {builder.projects.map((project, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg">{project.name}</h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {project.location}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                    project.status === 'Ongoing' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">{project.units} units</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent News */}
                        <div className="glass-dark p-6 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6">Recent News & Updates</h2>

                            <div className="space-y-4">
                                {builder.recentNews.map((news, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <p className="font-semibold">{news.title}</p>
                                        <p className="text-sm text-gray-500">{news.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        <div className="glass-dark p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold mb-4">Statistics</h3>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Total Projects</p>
                                    <p className="text-2xl font-bold text-blue-400">{builder.totalProjects}</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-green-400">{builder.completedProjects}</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Success Rate</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {Math.round((builder.completedProjects / builder.totalProjects) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
